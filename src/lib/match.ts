import mammoth from "mammoth";
import WordExtractor from "word-extractor";

type OutputItem = { content?: { text?: string }[] };

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type Kind = "pdf" | "docx" | "doc";

function parseDataUrl(url: string): { mime: string; buffer: Buffer } | null {
  const m = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], buffer: Buffer.from(m[2], "base64") };
}

function detectKind(mime: string, name: string): Kind | null {
  const n = name.toLowerCase();
  if (mime === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (mime === DOCX_MIME || n.endsWith(".docx")) return "docx";
  if (mime === "application/msword" || n.endsWith(".doc")) return "doc";
  return null;
}

async function extractWordText(
  kind: "docx" | "doc",
  buffer: Buffer,
): Promise<string> {
  try {
    if (kind === "docx") {
      const { value } = await mammoth.extractRawText({ buffer });
      return value.trim();
    }
    const doc = await new WordExtractor().extract(buffer);
    return doc.getBody().trim();
  } catch {
    return "";
  }
}

export async function scoreCvMatch(opts: {
  cvDataUrl: string;
  cvName: string;
  jobTitle: string;
  jobDescription: string;
}): Promise<number | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const parsed = parseDataUrl(opts.cvDataUrl);
  if (!parsed) return null;
  const kind = detectKind(parsed.mime, opts.cvName || "");
  if (!kind) return null;

  const prompt =
    "Voce e um recrutador tecnico. Avalie a compatibilidade entre o " +
    "curriculo (anexado ou transcrito abaixo) e a vaga, considerando " +
    "experiencia, habilidades e senioridade.\n\n" +
    `Vaga: ${opts.jobTitle}\n` +
    `Descricao: ${opts.jobDescription || "(sem descricao)"}\n\n` +
    "Responda APENAS um numero inteiro de 0 a 100, sem nenhum outro texto.";

  let content: Record<string, unknown>[];
  if (kind === "pdf") {
    content = [
      {
        type: "input_file",
        filename: opts.cvName || "curriculo.pdf",
        file_data: opts.cvDataUrl,
      },
      { type: "input_text", text: prompt },
    ];
  } else {
    const text = await extractWordText(kind, parsed.buffer);
    if (!text) return null;
    content = [
      {
        type: "input_text",
        text: `Curriculo (texto extraido do arquivo):\n"""\n${text.slice(0, 20000)}\n"""\n\n${prompt}`,
      },
    ];
  }

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [{ role: "user", content }],
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      output_text?: string;
      output?: OutputItem[];
    };
    const text =
      typeof data.output_text === "string"
        ? data.output_text
        : (data.output ?? [])
            .flatMap((o) => o.content ?? [])
            .map((c) => c.text ?? "")
            .join(" ");

    const match = String(text).match(/\d{1,3}/);
    if (!match) return null;
    return Math.min(100, Math.max(0, parseInt(match[0], 10)));
  } catch {
    return null;
  }
}

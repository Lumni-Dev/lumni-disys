// Compatibilidade curriculo x vaga via OpenAI (melhor esforco: qualquer
// falha vira null e a candidatura segue normal). O PDF vai direto para o
// modelo pela Responses API, sem parser local; apenas PDFs sao analisados.

type OutputItem = { content?: { text?: string }[] };

export async function scoreCvMatch(opts: {
  cvDataUrl: string;
  cvName: string;
  jobTitle: string;
  jobDescription: string;
}): Promise<number | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  if (!opts.cvDataUrl.startsWith("data:application/pdf")) return null;

  const prompt =
    "Voce e um recrutador tecnico. Avalie a compatibilidade entre o " +
    "curriculo anexado e a vaga abaixo, considerando experiencia, " +
    "habilidades e senioridade.\n\n" +
    `Vaga: ${opts.jobTitle}\n` +
    `Descricao: ${opts.jobDescription || "(sem descricao)"}\n\n` +
    "Responda APENAS um numero inteiro de 0 a 100, sem nenhum outro texto.";

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                filename: opts.cvName || "curriculo.pdf",
                file_data: opts.cvDataUrl,
              },
              { type: "input_text", text: prompt },
            ],
          },
        ],
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

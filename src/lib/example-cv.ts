// Gera um PDF minimo (sem dependencias) usado como curriculo de exemplo da
// candidata "Ana Maria Silva (exemplo)" das contas novas, para demonstrar o
// botao de baixar curriculo.

const esc = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

export const EXAMPLE_CV_NAME = "curriculo-ana-maria-exemplo.pdf";

export function exampleCvDataUrl(): string {
  const title = "Ana Maria Silva (exemplo)";
  const subtitle = "Desenvolvedora Full Stack";
  const body = [
    "ana.exemplo@lumni.dev.br  |  Sao Paulo, SP",
    "",
    "Curriculo de exemplo gerado pelo DISYS para demonstrar o anexo de",
    "curriculo nas candidaturas. Edite ou exclua quando quiser.",
    "",
    "Experiencia",
    "-  Empresa Lumni Dev (exemplo): desenvolvimento web full stack",
    "-  Aplicacoes com React, Next.js e PostgreSQL",
    "",
    "Formacao",
    "-  Bacharelado em Ciencia da Computacao",
  ];

  let text = `BT /F1 18 Tf 56 780 Td (${esc(title)}) Tj ET\n`;
  text += `BT /F1 12 Tf 56 756 Td (${esc(subtitle)}) Tj ET\n`;
  let y = 720;
  for (const line of body) {
    if (line) text += `BT /F1 11 Tf 56 ${y} Td (${esc(line)}) Tj ET\n`;
    y -= 18;
  }

  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${text.length} >>\nstream\n${text}endstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const [i, obj] of objs.entries()) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  }
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return `data:application/pdf;base64,${Buffer.from(pdf, "ascii").toString("base64")}`;
}

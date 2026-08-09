import { NextResponse } from "next/server";
import { signDataToken } from "@/lib/data-rights";
import { sendDataRightsEmail } from "@/lib/mail";
import { isEmail } from "@/lib/validation";

// Solicitacao LGPD do titular: gera um token assinado e envia por e-mail um
// link de confirmacao. Resposta sempre generica (nao revela se o email existe).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  const kind = body?.kind === "delete" ? "delete" : "export";

  if (isEmail(email)) {
    const token = signDataToken(email, kind);
    const origin = new URL(req.url).origin;
    const url = `${origin}/privacidade/confirmar?token=${encodeURIComponent(token)}`;
    try {
      await sendDataRightsEmail({ to: email, url, kind });
    } catch {
      // Falha de envio nao deve vazar informacao ao chamador.
    }
  }

  return NextResponse.json({ ok: true });
}

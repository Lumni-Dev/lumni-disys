import { createHmac, timingSafeEqual } from "crypto";

// Token assinado (stateless) para o candidato confirmar exportacao/exclusao dos
// proprios dados por e-mail, sem precisar de tabela. Expira em 1h.
const SECRET = process.env.AUTH_SECRET ?? "dev-secret";
const TTL_MS = 60 * 60 * 1000;

export type DataRightKind = "export" | "delete";
type Payload = { e: string; k: DataRightKind; x: number };

function sign(body: string): string {
  return createHmac("sha256", SECRET).update(body).digest("base64url");
}

export function signDataToken(email: string, kind: DataRightKind): string {
  const payload: Payload = {
    e: email.trim().toLowerCase(),
    k: kind,
    x: Date.now() + TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyDataToken(
  token: string,
): { email: string; kind: DataRightKind } | null {
  const [body, sig] = (token ?? "").split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let p: Payload;
  try {
    p = JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
  if (
    !p ||
    typeof p.e !== "string" ||
    (p.k !== "export" && p.k !== "delete") ||
    typeof p.x !== "number" ||
    Date.now() > p.x
  )
    return null;
  return { email: p.e, kind: p.k };
}

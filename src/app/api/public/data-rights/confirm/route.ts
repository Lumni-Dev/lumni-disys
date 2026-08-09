import { NextResponse } from "next/server";
import { inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { verifyDataToken } from "@/lib/data-rights";

// Confirma a solicitacao LGPD: exporta (direito de acesso) ou exclui
// (direito de eliminacao) TODOS os registros do candidato com aquele e-mail,
// em qualquer workspace. Requer o token assinado enviado por e-mail.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const v = verifyDataToken(String(body?.token ?? ""));
  if (!v)
    return NextResponse.json(
      { error: "invalid_or_expired" },
      { status: 400 },
    );

  const match = sql`lower(${schema.candidates.email}) = ${v.email}`;
  const rows = await db.select().from(schema.candidates).where(match);

  if (v.kind === "export") {
    const data = rows.map((r) => ({
      name: r.name,
      email: r.email,
      phone: r.phone,
      linkedin: r.linkedin,
      role: r.role,
      stage: r.stage,
      cvName: r.cvName,
      matchScore: r.matchScore,
      appliedAt: r.createdAt,
      consentAt: r.consentAt,
    }));
    return NextResponse.json({ ok: true, kind: "export", data });
  }

  const ids = rows.map((r) => r.id);
  if (ids.length) {
    await db
      .delete(schema.pipelineCards)
      .where(inArray(schema.pipelineCards.candidateId, ids));
    await db
      .delete(schema.candidates)
      .where(inArray(schema.candidates.id, ids));
  }
  return NextResponse.json({ ok: true, kind: "delete", deleted: ids.length });
}

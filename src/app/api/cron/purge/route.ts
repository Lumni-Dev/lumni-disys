import { NextResponse } from "next/server";
import { inArray, lt } from "drizzle-orm";
import { db, schema } from "@/db";

// Expurgo LGPD (retencao): apaga candidatos (e seus cards) mais antigos que o
// periodo de retencao. Chamado pelo Vercel Cron. Protegido por CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days = Number(process.env.CANDIDATE_RETENTION_DAYS) || 365;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const old = await db
    .select({ id: schema.candidates.id })
    .from(schema.candidates)
    .where(lt(schema.candidates.createdAt, cutoff));
  const ids = old.map((r) => r.id);

  if (ids.length) {
    await db
      .delete(schema.pipelineCards)
      .where(inArray(schema.pipelineCards.candidateId, ids));
    await db.delete(schema.candidates).where(inArray(schema.candidates.id, ids));
  }

  return NextResponse.json({
    ok: true,
    purged: ids.length,
    days,
    cutoff: cutoff.toISOString(),
  });
}

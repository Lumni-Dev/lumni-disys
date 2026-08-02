import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";
import { accountByToken } from "@/lib/account";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.json([]);

  const account = await accountByToken(token);
  if (!account) return NextResponse.json([]);

  // Filtro opcional por vaga (link publico de uma vaga especifica).
  const idParam = Number(url.searchParams.get("id"));
  const conditions = [
    eq(schema.jobs.accountId, account.id),
    eq(schema.jobs.status, "Aberta"),
  ];
  if (Number.isFinite(idParam) && idParam > 0) {
    conditions.push(eq(schema.jobs.id, idParam));
  }

  const rows = await db
    .select()
    .from(schema.jobs)
    .where(and(...conditions))
    .orderBy(asc(schema.jobs.id));
  return NextResponse.json(rows.map(serializeJob));
}

import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";
import { accountByToken } from "@/lib/account";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json([]);

  const account = await accountByToken(token);
  if (!account) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(schema.jobs)
    .where(
      and(
        eq(schema.jobs.accountId, account.id),
        eq(schema.jobs.status, "Aberta"),
      ),
    )
    .orderBy(asc(schema.jobs.id));
  return NextResponse.json(rows.map(serializeJob));
}

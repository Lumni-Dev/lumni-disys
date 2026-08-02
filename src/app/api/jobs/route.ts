import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";
import { authorize } from "@/lib/authz";

export async function GET() {
  const { account, response } = await authorize("jobs", "view");
  if (!account) return response;

  const rows = await db
    .select()
    .from(schema.jobs)
    .where(eq(schema.jobs.accountId, account.id))
    .orderBy(asc(schema.jobs.id));
  return NextResponse.json(rows.map(serializeJob));
}

export async function POST(req: Request) {
  const { account, response } = await authorize("jobs", "create");
  if (!account) return response;

  const body = await req.json();
  const [row] = await db
    .insert(schema.jobs)
    .values({
      accountId: account.id,
      title: body.title,
      company: body.company ?? "",
      type: body.type ?? "Remoto",
      level: body.level ?? "Pleno",
      openings: Number(body.openings) || 1,
      // applicants nasce em 0 e so cresce com candidaturas reais.
      status: body.status ?? "Aberta",
    })
    .returning();
  return NextResponse.json(serializeJob(row), { status: 201 });
}

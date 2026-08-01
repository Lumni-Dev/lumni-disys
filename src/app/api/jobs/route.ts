import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";
import { currentAccount } from "@/lib/account";

export async function GET() {
  const account = await currentAccount();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(schema.jobs)
    .where(eq(schema.jobs.accountId, account.id))
    .orderBy(asc(schema.jobs.id));
  return NextResponse.json(rows.map(serializeJob));
}

export async function POST(req: Request) {
  const account = await currentAccount();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const [row] = await db
    .insert(schema.jobs)
    .values({
      accountId: account.id,
      title: body.title,
      company: body.company ?? "",
      type: body.type ?? "Remoto",
      level: body.level ?? "Pleno",
      applicants: Number(body.applicants) || 0,
      status: body.status ?? "Aberta",
    })
    .returning();
  return NextResponse.json(serializeJob(row), { status: 201 });
}

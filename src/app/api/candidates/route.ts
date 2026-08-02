import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCandidate } from "@/db/serializers";
import { authorize } from "@/lib/authz";

export async function GET() {
  const { account, response } = await authorize("candidates", "view");
  if (!account) return response;

  // Sem o cv_base64 na listagem (pode pesar megabytes); vai so o flag.
  const rows = await db
    .select({
      id: schema.candidates.id,
      name: schema.candidates.name,
      role: schema.candidates.role,
      email: schema.candidates.email,
      stage: schema.candidates.stage,
      linkedin: schema.candidates.linkedin,
      updatedAt: schema.candidates.updatedAt,
      hasCv: sql<boolean>`${schema.candidates.cvBase64} <> ''`,
    })
    .from(schema.candidates)
    .where(eq(schema.candidates.accountId, account.id))
    .orderBy(asc(schema.candidates.id));
  return NextResponse.json(rows.map(serializeCandidate));
}

export async function POST(req: Request) {
  const { account, response } = await authorize("candidates", "create");
  if (!account) return response;

  const body = await req.json();
  const [row] = await db
    .insert(schema.candidates)
    .values({
      accountId: account.id,
      name: body.name,
      role: body.role ?? "",
      email: body.email ?? "",
      stage: body.stage ?? "Triagem",
      linkedin: body.linkedin ?? "",
    })
    .returning();
  return NextResponse.json(serializeCandidate(row), { status: 201 });
}

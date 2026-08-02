import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCompany } from "@/db/serializers";
import { authorize } from "@/lib/authz";

export async function GET() {
  const { account, response } = await authorize("companies", "view");
  if (!account) return response;

  const rows = await db
    .select()
    .from(schema.companies)
    .where(eq(schema.companies.accountId, account.id))
    .orderBy(asc(schema.companies.id));
  return NextResponse.json(rows.map(serializeCompany));
}

export async function POST(req: Request) {
  const { account, response } = await authorize("companies", "create");
  if (!account) return response;

  const body = await req.json();
  const [row] = await db
    .insert(schema.companies)
    .values({
      accountId: account.id,
      name: body.name,
      sector: body.sector ?? "",
      location: body.location ?? "",
      openings: Number(body.openings) || 0,
      status: body.status ?? "Ativa",
    })
    .returning();
  return NextResponse.json(serializeCompany(row), { status: 201 });
}

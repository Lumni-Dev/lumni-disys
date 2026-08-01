import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCompany } from "@/db/serializers";

export async function GET() {
  const rows = await db
    .select()
    .from(schema.companies)
    .orderBy(asc(schema.companies.id));
  return NextResponse.json(rows.map(serializeCompany));
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db
    .insert(schema.companies)
    .values({
      name: body.name,
      sector: body.sector ?? "",
      location: body.location ?? "",
      openings: Number(body.openings) || 0,
      status: body.status ?? "Ativa",
    })
    .returning();
  return NextResponse.json(serializeCompany(row), { status: 201 });
}

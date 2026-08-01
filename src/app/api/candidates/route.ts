import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCandidate } from "@/db/serializers";

export async function GET() {
  const rows = await db
    .select()
    .from(schema.candidates)
    .orderBy(asc(schema.candidates.id));
  return NextResponse.json(rows.map(serializeCandidate));
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db
    .insert(schema.candidates)
    .values({
      name: body.name,
      role: body.role ?? "",
      email: body.email ?? "",
      stage: body.stage ?? "Triagem",
      linkedin: body.linkedin ?? "",
    })
    .returning();
  return NextResponse.json(serializeCandidate(row), { status: 201 });
}

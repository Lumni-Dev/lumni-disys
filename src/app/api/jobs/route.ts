import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";

export async function GET() {
  const rows = await db.select().from(schema.jobs).orderBy(asc(schema.jobs.id));
  return NextResponse.json(rows.map(serializeJob));
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db
    .insert(schema.jobs)
    .values({
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

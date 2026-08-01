import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";

export async function GET() {
  const rows = await db
    .select()
    .from(schema.jobs)
    .where(eq(schema.jobs.status, "Aberta"))
    .orderBy(asc(schema.jobs.id));
  return NextResponse.json(rows.map(serializeJob));
}

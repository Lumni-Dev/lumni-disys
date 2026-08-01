import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeNotification } from "@/db/serializers";

export async function GET() {
  const rows = await db
    .select()
    .from(schema.notifications)
    .orderBy(desc(schema.notifications.createdAt), desc(schema.notifications.id));
  return NextResponse.json(rows.map(serializeNotification));
}

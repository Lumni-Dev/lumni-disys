import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeNotification } from "@/db/serializers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const id = Number((await params).id);
  const body = await req.json();
  const [row] = await db
    .update(schema.notifications)
    .set({ read: !!body.read })
    .where(eq(schema.notifications.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeNotification(row));
}

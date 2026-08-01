import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCandidate } from "@/db/serializers";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const id = Number((await params).id);
  const body = await req.json();
  const [row] = await db
    .update(schema.candidates)
    .set({
      name: body.name,
      role: body.role ?? "",
      email: body.email ?? "",
      stage: body.stage ?? "Triagem",
      linkedin: body.linkedin ?? "",
    })
    .where(eq(schema.candidates.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeCandidate(row));
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = Number((await params).id);
  await db.delete(schema.candidates).where(eq(schema.candidates.id, id));
  return NextResponse.json({ ok: true });
}

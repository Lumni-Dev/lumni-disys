import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const id = Number((await params).id);
  const body = await req.json();
  const [row] = await db
    .update(schema.jobs)
    .set({
      title: body.title,
      company: body.company ?? "",
      type: body.type ?? "Remoto",
      level: body.level ?? "Pleno",
      applicants: Number(body.applicants) || 0,
      status: body.status ?? "Aberta",
    })
    .where(eq(schema.jobs.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeJob(row));
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = Number((await params).id);
  await db.delete(schema.jobs).where(eq(schema.jobs.id, id));
  return NextResponse.json({ ok: true });
}

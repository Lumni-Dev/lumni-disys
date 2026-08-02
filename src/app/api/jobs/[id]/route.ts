import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";
import { authorize } from "@/lib/authz";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("jobs", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();
  const [row] = await db
    .update(schema.jobs)
    .set({
      title: body.title,
      company: body.company ?? "",
      type: body.type ?? "Remoto",
      level: body.level ?? "Pleno",
      openings: Number(body.openings) || 1,
      // applicants e contador automatico: a edicao nao mexe nele.
      status: body.status ?? "Aberta",
    })
    .where(and(eq(schema.jobs.id, id), eq(schema.jobs.accountId, account.id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeJob(row));
}

export async function DELETE(_req: Request, { params }: Params) {
  const { account, response } = await authorize("jobs", "delete");
  if (!account) return response;

  const id = Number((await params).id);
  await db
    .delete(schema.jobs)
    .where(and(eq(schema.jobs.id, id), eq(schema.jobs.accountId, account.id)));
  return NextResponse.json({ ok: true });
}

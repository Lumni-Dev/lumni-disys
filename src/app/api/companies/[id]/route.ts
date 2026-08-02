import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCompany } from "@/db/serializers";
import { authorize } from "@/lib/authz";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("companies", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();
  const [row] = await db
    .update(schema.companies)
    .set({
      name: body.name,
      sector: body.sector ?? "",
      location: body.location ?? "",
      openings: Number(body.openings) || 0,
      status: body.status ?? "Ativa",
    })
    .where(and(eq(schema.companies.id, id), eq(schema.companies.accountId, account.id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeCompany(row));
}

export async function DELETE(_req: Request, { params }: Params) {
  const { account, response } = await authorize("companies", "delete");
  if (!account) return response;

  const id = Number((await params).id);
  await db
    .delete(schema.companies)
    .where(and(eq(schema.companies.id, id), eq(schema.companies.accountId, account.id)));
  return NextResponse.json({ ok: true });
}

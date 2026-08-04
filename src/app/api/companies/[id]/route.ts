import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCompany } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { openingsByCompany } from "@/lib/company";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("companies", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();
  // openings nao vem do formulario: e calculado a partir das vagas "Aberta".
  const [row] = await db
    .update(schema.companies)
    .set({
      name: body.name,
      sector: body.sector ?? "",
      location: body.location ?? "",
      status: body.status ?? "Ativa",
    })
    .where(and(eq(schema.companies.id, id), eq(schema.companies.accountId, account.id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const openings = await openingsByCompany(account.id);
  return NextResponse.json(serializeCompany(row, openings.get(row.id) ?? 0));
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

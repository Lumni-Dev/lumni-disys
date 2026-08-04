import { NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
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

  // Integridade: nao exclui empresa que ainda tem vagas vinculadas (por ID).
  const [dep] = await db
    .select({ n: count() })
    .from(schema.jobs)
    .where(
      and(eq(schema.jobs.companyId, id), eq(schema.jobs.accountId, account.id)),
    );
  if (dep.n > 0)
    return NextResponse.json(
      {
        error: "Empresa com vagas cadastradas",
        dependency: "jobs",
        count: dep.n,
      },
      { status: 409 },
    );

  // Conectado: remove do pipeline eventuais cards dessa empresa (por companyId).
  await db
    .delete(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.companyId, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );
  await db
    .delete(schema.companies)
    .where(and(eq(schema.companies.id, id), eq(schema.companies.accountId, account.id)));
  return NextResponse.json({ ok: true });
}

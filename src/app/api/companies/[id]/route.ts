import { NextResponse } from "next/server";
import { and, count, eq, inArray } from "drizzle-orm";
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
      name: String(body.name ?? "").slice(0, 160),
      cnpj: String(body.cnpj ?? "").slice(0, 40),
      sector: String(body.sector ?? "").slice(0, 120),
      location: String(body.location ?? "").slice(0, 160),
      status: body.status ?? "Ativa",
    })
    .where(and(eq(schema.companies.id, id), eq(schema.companies.accountId, account.id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Propaga o novo nome aos campos denormalizados vinculados por ID, para as
  // listas (vagas, pipeline) nao mostrarem o nome antigo.
  await db
    .update(schema.jobs)
    .set({ company: row.name })
    .where(
      and(eq(schema.jobs.companyId, id), eq(schema.jobs.accountId, account.id)),
    );
  await db
    .update(schema.pipelineCards)
    .set({ company: row.name })
    .where(
      and(
        eq(schema.pipelineCards.companyId, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );

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

  // Conectado: remove do pipeline os cards dessa empresa (por companyId) e
  // tira os candidatos desses cards do processo (etapa "-").
  const cards = await db
    .select({ candidateId: schema.pipelineCards.candidateId })
    .from(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.companyId, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );
  await db
    .delete(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.companyId, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );
  const candIds = cards
    .map((c) => c.candidateId)
    .filter((x): x is number => x != null);
  if (candIds.length)
    await db
      .update(schema.candidates)
      .set({ stage: "-" })
      .where(
        and(
          inArray(schema.candidates.id, candIds),
          eq(schema.candidates.accountId, account.id),
        ),
      );
  await db
    .delete(schema.companies)
    .where(and(eq(schema.companies.id, id), eq(schema.companies.accountId, account.id)));
  return NextResponse.json({ ok: true });
}

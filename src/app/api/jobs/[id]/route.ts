import { NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { resolveCompany } from "@/lib/company";
import { applicantsByJob } from "@/lib/job";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("jobs", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();

  // Empresa vinculada por ID (obrigatoria e da propria conta).
  const company = await resolveCompany(account.id, body.companyId);
  if (!company)
    return NextResponse.json({ error: "Empresa invalida" }, { status: 400 });

  const [row] = await db
    .update(schema.jobs)
    .set({
      companyId: company.id,
      title: body.title,
      company: company.name,
      description: String(body.description ?? "").slice(0, 5000),
      type: body.type ?? "Remoto",
      level: body.level ?? "Pleno",
      openings: Number(body.openings) || 1,
      salaryFrom: Number(body.salaryFrom) || 0,
      salaryTo: Number(body.salaryTo) || 0,
      // applicants e contador automatico: a edicao nao mexe nele.
      status: body.status ?? "Aberta",
    })
    .where(and(eq(schema.jobs.id, id), eq(schema.jobs.accountId, account.id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const applicants = await applicantsByJob(account.id);
  return NextResponse.json(serializeJob(row, applicants.get(row.id) ?? 0));
}

export async function DELETE(_req: Request, { params }: Params) {
  const { account, response } = await authorize("jobs", "delete");
  if (!account) return response;

  const id = Number((await params).id);

  // Integridade: nao exclui vaga que ainda tem candidatos vinculados (por ID).
  const [dep] = await db
    .select({ n: count() })
    .from(schema.candidates)
    .where(
      and(
        eq(schema.candidates.jobId, id),
        eq(schema.candidates.accountId, account.id),
      ),
    );
  if (dep.n > 0)
    return NextResponse.json(
      {
        error: "Vaga com candidatos cadastrados",
        dependency: "candidates",
        count: dep.n,
      },
      { status: 409 },
    );

  // Conectado: remove do pipeline eventuais cards dessa vaga (por jobId).
  await db
    .delete(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.jobId, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );
  await db
    .delete(schema.jobs)
    .where(and(eq(schema.jobs.id, id), eq(schema.jobs.accountId, account.id)));
  return NextResponse.json({ ok: true });
}

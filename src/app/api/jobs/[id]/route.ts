import { NextResponse } from "next/server";
import { and, count, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { applicantsByJob } from "@/lib/job";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("jobs", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();


  const [acc] = await db
    .select({ name: schema.accounts.name })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, account.id));
  const companyName = acc?.name ?? "";

  const [row] = await db
    .update(schema.jobs)
    .set({
      title: String(body.title ?? "").slice(0, 200),
      company: companyName,
      description: String(body.description ?? "").slice(0, 5000),
      type: body.type ?? "Remoto",
      level: body.level ?? "Pleno",
      openings: Number(body.openings) || 1,
      salaryFrom: Number(body.salaryFrom) || 0,
      salaryTo: Number(body.salaryTo) || 0,

      status: body.status ?? "Aberta",
    })
    .where(and(eq(schema.jobs.id, id), eq(schema.jobs.accountId, account.id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });



  await db
    .update(schema.candidates)
    .set({ role: row.title })
    .where(
      and(
        eq(schema.candidates.jobId, id),
        eq(schema.candidates.accountId, account.id),
      ),
    );
  await db
    .update(schema.pipelineCards)
    .set({ job: row.title, company: row.company })
    .where(
      and(
        eq(schema.pipelineCards.jobId, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );

  const applicants = await applicantsByJob(account.id);
  return NextResponse.json(serializeJob(row, applicants.get(row.id) ?? 0));
}

export async function DELETE(_req: Request, { params }: Params) {
  const { account, response } = await authorize("jobs", "delete");
  if (!account) return response;

  const id = Number((await params).id);


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



  const cards = await db
    .select({ candidateId: schema.pipelineCards.candidateId })
    .from(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.jobId, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );
  await db
    .delete(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.jobId, id),
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
    .delete(schema.jobs)
    .where(and(eq(schema.jobs.id, id), eq(schema.jobs.accountId, account.id)));
  return NextResponse.json({ ok: true });
}

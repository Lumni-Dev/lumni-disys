import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { authorize } from "@/lib/authz";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("pipeline", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();

  // So etapa e posicao sao editaveis; nome/vaga/empresa derivam do candidato
  // (vinculo por ID) e nao mudam pelo card.
  const set: Record<string, unknown> = {};
  if (body.stage !== undefined) set.stage = body.stage;
  if (body.position !== undefined) set.position = Number(body.position);

  const [row] = await db
    .update(schema.pipelineCards)
    .set(set)
    .where(
      and(
        eq(schema.pipelineCards.id, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    )
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Propaga a mudanca de etapa para o candidato vinculado, mantendo o funil e
  // as atividades recentes do dashboard em sincronia com o pipeline.
  if (body.stage !== undefined && row.candidateId) {
    await db
      .update(schema.candidates)
      .set({ stage: row.stage })
      .where(
        and(
          eq(schema.candidates.id, row.candidateId),
          eq(schema.candidates.accountId, account.id),
        ),
      );
  }

  return NextResponse.json({
    id: row.id,
    candidateId: row.candidateId,
    jobId: row.jobId,
    companyId: row.companyId,
    name: row.name,
    job: row.job,
    company: row.company,
    stage: row.stage,
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { account, response } = await authorize("pipeline", "delete");
  if (!account) return response;

  const id = Number((await params).id);
  await db
    .delete(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.id, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );
  return NextResponse.json({ ok: true });
}

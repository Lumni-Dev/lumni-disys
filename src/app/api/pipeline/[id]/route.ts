import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { currentAccount } from "@/lib/account";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const account = await currentAccount();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await params).id);
  const body = await req.json();

  const set: Record<string, unknown> = {};
  if (body.name !== undefined) set.name = body.name;
  if (body.job !== undefined) set.job = body.job;
  if (body.company !== undefined) set.company = body.company;
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
    name: row.name,
    job: row.job,
    company: row.company,
    stage: row.stage,
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const account = await currentAccount();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

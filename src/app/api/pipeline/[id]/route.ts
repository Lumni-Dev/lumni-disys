import { NextResponse, after } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { authorize } from "@/lib/authz";
import { enqueueStageEmail, flushOutboxRow } from "@/lib/notify";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("pipeline", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();

  const [before] = await db
    .select({ stage: schema.pipelineCards.stage })
    .from(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.id, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );

  const set: Record<string, unknown> = {};
  if (body.stage !== undefined) set.stage = body.stage;
  if (body.position !== undefined) {
    set.position = Number(body.position);
  } else if (body.stage !== undefined) {

    const [tail] = await db
      .select({ n: count() })
      .from(schema.pipelineCards)
      .where(
        and(
          eq(schema.pipelineCards.accountId, account.id),
          eq(schema.pipelineCards.stage, body.stage),
        ),
      );
    set.position = tail.n;
  }

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

    if (before && before.stage !== row.stage) {
      const mailId = await enqueueStageEmail({
        accountId: account.id,
        candidateId: row.candidateId,
        stageLabel: row.stage,
        kind: "stage",
      });
      if (mailId) after(() => flushOutboxRow(mailId));
    }
  }

  return NextResponse.json({
    id: row.id,
    candidateId: row.candidateId,
    jobId: row.jobId,
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
  const [card] = await db
    .select({ candidateId: schema.pipelineCards.candidateId })
    .from(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.id, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );

  await db
    .delete(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.id, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );

  if (card?.candidateId) {
    await db
      .update(schema.candidates)
      .set({ stage: "-" })
      .where(
        and(
          eq(schema.candidates.id, card.candidateId),
          eq(schema.candidates.accountId, account.id),
        ),
      );

    const mailId = await enqueueStageEmail({
      accountId: account.id,
      candidateId: card.candidateId,
      stageLabel: "-",
      kind: "removed",
    });
    if (mailId) after(() => flushOutboxRow(mailId));
  }

  return NextResponse.json({ ok: true });
}

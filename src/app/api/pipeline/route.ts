import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { authorize } from "@/lib/authz";

const STAGES = [
  "Triagem",
  "Entrevista RH",
  "Teste técnico",
  "Entrevista final",
  "Proposta",
];

export async function GET() {
  const { account, response } = await authorize("pipeline", "view");
  if (!account) return response;

  const cards = await db
    .select()
    .from(schema.pipelineCards)
    .where(eq(schema.pipelineCards.accountId, account.id))
    .orderBy(asc(schema.pipelineCards.position), asc(schema.pipelineCards.id));

  const columns = STAGES.map((stage) => ({
    stage,
    cards: cards
      .filter((c) => c.stage === stage)
      .map((c) => ({ id: c.id, name: c.name, job: c.job, company: c.company })),
  }));

  return NextResponse.json(columns);
}

export async function POST(req: Request) {
  const { account, response } = await authorize("pipeline", "create");
  if (!account) return response;

  const body = await req.json();
  const stage = body.stage ?? STAGES[0];

  const inStage = await db
    .select()
    .from(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.accountId, account.id),
        eq(schema.pipelineCards.stage, stage),
      ),
    );

  // Vincula o card a um candidato existente com o mesmo nome, para que mover
  // o card no pipeline reflita no funil e nas atividades do dashboard.
  const [candidate] = await db
    .select({ id: schema.candidates.id })
    .from(schema.candidates)
    .where(
      and(
        eq(schema.candidates.accountId, account.id),
        eq(schema.candidates.name, body.name),
      ),
    )
    .orderBy(asc(schema.candidates.id))
    .limit(1);

  const [row] = await db
    .insert(schema.pipelineCards)
    .values({
      accountId: account.id,
      candidateId: candidate?.id ?? null,
      name: body.name,
      job: body.job ?? "",
      company: body.company ?? "",
      stage,
      position: inStage.length,
    })
    .returning();

  // Sincroniza a etapa do candidato vinculado com a etapa inicial do card.
  if (candidate?.id) {
    await db
      .update(schema.candidates)
      .set({ stage })
      .where(
        and(
          eq(schema.candidates.id, candidate.id),
          eq(schema.candidates.accountId, account.id),
        ),
      );
  }

  return NextResponse.json(
    { id: row.id, name: row.name, job: row.job, company: row.company, stage },
    { status: 201 },
  );
}

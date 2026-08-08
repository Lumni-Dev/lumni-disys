import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { authorize } from "@/lib/authz";
import { resolveJob } from "@/lib/job";

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
      .map((c) => ({
        id: c.id,
        candidateId: c.candidateId,
        jobId: c.jobId,
        name: c.name,
        job: c.job,
        company: c.company,
      })),
  }));

  return NextResponse.json(columns);
}

export async function POST(req: Request) {
  const { account, response } = await authorize("pipeline", "create");
  if (!account) return response;

  const body = await req.json();
  const stage = body.stage ?? STAGES[0];

  // Candidato vinculado por ID (obrigatorio e da propria conta). A vaga e a
  // empresa do card sao derivadas da vaga pretendida do candidato (por ID).
  const candId = Number(body.candidateId);
  const [candidate] = Number.isInteger(candId)
    ? await db
        .select({
          id: schema.candidates.id,
          name: schema.candidates.name,
          jobId: schema.candidates.jobId,
        })
        .from(schema.candidates)
        .where(
          and(
            eq(schema.candidates.id, candId),
            eq(schema.candidates.accountId, account.id),
          ),
        )
    : [];
  if (!candidate)
    return NextResponse.json({ error: "Candidato invalido" }, { status: 400 });

  // Um candidato tem no maximo um card no processo (evita duplicados).
  const [existingCard] = await db
    .select({ id: schema.pipelineCards.id })
    .from(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.candidateId, candidate.id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );
  if (existingCard)
    return NextResponse.json(
      { error: "Candidato ja esta no processo" },
      { status: 409 },
    );

  const job = candidate.jobId
    ? await resolveJob(account.id, candidate.jobId)
    : null;

  const inStage = await db
    .select({ id: schema.pipelineCards.id })
    .from(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.accountId, account.id),
        eq(schema.pipelineCards.stage, stage),
      ),
    );

  const [row] = await db
    .insert(schema.pipelineCards)
    .values({
      accountId: account.id,
      candidateId: candidate.id,
      jobId: job?.id ?? null,
      name: candidate.name,
      job: job?.title ?? "",
      company: job?.company ?? "",
      stage,
      position: inStage.length,
    })
    .returning();

  // Sincroniza a etapa do candidato com a etapa inicial do card.
  await db
    .update(schema.candidates)
    .set({ stage })
    .where(
      and(
        eq(schema.candidates.id, candidate.id),
        eq(schema.candidates.accountId, account.id),
      ),
    );

  return NextResponse.json(
    {
      id: row.id,
      candidateId: row.candidateId,
      jobId: row.jobId,
      name: row.name,
      job: row.job,
      company: row.company,
      stage,
    },
    { status: 201 },
  );
}

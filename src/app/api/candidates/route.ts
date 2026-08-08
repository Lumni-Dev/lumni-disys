import { NextResponse } from "next/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCandidate } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { planLimitError } from "@/lib/plan";
import { resolveJob } from "@/lib/job";
import { scoreCvMatch } from "@/lib/match";

// A analise de compatibilidade por IA pode levar alguns segundos.
export const maxDuration = 60;

export async function GET() {
  const { account, response } = await authorize("candidates", "view");
  if (!account) return response;

  // Sem o cv_base64 na listagem (pode pesar megabytes); vai so o flag.
  const rows = await db
    .select({
      id: schema.candidates.id,
      jobId: schema.candidates.jobId,
      name: schema.candidates.name,
      role: schema.candidates.role,
      email: schema.candidates.email,
      stage: schema.candidates.stage,
      linkedin: schema.candidates.linkedin,
      cvName: schema.candidates.cvName,
      updatedAt: schema.candidates.updatedAt,
      hasCv: sql<boolean>`${schema.candidates.cvBase64} <> ''`,
      matchScore: schema.candidates.matchScore,
    })
    .from(schema.candidates)
    .where(eq(schema.candidates.accountId, account.id))
    .orderBy(asc(schema.candidates.id));
  return NextResponse.json(rows.map(serializeCandidate));
}

export async function POST(req: Request) {
  const { account, response } = await authorize("candidates", "create");
  if (!account) return response;

  // Plano Free: ate 1 candidato; o Plus e ilimitado.
  const limited = await planLimitError(account.id, "candidates");
  if (limited) return limited;

  const body = await req.json();

  // Curriculo obrigatorio (data URL base64, ate ~2 MB).
  const cvData =
    typeof body.cvData === "string" &&
    body.cvData.startsWith("data:") &&
    body.cvData.length <= 3_000_000
      ? body.cvData
      : "";
  if (!cvData)
    return NextResponse.json(
      { error: "Curriculo obrigatorio" },
      { status: 400 },
    );
  const cvName = String(body.cvName ?? "").slice(0, 200);

  // Vaga pretendida vinculada por ID (obrigatoria e da propria conta). O role
  // guarda o titulo denormalizado e alimenta a analise por IA.
  const job = await resolveJob(account.id, body.jobId);
  if (!job)
    return NextResponse.json({ error: "Vaga invalida" }, { status: 400 });

  const matchScore = await scoreCvMatch({
    cvDataUrl: cvData,
    cvName,
    jobTitle: job.title,
    jobDescription: job.description,
  });

  const [row] = await db
    .insert(schema.candidates)
    .values({
      accountId: account.id,
      jobId: job.id,
      name: String(body.name ?? "").slice(0, 160),
      role: job.title,
      email: String(body.email ?? "").slice(0, 200),
      stage: body.stage ?? "Triagem",
      linkedin: String(body.linkedin ?? "").slice(0, 300),
      cvName,
      cvBase64: cvData,
      matchScore,
    })
    .returning();

  // Novo candidato ja entra no pipeline (Processos), na sua etapa inicial,
  // vinculado por ID; a vaga e a empresa do card vem da vaga pretendida.
  const inStage = await db
    .select({ id: schema.pipelineCards.id })
    .from(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.accountId, account.id),
        eq(schema.pipelineCards.stage, row.stage),
      ),
    );
  await db.insert(schema.pipelineCards).values({
    accountId: account.id,
    candidateId: row.id,
    jobId: job.id,
    companyId: job.companyId,
    name: row.name,
    job: job.title,
    company: job.company,
    stage: row.stage,
    position: inStage.length,
  });

  return NextResponse.json(serializeCandidate(row), { status: 201 });
}

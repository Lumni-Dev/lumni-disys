import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { accountByToken } from "@/lib/account";
import { scoreCvMatch } from "@/lib/match";

// A analise de compatibilidade por IA pode levar alguns segundos.
export const maxDuration = 60;

// Candidatura publica: cria o candidato na conta dona do link (token).
export async function POST(req: Request) {
  const body = await req.json();

  const token = typeof body.token === "string" ? body.token : "";
  const account = await accountByToken(token);
  if (!account)
    return NextResponse.json({ error: "Link invalido" }, { status: 400 });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (!name || !email)
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });

  const role = String(body.jobTitle ?? "").slice(0, 160);

  // Mesma pessoa na mesma vaga: nao duplica o candidato nem infla o contador.
  const [dup] = await db
    .select({ id: schema.candidates.id })
    .from(schema.candidates)
    .where(
      and(
        eq(schema.candidates.accountId, account.id),
        eq(schema.candidates.email, email.slice(0, 200)),
        eq(schema.candidates.role, role),
      ),
    );
  if (dup) return NextResponse.json({ ok: true }, { status: 200 });

  // Curriculo: data URL base64, com teto de tamanho no servidor (~2 MB).
  const cvData =
    typeof body.cvData === "string" &&
    body.cvData.startsWith("data:") &&
    body.cvData.length <= 3_000_000
      ? body.cvData
      : "";

  // Dados da vaga: empresa para o card e titulo/descricao para a analise.
  const jobId = Number(body.jobId);
  let job: {
    title: string;
    company: string;
    companyId: number | null;
    description: string;
  } | null = null;
  if (Number.isFinite(jobId)) {
    const [row] = await db
      .select({
        title: schema.jobs.title,
        company: schema.jobs.company,
        companyId: schema.jobs.companyId,
        description: schema.jobs.description,
      })
      .from(schema.jobs)
      .where(
        and(eq(schema.jobs.id, jobId), eq(schema.jobs.accountId, account.id)),
      );
    job = row ?? null;
  }

  // Compatibilidade curriculo x vaga por IA (0 a 100; null se falhar).
  const cvName = cvData ? String(body.cvName ?? "").slice(0, 200) : "";
  const matchScore =
    cvData && job
      ? await scoreCvMatch({
          cvDataUrl: cvData,
          cvName,
          jobTitle: job.title,
          jobDescription: job.description,
        })
      : null;

  const [candidate] = await db
    .insert(schema.candidates)
    .values({
      accountId: account.id,
      jobId: job ? jobId : null,
      name: name.slice(0, 160),
      role: job ? job.title : role,
      email: email.slice(0, 200),
      stage: "Triagem",
      linkedin: String(body.linkedin ?? "").slice(0, 300),
      cvName,
      cvBase64: cvData,
      matchScore,
    })
    .returning({ id: schema.candidates.id });

  // O numero de candidatos da vaga e derivado da tabela de candidatos
  // (vinculo por jobId), entao nao ha mais contador a incrementar aqui.
  const jobCompany = job?.company ?? "";

  // A candidatura ja entra no kanban de processos, no fim da Triagem,
  // vinculada ao candidato (mover o card depois atualiza a etapa dele).
  const inStage = await db
    .select({ id: schema.pipelineCards.id })
    .from(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.accountId, account.id),
        eq(schema.pipelineCards.stage, "Triagem"),
      ),
    );
  await db.insert(schema.pipelineCards).values({
    accountId: account.id,
    candidateId: candidate?.id ?? null,
    jobId: job ? jobId : null,
    companyId: job?.companyId ?? null,
    name: name.slice(0, 160),
    job: job ? job.title : role,
    company: jobCompany.slice(0, 160),
    stage: "Triagem",
    position: inStage.length,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

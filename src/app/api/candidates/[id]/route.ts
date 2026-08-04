import { NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCandidate } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { scoreCvMatch } from "@/lib/match";

// A analise de compatibilidade por IA pode levar alguns segundos.
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("candidates", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();

  const [existing] = await db
    .select({
      cvName: schema.candidates.cvName,
      cvBase64: schema.candidates.cvBase64,
      role: schema.candidates.role,
      stage: schema.candidates.stage,
      matchScore: schema.candidates.matchScore,
    })
    .from(schema.candidates)
    .where(
      and(
        eq(schema.candidates.id, id),
        eq(schema.candidates.accountId, account.id),
      ),
    );
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Curriculo obrigatorio: usa o novo quando enviado, senao mantem o atual.
  const newCv =
    typeof body.cvData === "string" &&
    body.cvData.startsWith("data:") &&
    body.cvData.length <= 3_000_000
      ? body.cvData
      : "";
  const cvBase64 = newCv || existing.cvBase64;
  if (!cvBase64)
    return NextResponse.json(
      { error: "Curriculo obrigatorio" },
      { status: 400 },
    );
  const cvName = newCv
    ? String(body.cvName ?? "").slice(0, 200)
    : existing.cvName;

  // Reanalisa quando o arquivo ou o cargo (vinculo com a vaga) mudam.
  const role = body.role ?? "";
  let matchScore = existing.matchScore;
  if (newCv || role !== existing.role) {
    const [job] = await db
      .select({
        title: schema.jobs.title,
        description: schema.jobs.description,
      })
      .from(schema.jobs)
      .where(
        and(eq(schema.jobs.accountId, account.id), eq(schema.jobs.title, role)),
      )
      .limit(1);
    matchScore = job
      ? await scoreCvMatch({
          cvDataUrl: cvBase64,
          cvName,
          jobTitle: job.title,
          jobDescription: job.description,
        })
      : null;
  }

  const [row] = await db
    .update(schema.candidates)
    .set({
      name: body.name,
      role,
      email: body.email ?? "",
      stage: body.stage ?? "Triagem",
      linkedin: body.linkedin ?? "",
      cvName,
      cvBase64,
      matchScore,
    })
    .where(and(eq(schema.candidates.id, id), eq(schema.candidates.accountId, account.id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Conectado: mudar a etapa do candidato move o(s) card(s) dele no pipeline
  // para o fim da nova coluna (mantem processos e candidatos em sincronia).
  if (existing.stage !== row.stage) {
    const [tail] = await db
      .select({ n: count() })
      .from(schema.pipelineCards)
      .where(
        and(
          eq(schema.pipelineCards.accountId, account.id),
          eq(schema.pipelineCards.stage, row.stage),
        ),
      );
    await db
      .update(schema.pipelineCards)
      .set({ stage: row.stage, position: tail.n })
      .where(
        and(
          eq(schema.pipelineCards.candidateId, id),
          eq(schema.pipelineCards.accountId, account.id),
        ),
      );
  }

  return NextResponse.json(serializeCandidate(row));
}

export async function DELETE(_req: Request, { params }: Params) {
  const { account, response } = await authorize("candidates", "delete");
  if (!account) return response;

  const id = Number((await params).id);

  // Conectado: remove o card do candidato no pipeline (senao ficaria orfao).
  await db
    .delete(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.candidateId, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );
  await db
    .delete(schema.candidates)
    .where(and(eq(schema.candidates.id, id), eq(schema.candidates.accountId, account.id)));
  return NextResponse.json({ ok: true });
}

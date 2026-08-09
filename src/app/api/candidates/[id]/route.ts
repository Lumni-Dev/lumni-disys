import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCandidate } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { resolveJob } from "@/lib/job";
import { scoreCvMatch } from "@/lib/match";

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
      jobId: schema.candidates.jobId,
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

  const job = await resolveJob(account.id, body.jobId);
  if (!job)
    return NextResponse.json({ error: "Vaga invalida" }, { status: 400 });

  let matchScore = existing.matchScore;
  if (newCv || job.id !== existing.jobId) {
    matchScore = await scoreCvMatch({
      cvDataUrl: cvBase64,
      cvName,
      jobTitle: job.title,
      jobDescription: job.description,
    });
  }

  const [row] = await db
    .update(schema.candidates)
    .set({
      jobId: job.id,
      name: String(body.name ?? "").slice(0, 160),
      role: job.title,
      email: String(body.email ?? "").slice(0, 200),

      stage: existing.stage,
      linkedin: String(body.linkedin ?? "").slice(0, 300),
      cvName,
      cvBase64,
      matchScore,
    })
    .where(and(eq(schema.candidates.id, id), eq(schema.candidates.accountId, account.id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db
    .update(schema.pipelineCards)
    .set({
      name: row.name,
      jobId: job.id,
      job: job.title,
      company: job.company,
    })
    .where(
      and(
        eq(schema.pipelineCards.candidateId, id),
        eq(schema.pipelineCards.accountId, account.id),
      ),
    );

  return NextResponse.json(serializeCandidate(row));
}

export async function DELETE(_req: Request, { params }: Params) {
  const { account, response } = await authorize("candidates", "delete");
  if (!account) return response;

  const id = Number((await params).id);

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

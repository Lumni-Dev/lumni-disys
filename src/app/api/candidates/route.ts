import { NextResponse } from "next/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCandidate } from "@/db/serializers";
import { authorize } from "@/lib/authz";
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
  const role = body.role ?? "";

  // Vaga vinculada pelo cargo pretendido: alimenta a analise por IA.
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
  const matchScore = job
    ? await scoreCvMatch({
        cvDataUrl: cvData,
        cvName,
        jobTitle: job.title,
        jobDescription: job.description,
      })
    : null;

  const [row] = await db
    .insert(schema.candidates)
    .values({
      accountId: account.id,
      name: body.name,
      role,
      email: body.email ?? "",
      stage: body.stage ?? "Triagem",
      linkedin: body.linkedin ?? "",
      cvName,
      cvBase64: cvData,
      matchScore,
    })
    .returning();
  return NextResponse.json(serializeCandidate(row), { status: 201 });
}

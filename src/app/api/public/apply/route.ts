import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { accountByToken } from "@/lib/account";

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

  await db.insert(schema.candidates).values({
    accountId: account.id,
    name: name.slice(0, 160),
    role,
    email: email.slice(0, 200),
    stage: "Triagem",
    linkedin: String(body.linkedin ?? "").slice(0, 300),
    cvName: cvData ? String(body.cvName ?? "").slice(0, 200) : "",
    cvBase64: cvData,
  });

  const jobId = Number(body.jobId);
  if (Number.isFinite(jobId)) {
    await db
      .update(schema.jobs)
      .set({ applicants: sql`${schema.jobs.applicants} + 1` })
      .where(and(eq(schema.jobs.id, jobId), eq(schema.jobs.accountId, account.id)));
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

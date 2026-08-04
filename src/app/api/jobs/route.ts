import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { resolveCompany } from "@/lib/company";
import { applicantsByJob } from "@/lib/job";

export async function GET() {
  const { account, response } = await authorize("jobs", "view");
  if (!account) return response;

  const rows = await db
    .select()
    .from(schema.jobs)
    .where(eq(schema.jobs.accountId, account.id))
    .orderBy(asc(schema.jobs.id));

  // Candidatos = numero real de candidatos por vaga (vinculo por jobId).
  const applicants = await applicantsByJob(account.id);
  return NextResponse.json(
    rows.map((r) => serializeJob(r, applicants.get(r.id) ?? 0)),
  );
}

export async function POST(req: Request) {
  const { account, response } = await authorize("jobs", "create");
  if (!account) return response;

  const body = await req.json();

  // Empresa vinculada por ID (obrigatoria e da propria conta). O nome vai
  // denormalizado para exibicao/listas publicas.
  const company = await resolveCompany(account.id, body.companyId);
  if (!company)
    return NextResponse.json({ error: "Empresa invalida" }, { status: 400 });

  const [row] = await db
    .insert(schema.jobs)
    .values({
      accountId: account.id,
      companyId: company.id,
      title: body.title,
      company: company.name,
      description: String(body.description ?? "").slice(0, 5000),
      type: body.type ?? "Remoto",
      level: body.level ?? "Pleno",
      openings: Number(body.openings) || 1,
      // applicants nasce em 0 e so cresce com candidaturas reais.
      status: body.status ?? "Aberta",
    })
    .returning();
  const applicants = await applicantsByJob(account.id);
  return NextResponse.json(
    serializeJob(row, applicants.get(row.id) ?? 0),
    { status: 201 },
  );
}

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { resolveCompany } from "@/lib/company";
import { applicantsByRole } from "@/lib/job";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("jobs", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();

  // Empresa vinculada por ID (obrigatoria e da propria conta).
  const company = await resolveCompany(account.id, body.companyId);
  if (!company)
    return NextResponse.json({ error: "Empresa invalida" }, { status: 400 });

  const [row] = await db
    .update(schema.jobs)
    .set({
      companyId: company.id,
      title: body.title,
      company: company.name,
      description: String(body.description ?? "").slice(0, 5000),
      type: body.type ?? "Remoto",
      level: body.level ?? "Pleno",
      openings: Number(body.openings) || 1,
      // applicants e contador automatico: a edicao nao mexe nele.
      status: body.status ?? "Aberta",
    })
    .where(and(eq(schema.jobs.id, id), eq(schema.jobs.accountId, account.id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const applicants = await applicantsByRole(account.id);
  return NextResponse.json(serializeJob(row, applicants.get(row.title) ?? 0));
}

export async function DELETE(_req: Request, { params }: Params) {
  const { account, response } = await authorize("jobs", "delete");
  if (!account) return response;

  const id = Number((await params).id);
  await db
    .delete(schema.jobs)
    .where(and(eq(schema.jobs.id, id), eq(schema.jobs.accountId, account.id)));
  return NextResponse.json({ ok: true });
}

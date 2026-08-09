import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeJob } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { planLimitError } from "@/lib/plan";
import { applicantsByJob } from "@/lib/job";


async function workspaceName(accountId: number): Promise<string> {
  const [acc] = await db
    .select({ name: schema.accounts.name })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, accountId));
  return acc?.name ?? "";
}

export async function GET() {
  const { account, response } = await authorize("jobs", "view");
  if (!account) return response;

  const rows = await db
    .select()
    .from(schema.jobs)
    .where(eq(schema.jobs.accountId, account.id))
    .orderBy(asc(schema.jobs.id));


  const applicants = await applicantsByJob(account.id);
  return NextResponse.json(
    rows.map((r) => serializeJob(r, applicants.get(r.id) ?? 0)),
  );
}

export async function POST(req: Request) {
  const { account, response } = await authorize("jobs", "create");
  if (!account) return response;


  const limited = await planLimitError(account.id, "jobs");
  if (limited) return limited;

  const body = await req.json();


  const company = await workspaceName(account.id);

  const [row] = await db
    .insert(schema.jobs)
    .values({
      accountId: account.id,
      title: String(body.title ?? "").slice(0, 200),
      company,
      description: String(body.description ?? "").slice(0, 5000),
      type: body.type ?? "Remoto",
      level: body.level ?? "Pleno",
      openings: Number(body.openings) || 1,
      salaryFrom: Number(body.salaryFrom) || 0,
      salaryTo: Number(body.salaryTo) || 0,

      status: body.status ?? "Aberta",
    })
    .returning();
  const applicants = await applicantsByJob(account.id);
  return NextResponse.json(
    serializeJob(row, applicants.get(row.id) ?? 0),
    { status: 201 },
  );
}

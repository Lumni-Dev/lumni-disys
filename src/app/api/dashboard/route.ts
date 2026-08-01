import { NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db, schema } from "@/db";
import { currentAccount } from "@/lib/account";

const STAGES = [
  "Triagem",
  "Entrevista RH",
  "Teste técnico",
  "Entrevista final",
  "Proposta",
];

const WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Série real: contagem acumulada de registros por semana (createdAt), por conta.
async function cumulativeSeries(
  table: PgTable,
  createdAt: PgColumn,
  accountCol: PgColumn,
  accountId: number,
): Promise<number[]> {
  const rows = await db
    .select({ createdAt })
    .from(table)
    .where(eq(accountCol, accountId));
  const times = rows
    .map((r) => new Date(r.createdAt as unknown as string).getTime())
    .filter((t) => !Number.isNaN(t));
  const now = Date.now();
  return Array.from({ length: WEEKS }, (_, i) => {
    const end = now - (WEEKS - 1 - i) * WEEK_MS;
    return times.filter((t) => t <= end).length;
  });
}

export async function GET() {
  const account = await currentAccount();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const acc = account.id;

  const [companiesTotal] = await db
    .select({ n: count() })
    .from(schema.companies)
    .where(eq(schema.companies.accountId, acc));
  const [companiesActive] = await db
    .select({ n: count() })
    .from(schema.companies)
    .where(and(eq(schema.companies.accountId, acc), eq(schema.companies.status, "Ativa")));
  const [jobsTotal] = await db
    .select({ n: count() })
    .from(schema.jobs)
    .where(eq(schema.jobs.accountId, acc));
  const [jobsOpen] = await db
    .select({ n: count() })
    .from(schema.jobs)
    .where(and(eq(schema.jobs.accountId, acc), eq(schema.jobs.status, "Aberta")));
  const [candidatesTotal] = await db
    .select({ n: count() })
    .from(schema.candidates)
    .where(eq(schema.candidates.accountId, acc));
  const [pipelineTotal] = await db
    .select({ n: count() })
    .from(schema.pipelineCards)
    .where(eq(schema.pipelineCards.accountId, acc));

  const stageRows = await db
    .select({ stage: schema.candidates.stage, n: count() })
    .from(schema.candidates)
    .where(eq(schema.candidates.accountId, acc))
    .groupBy(schema.candidates.stage);
  const byStage = new Map(stageRows.map((r) => [r.stage, r.n]));
  const funnel = STAGES.map((stage) => ({
    stage,
    count: byStage.get(stage) ?? 0,
  }));

  const [companiesTrend, jobsTrend, candidatesTrend, pipelineTrend] =
    await Promise.all([
      cumulativeSeries(schema.companies, schema.companies.createdAt, schema.companies.accountId, acc),
      cumulativeSeries(schema.jobs, schema.jobs.createdAt, schema.jobs.accountId, acc),
      cumulativeSeries(schema.candidates, schema.candidates.createdAt, schema.candidates.accountId, acc),
      cumulativeSeries(schema.pipelineCards, schema.pipelineCards.createdAt, schema.pipelineCards.accountId, acc),
    ]);

  return NextResponse.json({
    stats: {
      companies: { active: companiesActive.n, total: companiesTotal.n },
      jobs: { open: jobsOpen.n, total: jobsTotal.n },
      candidates: { total: candidatesTotal.n },
      pipeline: { total: pipelineTotal.n },
    },
    funnel,
    trends: {
      companies: companiesTrend,
      jobs: jobsTrend,
      candidates: candidatesTrend,
      pipeline: pipelineTrend,
    },
  });
}

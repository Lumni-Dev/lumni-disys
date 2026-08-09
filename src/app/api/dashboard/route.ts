import { NextResponse } from "next/server";
import { and, count, eq, sql } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db, schema } from "@/db";
import { authorize } from "@/lib/authz";

const STAGES = [
  "Triagem",
  "Entrevista RH",
  "Teste técnico",
  "Entrevista final",
  "Proposta",
];

const WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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
  const { account, response } = await authorize("dashboard", "view");
  if (!account) return response;
  const acc = account.id;

  const [jobsTotal] = await db
    .select({ n: sql<number>`coalesce(sum(${schema.jobs.openings}), 0)` })
    .from(schema.jobs)
    .where(eq(schema.jobs.accountId, acc));
  const [jobsOpen] = await db
    .select({ n: sql<number>`coalesce(sum(${schema.jobs.openings}), 0)` })
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

  const [teamTotal] = await db
    .select({ n: count() })
    .from(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.accountId, acc),
        eq(schema.teamMembers.status, "accepted"),
      ),
    );

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

  const [jobsTrend, candidatesTrend, pipelineTrend, teamTrend] =
    await Promise.all([
      cumulativeSeries(schema.jobs, schema.jobs.createdAt, schema.jobs.accountId, acc),
      cumulativeSeries(schema.candidates, schema.candidates.createdAt, schema.candidates.accountId, acc),
      cumulativeSeries(schema.pipelineCards, schema.pipelineCards.createdAt, schema.pipelineCards.accountId, acc),
      cumulativeSeries(schema.teamMembers, schema.teamMembers.createdAt, schema.teamMembers.accountId, acc),
    ]);

  return NextResponse.json({
    stats: {
      jobs: { open: Number(jobsOpen.n), total: Number(jobsTotal.n) },
      candidates: { total: candidatesTotal.n },
      pipeline: { total: pipelineTotal.n },
      team: { total: teamTotal.n },
    },
    funnel,
    trends: {
      jobs: jobsTrend,
      candidates: candidatesTrend,
      pipeline: pipelineTrend,
      team: teamTrend,
    },
  });
}

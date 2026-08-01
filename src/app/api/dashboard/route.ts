import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { db, schema } from "@/db";

const STAGES = [
  "Triagem",
  "Entrevista RH",
  "Teste técnico",
  "Entrevista final",
  "Proposta",
];

export async function GET() {
  const [companiesTotal] = await db
    .select({ n: count() })
    .from(schema.companies);
  const [companiesActive] = await db
    .select({ n: count() })
    .from(schema.companies)
    .where(eq(schema.companies.status, "Ativa"));
  const [jobsTotal] = await db.select({ n: count() }).from(schema.jobs);
  const [jobsOpen] = await db
    .select({ n: count() })
    .from(schema.jobs)
    .where(eq(schema.jobs.status, "Aberta"));
  const [candidatesTotal] = await db
    .select({ n: count() })
    .from(schema.candidates);
  const [pipelineTotal] = await db
    .select({ n: count() })
    .from(schema.pipelineCards);

  const stageRows = await db
    .select({ stage: schema.candidates.stage, n: count() })
    .from(schema.candidates)
    .groupBy(schema.candidates.stage);
  const byStage = new Map(stageRows.map((r) => [r.stage, r.n]));
  const funnel = STAGES.map((stage) => ({
    stage,
    count: byStage.get(stage) ?? 0,
  }));

  return NextResponse.json({
    stats: {
      companies: { active: companiesActive.n, total: companiesTotal.n },
      jobs: { open: jobsOpen.n, total: jobsTotal.n },
      candidates: { total: candidatesTotal.n },
      pipeline: { total: pipelineTotal.n },
    },
    funnel,
  });
}

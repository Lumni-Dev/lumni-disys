import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";

export async function applicantsByJob(
  accountId: number,
): Promise<Map<number, number>> {
  const rows = await db
    .select({
      jobId: schema.candidates.jobId,
      n: sql<number>`count(*)`,
    })
    .from(schema.candidates)
    .where(
      and(
        eq(schema.candidates.accountId, accountId),
        isNotNull(schema.candidates.jobId),
      ),
    )
    .groupBy(schema.candidates.jobId);

  return new Map(
    rows
      .filter((r) => r.jobId != null)
      .map((r) => [r.jobId as number, Number(r.n)]),
  );
}

export type ResolvedJob = {
  id: number;
  title: string;
  description: string;
  company: string;
};

export async function resolveJob(
  accountId: number,
  jobId: unknown,
): Promise<ResolvedJob | null> {
  const id = Number(jobId);
  if (!Number.isInteger(id) || id <= 0) return null;

  const [job] = await db
    .select({
      id: schema.jobs.id,
      title: schema.jobs.title,
      description: schema.jobs.description,
      company: schema.jobs.company,
    })
    .from(schema.jobs)
    .where(and(eq(schema.jobs.id, id), eq(schema.jobs.accountId, accountId)));
  return job ?? null;
}

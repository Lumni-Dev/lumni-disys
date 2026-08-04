import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

/**
 * Candidatos por vaga: contagem de candidatos cujo cargo pretendido (role) e
 * igual ao titulo da vaga, dentro da conta. Mapa titulo -> quantidade. E a
 * fonte da verdade do numero de candidatos (o contador jobs.applicants ficou
 * obsoleto por so contar candidaturas publicas).
 */
export async function applicantsByRole(
  accountId: number,
): Promise<Map<string, number>> {
  const rows = await db
    .select({
      role: schema.candidates.role,
      n: sql<number>`count(*)`,
    })
    .from(schema.candidates)
    .where(eq(schema.candidates.accountId, accountId))
    .groupBy(schema.candidates.role);

  return new Map(rows.map((r) => [r.role, Number(r.n)]));
}

import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";

/**
 * Vagas por empresa: soma de openings das vagas com status "Aberta" vinculadas
 * (por companyId) a cada empresa da conta. Mapa companyId -> total. Empresas
 * sem vagas abertas simplesmente nao aparecem no mapa (tratar como 0).
 */
export async function openingsByCompany(
  accountId: number,
): Promise<Map<number, number>> {
  const rows = await db
    .select({
      companyId: schema.jobs.companyId,
      total: sql<number>`coalesce(sum(${schema.jobs.openings}), 0)`,
    })
    .from(schema.jobs)
    .where(
      and(
        eq(schema.jobs.accountId, accountId),
        eq(schema.jobs.status, "Aberta"),
        isNotNull(schema.jobs.companyId),
      ),
    )
    .groupBy(schema.jobs.companyId);

  return new Map(
    rows
      .filter((r) => r.companyId != null)
      .map((r) => [r.companyId as number, Number(r.total)]),
  );
}

/**
 * Resolve a empresa vinculada a uma vaga pelo ID, garantindo que ela pertence
 * a conta. Retorna { id, name } ou null quando o ID e invalido/ausente ou a
 * empresa e de outra conta. O vinculo vaga->empresa e sempre por ID; o nome
 * retornado e so o rotulo denormalizado guardado em jobs.company.
 */
export async function resolveCompany(
  accountId: number,
  companyId: unknown,
): Promise<{ id: number; name: string } | null> {
  const id = Number(companyId);
  if (!Number.isInteger(id) || id <= 0) return null;

  const [company] = await db
    .select({ id: schema.companies.id, name: schema.companies.name })
    .from(schema.companies)
    .where(
      and(
        eq(schema.companies.id, id),
        eq(schema.companies.accountId, accountId),
      ),
    );
  return company ?? null;
}

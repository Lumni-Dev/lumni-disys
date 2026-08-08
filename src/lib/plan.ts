import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db, schema } from "@/db";

// Limites do plano Free; o Plus e ilimitado.
export const FREE_LIMITS = {
  companies: 1,
  jobs: 1,
  candidates: 1,
} as const;

export type LimitedResource = keyof typeof FREE_LIMITS;

const tables = {
  companies: schema.companies,
  jobs: schema.jobs,
  candidates: schema.candidates,
} as const;

/** Linha da conta com os dados de plano/assinatura. */
export async function accountBilling(accountId: number) {
  const [acc] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.id, accountId));
  return acc ?? null;
}

/** Quantidade cadastrada de um recurso limitado na conta. */
export async function resourceCount(
  accountId: number,
  resource: LimitedResource,
): Promise<number> {
  const table = tables[resource];
  return db.$count(table, eq(table.accountId, accountId));
}

/**
 * Bloqueio de criacao pelo plano: no Free cada recurso tem teto; atingido,
 * devolve a resposta 402 pronta (o cliente abre o modal de upgrade). No
 * Plus retorna null (sem limite).
 */
export async function planLimitError(
  accountId: number,
  resource: LimitedResource,
): Promise<NextResponse | null> {
  const acc = await accountBilling(accountId);
  if (acc?.plan === "plus") return null;
  const count = await resourceCount(accountId, resource);
  if (count < FREE_LIMITS[resource]) return null;
  return NextResponse.json(
    { error: "plan_limit", resource, limit: FREE_LIMITS[resource] },
    { status: 402 },
  );
}

/**
 * Espelha uma assinatura do Stripe na conta: status ativo vira Plus; cancelada
 * ou inadimplente definitiva volta para Free. Usada pelo webhook e pelo
 * sync apos o retorno do checkout (fallback quando o webhook nao alcanca
 * o ambiente, ex.: desenvolvimento local).
 */
export async function applySubscription(
  accountId: number,
  sub: Stripe.Subscription,
): Promise<void> {
  const active = ["active", "trialing", "past_due"].includes(sub.status);
  // Na API atual do Stripe o periodo corrente fica nos itens da assinatura.
  const periodEnd = sub.items?.data?.[0]?.current_period_end;
  await db
    .update(schema.accounts)
    .set({
      plan: active ? "plus" : "free",
      stripeCustomerId:
        typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripeSubscriptionId: sub.id,
      stripeStatus: sub.status,
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      planRenewsAt: periodEnd ? new Date(periodEnd * 1000) : null,
    })
    .where(eq(schema.accounts.id, accountId));
}

/** Conta dona de uma assinatura/cliente do Stripe (para eventos de webhook). */
export async function accountForSubscription(
  sub: Stripe.Subscription,
): Promise<number | null> {
  const fromMeta = Number(sub.metadata?.accountId);
  if (Number.isFinite(fromMeta) && fromMeta > 0) return fromMeta;
  const [acc] = await db
    .select({ id: schema.accounts.id })
    .from(schema.accounts)
    .where(eq(schema.accounts.stripeSubscriptionId, sub.id));
  return acc?.id ?? null;
}

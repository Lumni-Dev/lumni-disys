import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db, schema } from "@/db";

// Limites do plano Free; o Plus e ilimitado. O plano pertence ao USUARIO
// (dono): vale para os workspaces dele e para os recursos dentro deles.
export const FREE_LIMITS = {
  workspaces: 1,
  companies: 1,
  jobs: 1,
  candidates: 1,
} as const;

export type LimitedResource = "companies" | "jobs" | "candidates";

const tables = {
  companies: schema.companies,
  jobs: schema.jobs,
  candidates: schema.candidates,
} as const;

/** Linha de cobranca do usuario, criada sob demanda (plano free). */
export async function billingForEmail(email: string) {
  const [existing] = await db
    .select()
    .from(schema.userBilling)
    .where(eq(schema.userBilling.email, email));
  if (existing) return existing;
  await db
    .insert(schema.userBilling)
    .values({ email })
    .onConflictDoNothing({ target: schema.userBilling.email });
  const [row] = await db
    .select()
    .from(schema.userBilling)
    .where(eq(schema.userBilling.email, email));
  return row;
}

/** Plano do usuario (por e-mail). */
export async function planForEmail(email: string): Promise<"free" | "plus"> {
  const [row] = await db
    .select({ plan: schema.userBilling.plan })
    .from(schema.userBilling)
    .where(eq(schema.userBilling.email, email));
  return row?.plan === "plus" ? "plus" : "free";
}

/** Plano efetivo de um workspace = plano do dono dele. */
export async function planForAccount(
  accountId: number,
): Promise<"free" | "plus"> {
  const [acc] = await db
    .select({ ownerEmail: schema.accounts.ownerEmail })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, accountId));
  if (!acc) return "free";
  return planForEmail(acc.ownerEmail);
}

/** Quantidade cadastrada de um recurso limitado no workspace. */
export async function resourceCount(
  accountId: number,
  resource: LimitedResource,
): Promise<number> {
  const table = tables[resource];
  return db.$count(table, eq(table.accountId, accountId));
}

/** Quantos workspaces o e-mail possui (como dono). */
export async function workspaceCount(email: string): Promise<number> {
  return db.$count(
    schema.accounts,
    eq(schema.accounts.ownerEmail, email),
  );
}

/**
 * Bloqueio de criacao pelo plano: no Free cada recurso tem teto (pelo plano
 * do dono do workspace); atingido, devolve a resposta 402 pronta (o cliente
 * abre o modal de upgrade). No Plus retorna null (sem limite).
 */
export async function planLimitError(
  accountId: number,
  resource: LimitedResource,
): Promise<NextResponse | null> {
  const plan = await planForAccount(accountId);
  if (plan === "plus") return null;
  const count = await resourceCount(accountId, resource);
  if (count < FREE_LIMITS[resource]) return null;
  return NextResponse.json(
    { error: "plan_limit", resource, limit: FREE_LIMITS[resource] },
    { status: 402 },
  );
}

/** Bloqueio de criacao de workspace: Free permite 1; Plus e ilimitado. */
export async function workspaceLimitError(
  email: string,
): Promise<NextResponse | null> {
  const plan = await planForEmail(email);
  if (plan === "plus") return null;
  const count = await workspaceCount(email);
  if (count < FREE_LIMITS.workspaces) return null;
  return NextResponse.json(
    {
      error: "plan_limit",
      resource: "workspaces",
      limit: FREE_LIMITS.workspaces,
    },
    { status: 402 },
  );
}

/**
 * Espelha uma assinatura do Stripe na cobranca do usuario: status ativo vira
 * Plus; cancelada ou encerrada volta para Free. Usada pelo webhook e pelo
 * sync apos o retorno do checkout (fallback quando o webhook nao alcanca o
 * ambiente, ex.: desenvolvimento local).
 */
export async function applySubscription(
  email: string,
  sub: Stripe.Subscription,
): Promise<void> {
  await billingForEmail(email);
  const active = ["active", "trialing", "past_due"].includes(sub.status);
  // Na API atual do Stripe o periodo corrente fica nos itens da assinatura.
  const periodEnd = sub.items?.data?.[0]?.current_period_end;
  await db
    .update(schema.userBilling)
    .set({
      plan: active ? "plus" : "free",
      stripeCustomerId:
        typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripeSubscriptionId: sub.id,
      stripeStatus: sub.status,
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      planRenewsAt: periodEnd ? new Date(periodEnd * 1000) : null,
    })
    .where(eq(schema.userBilling.email, email));
}

/** Usuario dono de uma assinatura do Stripe (para eventos de webhook). */
export async function emailForSubscription(
  sub: Stripe.Subscription,
): Promise<string | null> {
  const fromMeta = sub.metadata?.email;
  if (fromMeta) return fromMeta;
  const [row] = await db
    .select({ email: schema.userBilling.email })
    .from(schema.userBilling)
    .where(eq(schema.userBilling.stripeSubscriptionId, sub.id));
  return row?.email ?? null;
}

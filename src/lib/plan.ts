import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db, schema } from "@/db";

export type Plan = "free" | "plus" | "max";

// Limites por plano. O plano pertence ao USUARIO (dono) e vale para os
// workspaces dele. `workspaces` e um teto TOTAL (empresas do usuario); os
// demais sao POR WORKSPACE (por empresa). null = ilimitado.
export type PlanLimits = {
  workspaces: number | null;
  jobs: number | null;
  candidates: number | null;
  processes: number | null;
  members: number | null;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { workspaces: 1, jobs: 1, candidates: 1, processes: 1, members: 1 },
  plus: { workspaces: 5, jobs: 25, candidates: 25, processes: 25, members: 5 },
  max: {
    workspaces: null,
    jobs: null,
    candidates: null,
    processes: null,
    members: null,
  },
};

// Recursos contados POR WORKSPACE (accountId).
export type LimitedResource = "jobs" | "candidates" | "processes" | "members";

const tables = {
  jobs: schema.jobs,
  candidates: schema.candidates,
  processes: schema.pipelineCards,
  members: schema.teamMembers,
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

function normalizePlan(value: string | undefined): Plan {
  return value === "plus" || value === "max" ? value : "free";
}

/** Plano do usuario (por e-mail). */
export async function planForEmail(email: string): Promise<Plan> {
  const [row] = await db
    .select({ plan: schema.userBilling.plan })
    .from(schema.userBilling)
    .where(eq(schema.userBilling.email, email));
  return normalizePlan(row?.plan);
}

/** Plano efetivo de um workspace = plano do dono dele. */
export async function planForAccount(accountId: number): Promise<Plan> {
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
 * Bloqueio de criacao pelo plano: cada recurso tem teto POR WORKSPACE segundo
 * o plano do dono; atingido, devolve a resposta 402 pronta (o cliente abre o
 * modal de upgrade). Limite null = ilimitado (Max) -> null (sem bloqueio).
 */
export async function planLimitError(
  accountId: number,
  resource: LimitedResource,
): Promise<NextResponse | null> {
  const plan = await planForAccount(accountId);
  const limit = PLAN_LIMITS[plan][resource];
  if (limit == null) return null;
  const count = await resourceCount(accountId, resource);
  if (count < limit) return null;
  return NextResponse.json(
    { error: "plan_limit", resource, limit },
    { status: 402 },
  );
}

/** Bloqueio de criacao de workspace: teto TOTAL de empresas do usuario. */
export async function workspaceLimitError(
  email: string,
): Promise<NextResponse | null> {
  const plan = await planForEmail(email);
  const limit = PLAN_LIMITS[plan].workspaces;
  if (limit == null) return null;
  const count = await workspaceCount(email);
  if (count < limit) return null;
  return NextResponse.json(
    { error: "plan_limit", resource: "workspaces", limit },
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
  // O tier (plus/max) vem da metadata da assinatura, gravada no checkout.
  const tier: Plan = sub.metadata?.tier === "max" ? "max" : "plus";
  // Na API atual do Stripe o periodo corrente fica nos itens da assinatura.
  const periodEnd = sub.items?.data?.[0]?.current_period_end;
  await db
    .update(schema.userBilling)
    .set({
      plan: active ? tier : "free",
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

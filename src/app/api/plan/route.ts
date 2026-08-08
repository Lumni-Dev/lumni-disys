import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { accountForEmail } from "@/lib/account";
import {
  FREE_LIMITS,
  accountBilling,
  applySubscription,
  resourceCount,
} from "@/lib/plan";
import { stripe, plusPriceCents } from "@/lib/stripe";

// Situacao do plano do workspace: plano atual, uso dos recursos limitados e
// dados da assinatura. Com ?session_id=..., sincroniza o retorno do checkout
// direto no Stripe (fallback para quando o webhook nao alcanca o ambiente).
export async function GET(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await accountForEmail(email);
  let acc = await accountBilling(account.id);
  if (!acc)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (sessionId && acc.ownerEmail === email) {
    try {
      const checkout = await stripe().checkout.sessions.retrieve(sessionId);
      const subId =
        typeof checkout.subscription === "string"
          ? checkout.subscription
          : checkout.subscription?.id;
      // So aplica se o checkout for mesmo desta conta.
      if (subId && Number(checkout.metadata?.accountId) === account.id) {
        const sub = await stripe().subscriptions.retrieve(subId);
        await applySubscription(account.id, sub);
        acc = (await accountBilling(account.id)) ?? acc;
      }
    } catch {
      // Sessao invalida/expirada: segue com os dados atuais do banco.
    }
  }

  const [companies, jobs, candidates] = await Promise.all([
    resourceCount(account.id, "companies"),
    resourceCount(account.id, "jobs"),
    resourceCount(account.id, "candidates"),
  ]);

  return NextResponse.json({
    plan: acc.plan === "plus" ? "plus" : "free",
    isOwner: acc.ownerEmail === email,
    usage: { companies, jobs, candidates },
    limits: FREE_LIMITS,
    // Mensalidade vigente do Plus em centavos (PLUS_PRICE_CENTS no env).
    priceCents: plusPriceCents(),
    status: acc.stripeStatus,
    cancelAtPeriodEnd: acc.cancelAtPeriodEnd,
    renewsAt: acc.planRenewsAt,
  });
}

// Gerencia a assinatura ativa: agenda o cancelamento para o fim do periodo
// pago ou o reativa. Somente o dono do workspace.
export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await accountForEmail(email);
  const acc = await accountBilling(account.id);
  if (!acc || acc.ownerEmail !== email)
    return NextResponse.json({ error: "owner_only" }, { status: 403 });
  if (!acc.stripeSubscriptionId)
    return NextResponse.json({ error: "no_subscription" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action;
  if (action !== "cancel" && action !== "resume")
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });

  const sub = await stripe().subscriptions.update(acc.stripeSubscriptionId, {
    cancel_at_period_end: action === "cancel",
  });
  await applySubscription(account.id, sub);

  return NextResponse.json({ ok: true });
}

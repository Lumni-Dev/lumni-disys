import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { accountForEmail } from "@/lib/account";
import {
  FREE_LIMITS,
  applySubscription,
  billingForEmail,
  resourceCount,
  workspaceCount,
} from "@/lib/plan";
import { stripe, plusPriceCents } from "@/lib/stripe";

// Situacao do plano do USUARIO: plano atual, uso dos recursos limitados
// (workspaces proprios + recursos do workspace ativo) e dados da assinatura.
// Com ?session_id=..., sincroniza o retorno do checkout direto no Stripe
// (fallback para quando o webhook nao alcanca o ambiente).
export async function GET(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let billing = await billingForEmail(email);

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (sessionId) {
    try {
      const checkout = await stripe().checkout.sessions.retrieve(sessionId);
      const subId =
        typeof checkout.subscription === "string"
          ? checkout.subscription
          : checkout.subscription?.id;
      // So aplica se o checkout for mesmo deste usuario.
      if (subId && checkout.metadata?.email === email) {
        const sub = await stripe().subscriptions.retrieve(subId);
        await applySubscription(email, sub);
        billing = await billingForEmail(email);
      }
    } catch {
      // Sessao invalida/expirada: segue com os dados atuais do banco.
    }
  }

  const account = await accountForEmail(email);
  const [workspaces, jobs, candidates] = await Promise.all([
    workspaceCount(email),
    account ? resourceCount(account.id, "jobs") : 0,
    account ? resourceCount(account.id, "candidates") : 0,
  ]);

  return NextResponse.json({
    plan: billing.plan === "plus" ? "plus" : "free",
    usage: { workspaces, jobs, candidates },
    limits: FREE_LIMITS,
    // Mensalidade vigente do Plus em centavos (PLUS_PRICE_CENTS no env).
    priceCents: plusPriceCents(),
    status: billing.stripeStatus,
    cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
    renewsAt: billing.planRenewsAt,
  });
}

// Gerencia a assinatura ativa do usuario: agenda o cancelamento para o fim
// do periodo pago ou o reativa.
export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const billing = await billingForEmail(email);
  if (!billing.stripeSubscriptionId)
    return NextResponse.json({ error: "no_subscription" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action;
  if (action !== "cancel" && action !== "resume")
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });

  const sub = await stripe().subscriptions.update(
    billing.stripeSubscriptionId,
    { cancel_at_period_end: action === "cancel" },
  );
  await applySubscription(email, sub);

  return NextResponse.json({ ok: true });
}

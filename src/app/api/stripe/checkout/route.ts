import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { applySubscription, billingForEmail } from "@/lib/plan";
import { stripe, productId, priceCents, type PaidTier } from "@/lib/stripe";

// Inicia a assinatura de um tier pago (plus/max) para o USUARIO logado: cria
// a sessao de checkout do Stripe e devolve a URL de pagamento.
export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const tier: PaidTier = body?.tier === "max" ? "max" : "plus";

  const billing = await billingForEmail(email);
  if (billing.plan === tier)
    return NextResponse.json({ error: "already_on_tier" }, { status: 400 });

  const origin = new URL(req.url).origin;
  const priceData = {
    currency: "brl",
    product: productId(tier),
    unit_amount: priceCents(tier),
    recurring: { interval: "month" as const },
  };

  // Ja assinante de um tier pago: troca o tier ATUALIZANDO a assinatura
  // existente (com proporcao), em vez de criar uma segunda. Evita cobranca
  // duplicada. Nao passa pelo checkout: aplica e volta para /plan.
  if (billing.stripeSubscriptionId) {
    try {
      const current = await stripe().subscriptions.retrieve(
        billing.stripeSubscriptionId,
      );
      if (["active", "trialing", "past_due"].includes(current.status)) {
        const itemId = current.items.data[0]?.id;
        const updated = await stripe().subscriptions.update(
          billing.stripeSubscriptionId,
          {
            items: [{ id: itemId, price_data: priceData }],
            proration_behavior: "create_prorations",
            cancel_at_period_end: false,
            metadata: { email, tier },
          },
        );
        await applySubscription(email, updated);
        return NextResponse.json({ url: `${origin}/plan?checkout=success` });
      }
    } catch {
      // Assinatura sumiu/invalida no modo atual: cai para o checkout novo.
    }
  }

  // Reusa o cliente do Stripe do usuario, se ja existir (evita duplicar).
  // O ID salvo pode ser do outro modo (test x live, ex.: apos alternar o
  // STRIPE_MODE): valida no modo atual e descarta se nao existir la.
  let customerId = billing.stripeCustomerId;
  if (customerId) {
    try {
      const existing = await stripe().customers.retrieve(customerId);
      if (existing.deleted) customerId = "";
    } catch {
      customerId = "";
    }
  }
  if (!customerId) {
    const customer = await stripe().customers.create({
      email,
      metadata: { appEmail: email },
    });
    customerId = customer.id;
    await db
      .update(schema.userBilling)
      .set({ stripeCustomerId: customerId })
      .where(eq(schema.userBilling.email, email));
  }

  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    // Preco inline: o valor vem do env ({PLUS,MAX}_PRICE_CENTS), entao da para
    // mudar a mensalidade sem criar preco novo no dashboard do Stripe.
    line_items: [{ price_data: priceData, quantity: 1 }],
    // O session_id permite sincronizar o plano no retorno mesmo sem webhook
    // (ex.: desenvolvimento local).
    success_url: `${origin}/plan?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/plan?checkout=canceled`,
    metadata: { email, tier },
    subscription_data: { metadata: { email, tier } },
    locale: "auto",
  });

  return NextResponse.json({ url: checkout.url });
}

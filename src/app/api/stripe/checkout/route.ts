import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { billingForEmail } from "@/lib/plan";
import { stripe, plusProductId, plusPriceCents } from "@/lib/stripe";

// Inicia a assinatura do Plus para o USUARIO logado: cria a sessao de
// checkout do Stripe e devolve a URL de pagamento.
export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const billing = await billingForEmail(email);
  if (billing.plan === "plus")
    return NextResponse.json({ error: "already_plus" }, { status: 400 });

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

  const origin = new URL(req.url).origin;
  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    // Preco inline: o valor vem do env (PLUS_PRICE_CENTS), entao da para
    // mudar a mensalidade sem criar preco novo no dashboard do Stripe.
    line_items: [
      {
        price_data: {
          currency: "brl",
          product: plusProductId(),
          unit_amount: plusPriceCents(),
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    // O session_id permite sincronizar o plano no retorno mesmo sem webhook
    // (ex.: desenvolvimento local).
    success_url: `${origin}/plan?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/plan?checkout=canceled`,
    metadata: { email },
    subscription_data: { metadata: { email } },
    locale: "auto",
  });

  return NextResponse.json({ url: checkout.url });
}

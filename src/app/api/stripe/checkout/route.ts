import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { accountForEmail } from "@/lib/account";
import { stripe, plusProductId, plusPriceCents } from "@/lib/stripe";

// Inicia a assinatura do Plus: cria a sessao de checkout do Stripe e devolve
// a URL de pagamento. Somente o dono do workspace pode assinar.
export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await accountForEmail(email);
  const [acc] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.id, account.id));
  if (!acc || acc.ownerEmail !== email)
    return NextResponse.json({ error: "owner_only" }, { status: 403 });
  if (acc.plan === "plus")
    return NextResponse.json({ error: "already_plus" }, { status: 400 });

  // Reusa o cliente do Stripe da conta, se ja existir (evita duplicar).
  let customerId = acc.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email,
      metadata: { accountId: String(account.id) },
    });
    customerId = customer.id;
    await db
      .update(schema.accounts)
      .set({ stripeCustomerId: customerId })
      .where(eq(schema.accounts.id, account.id));
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
    client_reference_id: String(account.id),
    metadata: { accountId: String(account.id) },
    subscription_data: { metadata: { accountId: String(account.id) } },
    locale: "auto",
  });

  return NextResponse.json({ url: checkout.url });
}

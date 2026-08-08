import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, webhookSecret } from "@/lib/stripe";
import { accountForSubscription, applySubscription } from "@/lib/plan";

// Webhook do Stripe: mantem o plano da conta espelhando a assinatura.
// Rota publica (sem sessao) protegida pela assinatura do evento.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature") ?? "";
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret(),
    );
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    // Pagamento inicial concluido: ativa o Plus na conta do checkout.
    case "checkout.session.completed": {
      const session = event.data.object;
      const accountId = Number(
        session.metadata?.accountId ?? session.client_reference_id,
      );
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (Number.isFinite(accountId) && accountId > 0 && subId) {
        const sub = await stripe().subscriptions.retrieve(subId);
        await applySubscription(accountId, sub);
      }
      break;
    }
    // Mudancas na assinatura (renovacao, cancelamento agendado, falha de
    // pagamento, encerramento): reflete o estado atual na conta.
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const accountId = await accountForSubscription(sub);
      if (accountId) await applySubscription(accountId, sub);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

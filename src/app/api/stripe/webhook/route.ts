import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, webhookSecret } from "@/lib/stripe";
import { applySubscription, emailForSubscription } from "@/lib/plan";

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

    case "checkout.session.completed": {
      const session = event.data.object;
      const email = session.metadata?.email;
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (email && subId) {
        const sub = await stripe().subscriptions.retrieve(subId);
        await applySubscription(email, sub);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const email = await emailForSubscription(sub);
      if (email) await applySubscription(email, sub);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { accountForEmail } from "@/lib/account";
import {
  PLAN_LIMITS,
  applySubscription,
  billingForEmail,
  resourceCount,
  workspaceCount,
} from "@/lib/plan";
import { stripe, priceCents } from "@/lib/stripe";

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

      if (subId && checkout.metadata?.email === email) {
        const sub = await stripe().subscriptions.retrieve(subId);
        await applySubscription(email, sub);
        billing = await billingForEmail(email);
      }
    } catch {

    }
  }

  const plan =
    billing.plan === "plus" || billing.plan === "max" ? billing.plan : "free";

  const account = await accountForEmail(email);
  const [workspaces, jobs, candidates, processes, members] = await Promise.all([
    workspaceCount(email),
    account ? resourceCount(account.id, "jobs") : 0,
    account ? resourceCount(account.id, "candidates") : 0,
    account ? resourceCount(account.id, "processes") : 0,
    account ? resourceCount(account.id, "members") : 0,
  ]);

  return NextResponse.json({
    plan,

    usage: { workspaces, jobs, candidates, processes, members },
    limits: PLAN_LIMITS[plan],

    prices: { plus: priceCents("plus"), max: priceCents("max") },
    status: billing.stripeStatus,
    cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
    renewsAt: billing.planRenewsAt,
  });
}

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

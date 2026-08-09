import Stripe from "stripe";

const MODE = process.env.STRIPE_MODE === "live" ? "LIVE" : "TEST";

function env(name: string): string {
  return process.env[`STRIPE_${MODE}_${name}`] ?? "";
}

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) client = new Stripe(env("SECRET_KEY"));
  return client;
}

export type PaidTier = "plus" | "max";

export function productId(tier: PaidTier): string {
  return env(tier === "max" ? "PRODUCT_MAX" : "PRODUCT_PLUS");
}

export function priceCents(tier: PaidTier): number {
  const raw =
    tier === "max" ? process.env.MAX_PRICE_CENTS : process.env.PLUS_PRICE_CENTS;
  const cents = Number(raw);
  const fallback = tier === "max" ? 14990 : 4990;
  return Number.isFinite(cents) && cents > 0 ? Math.round(cents) : fallback;
}

export function webhookSecret(): string {
  return env("WEBHOOK_SECRET");
}

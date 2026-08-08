import Stripe from "stripe";

// Modo ativo do Stripe, controlado por STRIPE_MODE no .env ("test" | "live").
// As chaves dos dois ambientes ficam salvas juntas (STRIPE_TEST_* e
// STRIPE_LIVE_*); trocar o modo alterna tudo de uma vez.
const MODE = process.env.STRIPE_MODE === "live" ? "LIVE" : "TEST";

function env(name: string): string {
  return process.env[`STRIPE_${MODE}_${name}`] ?? "";
}

let client: Stripe | null = null;

/** Cliente do Stripe no modo ativo, criado sob demanda. */
export function stripe(): Stripe {
  if (!client) client = new Stripe(env("SECRET_KEY"));
  return client;
}

export type PaidTier = "plus" | "max";

/** Produto do Stripe do tier no modo ativo (STRIPE_{MODE}_PRODUCT_{TIER}). */
export function productId(tier: PaidTier): string {
  return env(tier === "max" ? "PRODUCT_MAX" : "PRODUCT_PLUS");
}

/**
 * Valor da mensalidade do tier em centavos ({PLUS,MAX}_PRICE_CENTS no .env).
 * Controla o valor cobrado no checkout e o exibido na pagina do plano;
 * assinaturas ja ativas mantem o valor com que foram contratadas.
 */
export function priceCents(tier: PaidTier): number {
  const raw =
    tier === "max" ? process.env.MAX_PRICE_CENTS : process.env.PLUS_PRICE_CENTS;
  const cents = Number(raw);
  const fallback = tier === "max" ? 18990 : 8990;
  return Number.isFinite(cents) && cents > 0 ? Math.round(cents) : fallback;
}

/** Segredo do endpoint de webhook no modo ativo. */
export function webhookSecret(): string {
  return env("WEBHOOK_SECRET");
}

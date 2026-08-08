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

/** Produto "Lumni Plus" no modo ativo (o preco vem de PLUS_PRICE_CENTS). */
export function plusProductId(): string {
  return env("PRODUCT_PLUS");
}

/**
 * Valor da mensalidade do Plus em centavos (PLUS_PRICE_CENTS no .env).
 * Controla o valor cobrado no checkout e o exibido na pagina do plano;
 * assinaturas ja ativas mantem o valor com que foram contratadas.
 */
export function plusPriceCents(): number {
  const cents = Number(process.env.PLUS_PRICE_CENTS);
  return Number.isFinite(cents) && cents > 0 ? Math.round(cents) : 1990;
}

/** Segredo do endpoint de webhook no modo ativo. */
export function webhookSecret(): string {
  return env("WEBHOOK_SECRET");
}

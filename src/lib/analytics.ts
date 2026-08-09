export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID ?? "";
export const GADS_SIGNUP_LABEL = process.env.NEXT_PUBLIC_GADS_SIGNUP_LABEL ?? "";

type GtagFn = (...args: unknown[]) => void;

function gtag(...args: unknown[]): void {
  (window as unknown as { gtag?: GtagFn }).gtag?.(...args);
}

// Dispara a conversao de cadastro no Google Ads e so entao executa o callback
// (padrao do Google: redirecionar no event_callback para o clique ser contado).
// Sempre chama o callback, mesmo sem gtag/rotulo configurado, com um timeout de
// seguranca para nunca travar o redirecionamento.
export function trackSignup(done: () => void): void {
  const hasGtag = typeof window !== "undefined" && "gtag" in window;
  if (!hasGtag) {
    done();
    return;
  }

  // Evento GA4 (pode ser importado como conversao no Google Ads).
  if (GA_ID) gtag("event", "sign_up", { method: "workspace" });

  // Conversao direta no Google Ads (quando o tag AW e o rotulo estao definidos):
  // redireciona no event_callback para garantir que o clique seja contado.
  const label =
    GADS_ID && GADS_SIGNUP_LABEL ? `${GADS_ID}/${GADS_SIGNUP_LABEL}` : "";
  if (!label) {
    done();
    return;
  }

  let called = false;
  const run = () => {
    if (called) return;
    called = true;
    done();
  };
  gtag("event", "conversion", { send_to: label, event_callback: run });
  setTimeout(run, 1200);
}

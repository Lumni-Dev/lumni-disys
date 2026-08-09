export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID ?? "";
export const GADS_SIGNUP_LABEL = process.env.NEXT_PUBLIC_GADS_SIGNUP_LABEL ?? "";

export const ANALYTICS_ENABLED = !!(GA_ID || GADS_ID);
const CONSENT_KEY = "disys-consent";

type GtagFn = (...args: unknown[]) => void;

function gtag(...args: unknown[]): void {
  (window as unknown as { gtag?: GtagFn }).gtag?.(...args);
}

// Retorna true quando o usuario ja escolheu (aceitou ou recusou) os cookies.
export function hasConsentChoice(): boolean {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied";
  } catch {
    return false;
  }
}

// Persiste a escolha e atualiza o Consent Mode do gtag (ad + analytics).
export function setAdConsent(granted: boolean): void {
  const v = granted ? "granted" : "denied";
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {
    // ignore
  }
  gtag("consent", "update", {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  });
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

"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ANALYTICS_ENABLED,
  hasConsentChoice,
  setAdConsent,
} from "@/lib/analytics";

function subscribe() {
  return () => {};
}

// Banner de consentimento de cookies (Consent Mode v2). So aparece quando o
// analytics esta configurado e o usuario ainda nao escolheu. Enquanto isso, o
// gtag ja roda com consentimento negado (definido no init).
export function ConsentBanner() {
  // No servidor assume "ja escolheu" (esconde) para nao dar mismatch; no cliente
  // le a escolha real de localStorage.
  const chosen = useSyncExternalStore(
    subscribe,
    hasConsentChoice,
    () => true,
  );
  const [dismissed, setDismissed] = useState(false);

  if (!ANALYTICS_ENABLED || chosen || dismissed) return null;

  function choose(granted: boolean) {
    setAdConsent(granted);
    setDismissed(true);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-2.5">
      <div className="flex w-full max-w-2xl flex-col items-start gap-2.5 rounded-lg border border-border bg-surface p-2.5 shadow-lg sm:flex-row sm:items-center">
        <p className="flex-1 text-xs text-muted">
          Usamos cookies para medir o tráfego e melhorar sua experiência. Veja
          nossa{" "}
          <Link
            href="/privacidade"
            className="text-foreground underline underline-offset-2"
          >
            política de privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2.5">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-hairline-strong"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}

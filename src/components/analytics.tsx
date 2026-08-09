import Script from "next/script";
import { GA_ID, GADS_ID } from "@/lib/analytics";

// Carrega o gtag.js (GA4 e/ou Google Ads) somente quando um ID esta definido
// nas envs NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_GADS_ID. Sem ID, nao renderiza nada.
export function Analytics() {
  const primary = GA_ID || GADS_ID;
  if (!primary) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primary}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${GA_ID ? `gtag('config', '${GA_ID}');` : ""}
${GADS_ID ? `gtag('config', '${GADS_ID}');` : ""}`}
      </Script>
    </>
  );
}

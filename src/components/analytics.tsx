import Script from "next/script";
import { GA_ID, GADS_ID } from "@/lib/analytics";

// Carrega o gtag.js (GA4 e/ou Google Ads) somente quando um ID esta definido
// nas envs NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_GADS_ID. Sem ID, nao renderiza nada.
// Consent Mode v2: consentimento negado por padrao; so libera cookies apos o
// aceite (persistido em localStorage e reaplicado aqui no carregamento).
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
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
try {
  if (localStorage.getItem('disys-consent') === 'granted') {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
} catch (e) {}
${GA_ID ? `gtag('config', '${GA_ID}');` : ""}
${GADS_ID ? `gtag('config', '${GADS_ID}');` : ""}`}
      </Script>
    </>
  );
}

import Script from "next/script";
import { GA_ID, GADS_ID } from "@/lib/analytics";

// gtag.js (GA4 e/ou Google Ads) via next/script — confiavel e sem mismatch de
// hidratacao. Init em linha unica (sem quebras de linha) para nao correr risco
// de serializacao. Renderiza nada quando nenhum ID esta nas envs
// NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_GADS_ID.
// Modelo opt-out (LGPD-BR): roda por padrao; o banner permite recusar, gravando
// 'denied' em localStorage, reaplicado aqui no carregamento.
export function Analytics() {
  const primary = GA_ID || GADS_ID;
  if (!primary) return null;

  const init =
    "window.dataLayer=window.dataLayer||[];" +
    "function gtag(){dataLayer.push(arguments);}" +
    "gtag('js',new Date());" +
    "try{if(localStorage.getItem('disys-consent')==='denied'){gtag('consent','update',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});}}catch(e){}" +
    (GA_ID ? `gtag('config','${GA_ID}');` : "") +
    (GADS_ID ? `gtag('config','${GADS_ID}');` : "");

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primary}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {init}
      </Script>
    </>
  );
}

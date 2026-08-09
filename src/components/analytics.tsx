// beforeInteractive no root layout e o uso correto no App Router; a regra
// abaixo e do Pages Router antigo (falso-positivo aqui).
/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import Script from "next/script";
import { GA_ID, GADS_ID } from "@/lib/analytics";

// gtag.js (GA4 e/ou Google Ads) via next/script beforeInteractive: o Next injeta
// no <head> cedo (ajuda a deteccao do tag) e gerencia a hidratacao (sem
// mismatch). Renderiza nada quando nenhum ID esta nas envs NEXT_PUBLIC_GA_ID /
// _GADS_ID. Consent Mode v2: consentimento negado por padrao; reaplica a escolha.
export function Analytics() {
  const primary = GA_ID || GADS_ID;
  if (!primary) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primary}`}
        strategy="beforeInteractive"
      />
      <Script id="gtag-init" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{if(localStorage.getItem('disys-consent')==='granted'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});}}catch(e){}
${GA_ID ? `gtag('config','${GA_ID}');` : ""}
${GADS_ID ? `gtag('config','${GADS_ID}');` : ""}`}
      </Script>
    </>
  );
}

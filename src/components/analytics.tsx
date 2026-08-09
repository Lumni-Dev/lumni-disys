import { GA_ID, GADS_ID } from "@/lib/analytics";

// gtag.js (GA4 e/ou Google Ads) direto no <head>, como o snippet oficial do
// Google (carrega imediatamente — melhora a deteccao do tag). Renderiza nada
// quando nenhum ID esta definido nas envs NEXT_PUBLIC_GA_ID / _GADS_ID.
// Consent Mode v2: consentimento negado por padrao; reaplica a escolha salva.
export function Analytics() {
  const primary = GA_ID || GADS_ID;
  if (!primary) return null;

  const init = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{if(localStorage.getItem('disys-consent')==='granted'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});}}catch(e){}
${GA_ID ? `gtag('config','${GA_ID}');` : ""}
${GADS_ID ? `gtag('config','${GADS_ID}');` : ""}`;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${primary}`}
      />
      <script dangerouslySetInnerHTML={{ __html: init }} />
    </>
  );
}

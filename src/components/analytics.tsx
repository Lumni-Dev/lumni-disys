import { GA_ID, GADS_ID } from "@/lib/analytics";

// Snippet oficial do Google (gtag.js) inline no <head>, carregando de imediato
// — igual ao que o Google gera, para a deteccao do tag funcionar. Renderiza um
// unico <script> (mesmo padrao do script de tema), evitando o mismatch de
// hidratacao que ocorre ao colocar um <script src> como JSX no head.
// Modelo opt-out (LGPD-BR): o tag roda por padrao; o banner permite recusar,
// que grava 'denied' em localStorage e e reaplicado aqui no carregamento.
export function Analytics() {
  const primary = GA_ID || GADS_ID;
  if (!primary) return null;

  const html = `var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${primary}';document.head.appendChild(s);
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
try{if(localStorage.getItem('disys-consent')==='denied'){gtag('consent','update',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});}}catch(e){}
${GA_ID ? `gtag('config','${GA_ID}');` : ""}
${GADS_ID ? `gtag('config','${GADS_ID}');` : ""}`;

  return <script dangerouslySetInnerHTML={{ __html: html }} />;
}

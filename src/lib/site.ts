// Metadados centrais do site (SEO). O dominio pode ser sobrescrito por env
// (NEXT_PUBLIC_SITE_URL) para facilitar ambientes/dominios diferentes.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://disys.lumni.dev.br"
).replace(/\/+$/, "");

export const SITE_NAME = "DISYS";

export const SITE_TITLE =
  "DISYS — ATS de recrutamento com análise de currículos por IA";

export const SITE_DESCRIPTION =
  "ATS completo para recrutamento e seleção: gerencie vagas, candidatos e processos em um só fluxo, com análise de currículos e compatibilidade por IA de 0 a 100. Comece grátis.";

export const SITE_KEYWORDS = [
  "ATS",
  "software de recrutamento",
  "recrutamento e seleção",
  "triagem de currículos com IA",
  "análise de currículo por IA",
  "compatibilidade de candidatos",
  "gestão de vagas",
  "banco de talentos",
  "pipeline de recrutamento",
  "software de RH",
  "recursos humanos",
  "sistema de recrutamento",
];

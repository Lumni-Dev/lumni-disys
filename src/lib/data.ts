const firstNames = [
  "Ana", "Carlos", "Marina", "João", "Beatriz", "Rafael", "Luana", "Pedro",
  "Camila", "Bruno", "Fernanda", "Lucas", "Juliana", "Gabriel", "Patrícia",
  "Rodrigo", "Aline", "Thiago", "Mariana", "Felipe", "Bianca", "Gustavo",
  "Larissa", "Diego", "Natália", "Vinícius", "Priscila", "André", "Carolina",
  "Marcelo",
];

const lastNames = [
  "Ribeiro", "Souza", "Alves", "Pereira", "Lima", "Gomes", "Dias", "Nunes",
  "Costa", "Rocha", "Martins", "Almeida", "Barbosa", "Cardoso", "Teixeira",
  "Moreira", "Carvalho", "Ferreira", "Araújo", "Ramos", "Mendes", "Freitas",
  "Correia", "Pinto", "Monteiro", "Cavalcanti", "Duarte", "Nascimento",
  "Machado", "Vieira",
];

const companyNames = [
  "TechNova S.A.", "Nuvem Ltda", "FinPay", "Orbital Design", "Verde Logística",
  "MedCare Saúde", "Loja Prime", "EduMais", "Indústria X", "Varejo Top",
  "DataForge", "CloudZ", "Bright Labs", "NextWave", "Alpha Sistemas",
  "Beta Digital", "Gamma Tech", "Delta Soft", "Nova Mídia", "Vetor TI",
  "Pulse Health", "Onda Bank", "Raiz Agro", "Norte Log", "Sul Energia",
  "Vertex Cloud", "Lumen Data", "Aura Design", "Fluxo Pay", "Zênite Soft",
];

const sectors = [
  "Tecnologia", "SaaS / Cloud", "Fintech", "Design & UX", "Logística",
  "Saúde", "E-commerce", "Educação", "Indústria", "Varejo",
];

const cities = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Curitiba, PR", "Campinas, SP",
  "Belo Horizonte, MG", "Porto Alegre, RS", "Recife, PE",
  "Florianópolis, SC", "Remoto",
];

const roles = [
  "Desenvolvedor(a) Backend Sênior", "Designer UX Pleno",
  "Analista de Dados Pleno", "Product Manager", "Analista de RH Júnior",
  "Desenvolvedor(a) Frontend Pleno", "DevOps Sênior", "QA Analyst",
  "Scrum Master", "Analista Financeiro",
];

const stages = [
  "Triagem", "Entrevista RH", "Teste técnico", "Entrevista final", "Proposta",
] as const;

const levels = ["Estágio", "Trainee", "Júnior", "Pleno", "Sênior", "Temporário"];
const jobTypes = ["Remoto", "Híbrido", "Presencial"];

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function modifiedDate(i: number) {
  const d = new Date(2026, 7, 1 - i);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export type Company = {
  id: number;
  name: string;
  sector: string;
  location: string;
  openings: number;
  status: "Ativa" | "Pausada";
};

export const companies: Company[] = range(30).map((i) => ({
  id: i + 1,
  name: companyNames[i % companyNames.length],
  sector: sectors[i % sectors.length],
  location: cities[i % cities.length],
  openings: (i % 6) + 1,
  status: i % 5 === 0 ? "Pausada" : "Ativa",
}));

export type Job = {
  id: number;
  title: string;
  /** Empresa vinculada por ID (a fonte da verdade do vinculo). */
  companyId?: number | null;
  company: string;
  description: string;
  type: string;
  level: string;
  openings: number;
  applicants: number;
  status: "Aberta" | "Em análise" | "Fechada";
  postedAt?: string;
};

export const jobs: Job[] = range(30).map((i) => ({
  id: i + 1,
  title: roles[i % roles.length],
  company: companyNames[i % companyNames.length],
  description: "",
  type: jobTypes[i % jobTypes.length],
  level: levels[i % levels.length],
  openings: (i % 4) + 1,
  applicants: ((i * 7) % 45) + 4,
  status: i % 7 === 0 ? "Fechada" : i % 5 === 0 ? "Em análise" : "Aberta",
}));

export type Candidate = {
  id: number;
  name: string;
  role: string;
  email: string;
  stage: (typeof stages)[number];
  modifiedAt: string;
  linkedin?: string;
  hasCv?: boolean;
  cvName?: string;
  /** Payload transitorio de upload do modal (data URL); nao vem da API. */
  cvData?: string;
  matchScore?: number | null;
};

export const candidates: Candidate[] = range(30).map((i) => {
  const name = `${firstNames[i % firstNames.length]} ${
    lastNames[i % lastNames.length]
  }`;
  return {
    id: i + 1,
    name,
    role: roles[i % roles.length],
    email: `${name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\s+/g, ".")}@email.com`,
    stage: stages[i % stages.length],
    modifiedAt: modifiedDate(i),
  };
});

export type PipelineCard = {
  id: number;
  name: string;
  job: string;
  company: string;
};
export type Column = { stage: string; cards: PipelineCard[] };

export const initialColumns: Column[] = stages.map((stage, col) => ({
  stage,
  cards: range(6).map((r) => {
    const i = col * 6 + r;
    return {
      id: i + 1,
      name: `${firstNames[i % firstNames.length]} ${
        lastNames[i % lastNames.length]
      }`,
      job: roles[i % roles.length],
      company: companyNames[i % companyNames.length].split(" ")[0],
    };
  }),
}));

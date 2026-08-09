import type { Landing } from "@/i18n/types";

const pt: Landing = {
  languageLabel: "Idioma",
  nav: {
    modules: "Módulos",
    features: "Recursos",
    access: "Acesso",
    pricing: "Planos",
    signIn: "Entrar",
  },
  pricing: {
    title: "Planos e preços",
    subtitle: "Comece grátis e evolua quando precisar.",
    cta: "Começar",
  },
  hero: {
    badge: "Análise de currículos por IA",
    titleLead: "O ATS de Recursos Humanos",
    titleAccent: "prático e rápido",
    subtitle:
      "Empresas, vagas, candidatos e processos em uma única plataforma, com análise de currículos por IA. Recrute melhor, do primeiro contato à contratação.",
    ctaGuest: "Acessar sistema",
    ctaAuthed: "Ir para o sistema",
    ctaSecondary: "Ver módulos",
  },
  kpis: {
    companies: "Workspaces",
    openJobs: "Vagas abertas",
    candidates: "Candidatos",
    inProcess: "Em processo",
  },
  stats: ["Módulos integrados", "Idiomas", "Senhas para lembrar", "Disponível"],
  modulesSection: {
    title: "Tudo que o seu RH precisa",
    subtitle:
      "Cinco módulos integrados que conversam entre si e mantêm todo o recrutamento em um só fluxo.",
  },
  modules: [
    {
      title: "Workspaces",
      desc: "Organize cada empresa ou equipe em um workspace próprio e alterne entre eles quando quiser.",
    },
    {
      title: "Vagas",
      desc: "Publique com descrição completa e compartilhe o link público de cada vaga para receber candidaturas.",
    },
    {
      title: "Candidatos",
      desc: "Talentos com currículo anexado e compatibilidade com a vaga calculada por IA, de 0 a 100.",
    },
    {
      title: "Processos",
      desc: "Pipeline visual com arrastar e soltar; novas candidaturas já entram na triagem sozinhas.",
    },
    {
      title: "Colaboradores",
      desc: "Convide por e-mail com aceite, defina permissões por página e alterne entre workspaces.",
    },
  ],
  features: [
    {
      title: "Compatibilidade por IA",
      desc: "Cada currículo recebido é analisado contra a vaga e ganha uma nota de 0 a 100.",
    },
    {
      title: "Login seguro",
      desc: "Acesso apenas com Google ou LinkedIn, sem senhas para gerenciar.",
    },
    {
      title: "Vagas públicas",
      desc: "Divulgue o link do workspace ou de uma vaga específica e receba candidaturas com currículo.",
    },
  ],
  cta: {
    title: "Comece a recrutar de forma inteligente",
    subtitle: "Entre com sua conta e tenha acesso imediato a toda a plataforma.",
  },
  footer: {
    description:
      "A Lumni constrói sistemas, automatiza processos e embute engenheiros no seu time. Do primeiro diagnóstico ao código em produção.",
    servicesHeading: "Serviços",
    services: [
      "Desenvolvimento de sistemas e aplicações",
      "Automação de processos",
      "Consultoria em tecnologia",
      "Cibersegurança",
      "Suporte a desenvolvimento",
    ],
    contactHeading: "Contato",
    privacy: "Privacidade",
    terms: "Termos",
    backToTop: "Voltar ao topo",
    rights: "Todos os direitos reservados.",
  },
};

export default pt;

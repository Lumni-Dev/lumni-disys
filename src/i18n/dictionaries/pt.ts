import type { Landing } from "@/i18n/types";

const pt: Landing = {
  languageLabel: "Idioma",
  nav: {
    modules: "Módulos",
    features: "Recursos",
    access: "Acesso",
    signIn: "Entrar",
  },
  hero: {
    titleLead: "O ATS de Recursos Humanos",
    titleAccent: "prático e rápido",
    subtitle:
      "Empresas, vagas, candidatos e processos em uma única plataforma rápida, segura e conectada. Recrute melhor, do primeiro contato à contratação.",
    ctaGuest: "Acessar sistema",
    ctaAuthed: "Ir para o sistema",
    ctaSecondary: "Ver módulos",
  },
  kpis: {
    companies: "Empresas",
    openJobs: "Vagas abertas",
    candidates: "Candidatos",
    inProcess: "Em processo",
  },
  stats: ["Módulos integrados", "Na nuvem", "Senhas para lembrar", "Disponível"],
  modulesSection: {
    title: "Tudo que o seu RH precisa",
    subtitle:
      "Cinco módulos integrados que conversam entre si e mantêm todo o recrutamento em um só fluxo.",
  },
  modules: [
    {
      title: "Empresas",
      desc: "Cadastre clientes e unidades com dados completos e status em tempo real.",
    },
    {
      title: "Vagas",
      desc: "Publique oportunidades, defina níveis, faixas salariais e acompanhe aberturas.",
    },
    {
      title: "Candidatos",
      desc: "Centralize talentos, currículos e portfólios em uma base pesquisável.",
    },
    {
      title: "Processos",
      desc: "Pipeline visual com arrastar e soltar para mover candidatos entre etapas.",
    },
    {
      title: "Colaboradores",
      desc: "Convide sua equipe por e-mail e controle permissões por página.",
    },
  ],
  features: [
    {
      title: "Rápido de verdade",
      desc: "Interface enxuta, atalhos e busca instantânea em todas as páginas.",
    },
    {
      title: "Login seguro",
      desc: "Acesso apenas com Google ou LinkedIn, sem senhas para gerenciar.",
    },
    {
      title: "Tudo organizado",
      desc: "Empresas, vagas, candidatos e processos conectados em um só lugar.",
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

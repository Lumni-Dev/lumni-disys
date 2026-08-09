import type { Landing } from "@/i18n/types";

const es: Landing = {
  languageLabel: "Idioma",
  nav: {
    modules: "Módulos",
    features: "Características",
    access: "Acceso",
    pricing: "Planes",
    signIn: "Iniciar sesión",
  },
  pricing: {
    title: "Planes y precios",
    subtitle: "Empieza gratis y mejora cuando lo necesites.",
    cta: "Comenzar",
  },
  hero: {
    titleLead: "El ATS de RR. HH.",
    titleAccent: "práctico y rápido",
    subtitle:
      "Empresas, vacantes, candidatos y procesos en una sola plataforma, con análisis de currículums por IA. Recluta mejor, desde el primer contacto hasta la contratación.",
    ctaGuest: "Entrar al sistema",
    ctaAuthed: "Ir al sistema",
    ctaSecondary: "Ver módulos",
  },
  kpis: {
    companies: "Workspaces",
    openJobs: "Vacantes abiertas",
    candidates: "Candidatos",
    inProcess: "En proceso",
  },
  stats: ["Módulos integrados", "Idiomas", "Contraseñas que recordar", "Disponible"],
  modulesSection: {
    title: "Todo lo que tu RR. HH. necesita",
    subtitle:
      "Cinco módulos integrados que se comunican entre sí y mantienen todo el reclutamiento en un solo flujo.",
  },
  modules: [
    {
      title: "Workspaces",
      desc: "Organiza cada empresa o equipo en su propio workspace y cambia entre ellos cuando quieras.",
    },
    {
      title: "Vacantes",
      desc: "Publica con descripción completa y comparte el enlace público de cada vacante para recibir postulaciones.",
    },
    {
      title: "Candidatos",
      desc: "Base de talento con currículum adjunto y compatibilidad con la vacante calculada por IA, de 0 a 100.",
    },
    {
      title: "Procesos",
      desc: "Pipeline visual de arrastrar y soltar; las nuevas postulaciones entran solas a la preselección.",
    },
    {
      title: "Equipo",
      desc: "Invita por correo con aceptación, define permisos por página y alterna entre workspaces.",
    },
  ],
  features: [
    {
      title: "Compatibilidad por IA",
      desc: "Cada currículum recibido se analiza contra la vacante y recibe una nota de 0 a 100.",
    },
    {
      title: "Inicio de sesión seguro",
      desc: "Accede solo con Google o LinkedIn, sin contraseñas que gestionar.",
    },
    {
      title: "Vacantes públicas",
      desc: "Comparte el enlace del workspace o de una vacante específica y recibe postulaciones con currículum.",
    },
  ],
  cta: {
    title: "Empieza a reclutar de forma más inteligente",
    subtitle: "Inicia sesión con tu cuenta y obtén acceso instantáneo a toda la plataforma.",
  },
  footer: {
    description:
      "Lumni construye sistemas, automatiza procesos e integra ingenieros en tu equipo. Desde el primer diagnóstico hasta el código en producción.",
    servicesHeading: "Servicios",
    services: [
      "Desarrollo de sistemas y aplicaciones",
      "Automatización de procesos",
      "Consultoría tecnológica",
      "Ciberseguridad",
      "Soporte al desarrollo",
    ],
    contactHeading: "Contacto",
    privacy: "Privacidad",
    terms: "Términos",
    backToTop: "Volver arriba",
    rights: "Todos los derechos reservados.",
  },
};

export default es;

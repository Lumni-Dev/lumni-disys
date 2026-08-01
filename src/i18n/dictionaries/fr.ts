import type { Landing } from "@/i18n/types";

const fr: Landing = {
  languageLabel: "Langue",
  nav: {
    modules: "Modules",
    features: "Fonctionnalités",
    access: "Accès",
    signIn: "Se connecter",
  },
  hero: {
    titleLead: "L'ATS RH",
    titleAccent: "pratique et rapide",
    subtitle:
      "Entreprises, postes, candidats et processus sur une seule plateforme rapide, sécurisée et connectée. Recrutez mieux, du premier contact à l'embauche.",
    ctaGuest: "Accéder au système",
    ctaAuthed: "Aller au système",
    ctaSecondary: "Voir les modules",
  },
  kpis: {
    companies: "Entreprises",
    openJobs: "Postes ouverts",
    candidates: "Candidats",
    inProcess: "En cours",
  },
  stats: ["Modules intégrés", "Dans le cloud", "Mots de passe à retenir", "Disponible"],
  modulesSection: {
    title: "Tout ce dont vos RH ont besoin",
    subtitle:
      "Cinq modules intégrés qui communiquent entre eux et réunissent tout le recrutement dans un seul flux.",
  },
  modules: [
    {
      title: "Entreprises",
      desc: "Enregistrez clients et unités avec des données complètes et un statut en temps réel.",
    },
    {
      title: "Postes",
      desc: "Publiez des offres, définissez les niveaux et les fourchettes salariales, et suivez les ouvertures.",
    },
    {
      title: "Candidats",
      desc: "Centralisez les talents, les CV et les portfolios dans une base consultable.",
    },
    {
      title: "Processus",
      desc: "Pipeline visuel en glisser-déposer pour faire avancer les candidats entre les étapes.",
    },
    {
      title: "Équipe",
      desc: "Invitez votre équipe par e-mail et contrôlez les permissions page par page.",
    },
  ],
  features: [
    {
      title: "Vraiment rapide",
      desc: "Une interface épurée, des raccourcis et une recherche instantanée sur chaque page.",
    },
    {
      title: "Connexion sécurisée",
      desc: "Accès uniquement avec Google ou LinkedIn, sans mot de passe à gérer.",
    },
    {
      title: "Tout est organisé",
      desc: "Entreprises, postes, candidats et processus connectés au même endroit.",
    },
  ],
  cta: {
    title: "Commencez à recruter plus intelligemment",
    subtitle: "Connectez-vous avec votre compte et accédez instantanément à toute la plateforme.",
  },
  footer: {
    description:
      "Lumni conçoit des systèmes, automatise des processus et intègre des ingénieurs à votre équipe. Du premier diagnostic au code en production.",
    servicesHeading: "Services",
    services: [
      "Développement de systèmes et d'applications",
      "Automatisation des processus",
      "Conseil en technologie",
      "Cybersécurité",
      "Accompagnement au développement",
    ],
    contactHeading: "Contact",
    privacy: "Confidentialité",
    terms: "Conditions",
    backToTop: "Retour en haut",
    rights: "Tous droits réservés.",
  },
};

export default fr;

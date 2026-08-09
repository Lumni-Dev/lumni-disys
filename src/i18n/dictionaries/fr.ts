import type { Landing } from "@/i18n/types";

const fr: Landing = {
  languageLabel: "Langue",
  nav: {
    modules: "Modules",
    features: "Fonctionnalités",
    access: "Accès",
    pricing: "Tarifs",
    signIn: "Se connecter",
  },
  pricing: {
    title: "Offres et tarifs",
    subtitle: "Commencez gratuitement et évoluez au besoin.",
    cta: "Commencer",
  },
  hero: {
    titleLead: "L'ATS RH",
    titleAccent: "pratique et rapide",
    subtitle:
      "Entreprises, postes, candidats et processus sur une seule plateforme, avec analyse des CV par IA. Recrutez mieux, du premier contact à l'embauche.",
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
  stats: ["Modules intégrés", "Langues", "Mots de passe à retenir", "Disponible"],
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
      desc: "Publiez avec une description complète et partagez le lien public de chaque offre pour recevoir des candidatures.",
    },
    {
      title: "Candidats",
      desc: "Vivier de talents avec CV joint et compatibilité avec l'offre calculée par IA, de 0 à 100.",
    },
    {
      title: "Processus",
      desc: "Pipeline visuel en glisser-déposer ; les nouvelles candidatures arrivent seules en présélection.",
    },
    {
      title: "Équipe",
      desc: "Invitez par e-mail avec acceptation, définissez les permissions par page et passez d'un espace à l'autre.",
    },
  ],
  features: [
    {
      title: "Compatibilité par IA",
      desc: "Chaque CV reçu est analysé par rapport à l'offre et reçoit une note de 0 à 100.",
    },
    {
      title: "Connexion sécurisée",
      desc: "Accès uniquement avec Google ou LinkedIn, sans mot de passe à gérer.",
    },
    {
      title: "Offres publiques",
      desc: "Partagez le lien de votre espace ou d'une offre précise et recevez des candidatures avec CV.",
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

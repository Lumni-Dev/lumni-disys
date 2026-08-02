import type { Landing } from "@/i18n/types";

const de: Landing = {
  languageLabel: "Sprache",
  nav: {
    modules: "Module",
    features: "Funktionen",
    access: "Zugang",
    signIn: "Anmelden",
  },
  hero: {
    titleLead: "Das praktische, schnelle",
    titleAccent: "HR-ATS",
    subtitle:
      "Unternehmen, Stellen, Kandidaten und Prozesse auf einer Plattform, mit KI-Lebenslaufanalyse. Rekrutieren Sie besser, vom ersten Kontakt bis zur Einstellung.",
    ctaGuest: "Zum System",
    ctaAuthed: "Zum System wechseln",
    ctaSecondary: "Module ansehen",
  },
  kpis: {
    companies: "Unternehmen",
    openJobs: "Offene Stellen",
    candidates: "Kandidaten",
    inProcess: "Im Prozess",
  },
  stats: ["Integrierte Module", "Sprachen", "Zu merkende Passwörter", "Verfügbar"],
  modulesSection: {
    title: "Alles, was Ihr HR braucht",
    subtitle:
      "Fünf integrierte Module, die miteinander kommunizieren und das gesamte Recruiting in einem Ablauf bündeln.",
  },
  modules: [
    {
      title: "Unternehmen",
      desc: "Erfassen Sie Kunden und Standorte mit vollständigen Daten und Echtzeitstatus.",
    },
    {
      title: "Stellen",
      desc: "Veröffentlichen Sie Stellen mit vollständiger Beschreibung und teilen Sie den öffentlichen Link jeder Stelle.",
    },
    {
      title: "Kandidaten",
      desc: "Talentpool mit angehängtem Lebenslauf und KI-bewerteter Passung zur Stelle von 0 bis 100.",
    },
    {
      title: "Prozesse",
      desc: "Visuelle Drag-and-Drop-Pipeline; neue Bewerbungen landen automatisch in der Vorauswahl.",
    },
    {
      title: "Team",
      desc: "Per E-Mail mit Annahme einladen, Berechtigungen pro Seite festlegen und zwischen Workspaces wechseln.",
    },
  ],
  features: [
    {
      title: "KI-Passung",
      desc: "Jeder eingehende Lebenslauf wird gegen die Stelle bewertet, von 0 bis 100.",
    },
    {
      title: "Sicheres Login",
      desc: "Zugang nur mit Google oder LinkedIn, ohne Passwörter zu verwalten.",
    },
    {
      title: "Öffentliche Stellenseiten",
      desc: "Teilen Sie den Workspace-Link oder eine einzelne Stelle und erhalten Sie Bewerbungen mit Lebenslauf.",
    },
  ],
  cta: {
    title: "Rekrutieren Sie ab jetzt intelligenter",
    subtitle: "Melden Sie sich mit Ihrem Konto an und erhalten Sie sofortigen Zugriff auf die gesamte Plattform.",
  },
  footer: {
    description:
      "Lumni entwickelt Systeme, automatisiert Prozesse und integriert Ingenieure in Ihr Team. Von der ersten Analyse bis zum Code, der in Produktion läuft.",
    servicesHeading: "Leistungen",
    services: [
      "Entwicklung von Systemen und Anwendungen",
      "Prozessautomatisierung",
      "Technologieberatung",
      "Cybersicherheit",
      "Entwicklungsunterstützung",
    ],
    contactHeading: "Kontakt",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    backToTop: "Nach oben",
    rights: "Alle Rechte vorbehalten.",
  },
};

export default de;

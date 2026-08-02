import type { Landing } from "@/i18n/types";

const en: Landing = {
  languageLabel: "Language",
  nav: {
    modules: "Modules",
    features: "Features",
    access: "Access",
    signIn: "Sign in",
  },
  hero: {
    titleLead: "The practical, fast",
    titleAccent: "HR ATS",
    subtitle:
      "Companies, jobs, candidates and pipelines in one platform, with AI resume screening. Recruit better, from first contact to hire.",
    ctaGuest: "Enter the system",
    ctaAuthed: "Go to the system",
    ctaSecondary: "See modules",
  },
  kpis: {
    companies: "Companies",
    openJobs: "Open jobs",
    candidates: "Candidates",
    inProcess: "In process",
  },
  stats: ["Integrated modules", "Languages", "Passwords to remember", "Available"],
  modulesSection: {
    title: "Everything your HR needs",
    subtitle:
      "Five integrated modules that talk to each other and keep all of recruiting in one flow.",
  },
  modules: [
    {
      title: "Companies",
      desc: "Register clients and units with complete data and real-time status.",
    },
    {
      title: "Jobs",
      desc: "Post jobs with full descriptions and share each job's public link to collect applications.",
    },
    {
      title: "Candidates",
      desc: "Talent pool with attached resumes and AI-scored job fit from 0 to 100.",
    },
    {
      title: "Processes",
      desc: "Visual drag and drop pipeline; new applications land in screening automatically.",
    },
    {
      title: "Team",
      desc: "Invite by email with acceptance, set per-page permissions and switch between workspaces.",
    },
  ],
  features: [
    {
      title: "AI job fit",
      desc: "Every incoming resume is scored against the job, from 0 to 100.",
    },
    {
      title: "Secure login",
      desc: "Access with Google or LinkedIn only, no passwords to manage.",
    },
    {
      title: "Public job pages",
      desc: "Share your workspace link or a single job and receive applications with resumes.",
    },
  ],
  cta: {
    title: "Start recruiting smarter",
    subtitle: "Sign in with your account and get instant access to the whole platform.",
  },
  footer: {
    description:
      "Lumni builds systems, automates processes and embeds engineers into your team. From the first diagnosis to code running in production.",
    servicesHeading: "Services",
    services: [
      "Systems and application development",
      "Process automation",
      "Technology consulting",
      "Cybersecurity",
      "Development support",
    ],
    contactHeading: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    backToTop: "Back to top",
    rights: "All rights reserved.",
  },
};

export default en;

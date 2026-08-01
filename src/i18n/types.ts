export interface ModuleCopy {
  title: string;
  desc: string;
}

export interface FeatureCopy {
  title: string;
  desc: string;
}

/** Textos da landing page publica do disys. */
export interface Landing {
  languageLabel: string;
  nav: {
    modules: string;
    features: string;
    access: string;
    signIn: string;
  };
  hero: {
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    ctaGuest: string;
    ctaAuthed: string;
    ctaSecondary: string;
  };
  kpis: {
    companies: string;
    openJobs: string;
    candidates: string;
    inProcess: string;
  };
  stats: [string, string, string, string];
  modulesSection: {
    title: string;
    subtitle: string;
  };
  modules: [ModuleCopy, ModuleCopy, ModuleCopy, ModuleCopy, ModuleCopy];
  features: [FeatureCopy, FeatureCopy, FeatureCopy];
  cta: {
    title: string;
    subtitle: string;
  };
  footer: {
    description: string;
    servicesHeading: string;
    services: [string, string, string, string, string];
    contactHeading: string;
    privacy: string;
    terms: string;
    backToTop: string;
    rights: string;
  };
}

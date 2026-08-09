export interface ModuleCopy {
  title: string;
  desc: string;
}

export interface FeatureCopy {
  title: string;
  desc: string;
}


export interface Landing {
  languageLabel: string;
  nav: {
    modules: string;
    features: string;
    access: string;
    pricing: string;
    signIn: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    cta: string;
  };
  hero: {
    badge: string;
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


export interface Admin {
  nav: {
    dashboard: string;
    jobs: string;
    candidates: string;
    pipeline: string;
    team: string;
  };
  sidebar: {
    subtitle: string;
    collapse: string;
    account: string;
    openMenu: string;
    closeMenu: string;
    userFallback: string;

    myWorkspace: string;

    readonly: string;

    plan: string;

    lightMode: string;

    darkMode: string;
  };

  workspace: {
    createTitle: string;
    createSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;

    hint: string;
    create: string;

    editTitle: string;
    editSubtitle: string;

    title: string;
    subtitle: string;
    searchPlaceholder: string;

    active: string;
    activate: string;

    jobsCount: (n: number) => string;

    empty: string;

    deleteBlocked: (n: number) => string;

    deleteMessage: string;
  };

  plan: {
    title: string;
    subtitle: string;

    current: string;
    freeDesc: string;
    plusDesc: string;
    maxDesc: string;

    perCompanyShort: string;

    companies: string;
    perMonth: string;
    featuresFree: [string, string, string];
    featuresPlus: [string, string, string];
    usageTitle: string;
    usageSubtitle: string;
    unlimited: string;

    upgrade: string;

    switchPlan: string;
    redirecting: string;
    renewsAt(date: string): string;

    endsAt(date: string): string;
    cancel: string;
    cancelDesc: string;
    resume: string;
    checkoutSuccess: string;
    checkoutCanceled: string;

    ownerOnly: string;

    limitTitle: string;
    limitWorkspaces: string;
    limitProcesses: string;
    limitMembers: string;
    limitJobs: string;
    limitCandidates: string;
    limitCta: string;
  };

  deleteBlocked: {
    title: string;
    jobHasCandidates(n: number): string;
  };
  common: {
    search: string;
    edit: string;
    remove: string;
    save: string;
    cancel: string;
    saving: string;
    saved: string;

    saveError: string;
    confirm: string;
    loading: string;
    noResults: string;
    clearFilters: string;
    filters: string;
    export: string;
    exportExcel: string;
    close: string;
    selectAll: string;
    actions: string;
    previous: string;
    next: string;
    selectToExport: string;
    markToExport: string;
    range(from: number, to: number, total: number): string;
    totalCount(n: number): string;
    selectedCount(n: number): string;
  };

  stages: Record<string, string>;

  status: Record<string, string>;

  levels: Record<string, string>;

  jobTypes: Record<string, string>;

  permissionActions: Record<string, string>;
  dashboard: {
    cards: {
      openJobs: string;
      candidates: string;
      activePipeline: string;
      team: string;
    };
    deltaTalent: string;
    deltaInProgress: string;
    deltaTeam: string;
    funnelTitle: string;
    funnelSubtitle: string;
    totalInProcess: string;
    candidatesCount(n: number): string;
    activityTitle: string;
    activitySubtitle: string;
    movedTo(stage: string): string;
    noActivity: string;
    noMovements: string;
  };
  jobs: {
    searchPlaceholder: string;
    add: string;
    allLevels: string;
    allTypes: string;
    allStatuses: string;
    candidatesLabel: string;

    shareJob: string;

    openingsCount(n: number): string;
    empty: string;
    fileName: string;
    range(from: number, to: number, total: number): string;
    cols: {
      title: string;
      company: string;
      level: string;
      type: string;
      openings: string;
      applicants: string;
      status: string;
      description: string;
    };
  };
  candidates: {
    searchPlaceholder: string;
    add: string;

    downloadCv: string;
    allStages: string;
    allRoles: string;
    listTitle: string;
    count(n: number): string;
    empty: string;
    fileName: string;
    cols: {
      name: string;
      email: string;
      role: string;
      stage: string;

      match: string;
      modifiedAt: string;
    };
  };
  pipeline: {
    searchPlaceholder: string;
    add: string;
    dropHere: string;
    fileName: string;
    cols: {
      name: string;
      job: string;
      company: string;
      stage: string;
    };
  };
  team: {
    searchPlaceholder: string;
    add: string;
    allRoles: string;
    listTitle: string;
    withAccess(n: number): string;
    noAccess: string;

    pending: string;
    permissions(n: number): string;
    empty: string;
    fileName: string;
    footerRange(shown: number, total: number): string;
    cols: {
      member: string;
      role: string;
      pageAccess: string;
    };
    exportCols: {
      name: string;
      email: string;
      role: string;
      pages: string;
      permissionsTotal: string;
    };
  };
  account: {
    changePhoto: string;
    photoAlt: string;
    clickPhoto: string;
    fieldName: string;
    fieldPhone: string;
    fieldRole: string;
    keepUpdated: string;
    saveChanges: string;
    themeTitle: string;
    themeSubtitle: string;
    currentColor(label: string): string;
    saveTheme: string;
    languageTitle: string;
    languageSubtitle: string;
    languageLabel: string;
    connectedAccount: string;
    dangerTitle: string;
    dangerSubtitle: string;
    deleteAccount: string;
    deleteAccountDesc: string;
    confirmDelete: string;
    signOutTitle: string;
    signOutDesc: string;
    leaveTitle: string;
    leaveDesc: string;
    createWorkspace: string;
    noOwnWorkspace: string;
  };
  modals: {
    select: string;
    confirmMessage: string;
    permissionsByPage: string;
    page: string;
    selectOnePermission: string;
    job: {
      editTitle: string;
      newTitle: string;
      editSubtitle: string;
      newSubtitle: string;
      title: string;
      company: string;

      description: string;
      level: string;
      type: string;
      openings: string;
      status: string;
      salaryRange: string;
      salaryFrom: string;
      salaryTo: string;
      salaryOrderError: string;

      companyHint: string;
      companyHintLink: string;
    };
    candidate: {
      editTitle: string;
      newTitle: string;
      editSubtitle: string;
      newSubtitle: string;
      fullName: string;
      email: string;
      desiredRole: string;

      jobHint: string;
      jobHintLink: string;
      linkedin: string;
      linkedinPlaceholder: string;
    };
    process: {
      editTitle: string;
      newTitle: string;
      editSubtitle: string;
      newSubtitle: string;
      candidate: string;
      job: string;
      company: string;
      stage: string;

      remove: string;
    };
    member: {
      editTitle: string;
      inviteTitle: string;
      editSubtitle: string;
      inviteSubtitle: string;
      email: string;
      name: string;
      role: string;
      emailPlaceholder: string;
      namePlaceholder: string;
      rolePlaceholder: string;
    };
  };
  shareJobs: {
    button: string;
    title: string;
    subtitle: string;
    generating: string;
    copy: string;
    copied: string;
    openPublic: string;
  };

  careers: {
    tagline: string;
    title: string;
    available(n: number): string;
    searchPlaceholder: string;
    postedAt(date: string): string;
    apply: string;
    sentTitle: string;
    received: string;
    goodLuck: string;
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    message: string;
    messagePlaceholder: string;
    cv: string;
    cvAttach: string;
    cvSelect: string;
    cvTooBig: string;
    send: string;
    sending: string;
    sendFailed: string;
    /** LGPD: consentimento do candidato no formulario publico. */
    consent: string;
    consentPolicy: string;
    consentRequired: string;
    empty: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    invalidLink: string;

    jobNotFound: string;
    goHome: string;
  };

  login: {
    subtitle: string;
    google: string;
    linkedin: string;
    backHome: string;
    terms: string;
    error: string;
  };

  invite: {
    title: string;
    signInToView: string;
    invitedBy(owner: string): string;
    accept: string;
    decline: string;
    invalid: string;
    wrongEmail: string;
  };
}

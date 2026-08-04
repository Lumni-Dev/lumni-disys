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

/** Textos do painel administrativo (area logada) do disys. */
export interface Admin {
  nav: {
    dashboard: string;
    companies: string;
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
    /** Rotulo do proprio workspace no seletor de workspaces. */
    myWorkspace: string;
    /** Selinho de acesso somente leitura (visao de super-admin). */
    readonly: string;
  };
  /** Aviso de exclusao bloqueada por dependencias (empresa com vagas, etc.). */
  deleteBlocked: {
    title: string;
    companyHasJobs(n: number): string;
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
    /** Aviso generico quando um save falha (rede/validacao/servidor). */
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
  /** Rotulos de exibicao das etapas do pipeline, indexados pelo valor canonico PT. */
  stages: Record<string, string>;
  /** Rotulos de exibicao dos status, indexados pelo valor canonico PT. */
  status: Record<string, string>;
  /** Rotulos de exibicao dos niveis de vaga, indexados pelo valor canonico PT. */
  levels: Record<string, string>;
  /** Rotulos de exibicao das modalidades de vaga, indexados pelo valor canonico PT. */
  jobTypes: Record<string, string>;
  /** Rotulos das acoes de permissao (view/create/edit/delete). */
  permissionActions: Record<string, string>;
  dashboard: {
    cards: {
      activeCompanies: string;
      openJobs: string;
      candidates: string;
      activePipeline: string;
    };
    deltaTalent: string;
    deltaInProgress: string;
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
  companies: {
    searchPlaceholder: string;
    add: string;
    allSectors: string;
    allStatuses: string;
    listTitle: string;
    empty: string;
    fileName: string;
    cols: {
      name: string;
      sector: string;
      location: string;
      openings: string;
      status: string;
    };
  };
  jobs: {
    searchPlaceholder: string;
    add: string;
    allLevels: string;
    allTypes: string;
    allStatuses: string;
    candidatesLabel: string;
    /** Tooltip do botao de copiar o link publico de uma vaga. */
    shareJob: string;
    /** Ex.: "2 vagas" (badge no cartao da vaga e na pagina publica). */
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
    /** Tooltip do botao de baixar o curriculo anexado. */
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
      /** Compatibilidade curriculo x vaga calculada por IA (0 a 100). */
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
    /** Badge de convite ainda nao aceito. */
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
    company: {
      editTitle: string;
      newTitle: string;
      editSubtitle: string;
      newSubtitle: string;
      name: string;
      sector: string;
      country: string;
      cnpj: string;
      /** Texto exibido enquanto os dados do CNPJ sao consultados. */
      cnpjLookup: string;
      state: string;
      city: string;
      taxId: string;
      stateProvince: string;
      status: string;
      selectCity: string;
      selectStateFirst: string;
      taxIdPlaceholder: string;
    };
    job: {
      editTitle: string;
      newTitle: string;
      editSubtitle: string;
      newSubtitle: string;
      title: string;
      company: string;
      /** Descricao da vaga (opcional, ate 5000 caracteres). */
      description: string;
      level: string;
      type: string;
      openings: string;
      status: string;
      salaryRange: string;
      salaryFrom: string;
      salaryTo: string;
      salaryOrderError: string;
      /** Aviso abaixo da busca de empresa: nao achou? cadastre-a. */
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
      /** Aviso abaixo da busca de vaga: nao achou? cadastre-a. */
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
      /** Botao de remover o candidato do processo (exclui o card). */
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
  /** Pagina publica de vagas (careers) e o modal de candidatura. */
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
    empty: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    invalidLink: string;
    /** Pagina publica de uma vaga especifica. */
    jobNotFound: string;
    viewAll: string;
    goHome: string;
  };
  /** Pagina de login. */
  login: {
    subtitle: string;
    google: string;
    linkedin: string;
    backHome: string;
    terms: string;
    error: string;
  };
  /** Pagina de aceite do convite de workspace. */
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

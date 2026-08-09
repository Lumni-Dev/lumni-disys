import type { Landing } from "@/i18n/types";

const ko: Landing = {
  languageLabel: "언어",
  nav: {
    modules: "모듈",
    features: "기능",
    access: "접속",
    pricing: "요금제",
    signIn: "로그인",
  },
  pricing: {
    title: "요금제",
    subtitle: "무료로 시작하고 필요할 때 업그레이드하세요.",
    cta: "시작하기",
  },
  hero: {
    badge: "AI 이력서 분석",
    titleLead: "실용적이고 빠른",
    titleAccent: "인사 ATS",
    subtitle:
      "기업, 채용 공고, 지원자, 채용 절차를 하나의 플랫폼에서. AI 이력서 분석 포함. 첫 접촉부터 채용까지 더 나은 채용을 실현합니다.",
    ctaGuest: "시스템 들어가기",
    ctaAuthed: "시스템으로 이동",
    ctaSecondary: "모듈 보기",
  },
  kpis: {
    companies: "Workspaces",
    openJobs: "채용 중인 공고",
    candidates: "지원자",
    inProcess: "진행 중",
  },
  stats: ["통합 모듈", "지원 언어", "기억할 비밀번호", "이용 가능"],
  modulesSection: {
    title: "인사팀에 필요한 모든 것",
    subtitle:
      "서로 연동되어 채용 업무 전체를 하나의 흐름으로 유지하는 다섯 가지 통합 모듈.",
  },
  modules: [
    {
      title: "Workspaces",
      desc: "회사나 팀별로 전용 워크스페이스를 만들고 언제든지 전환하세요.",
    },
    {
      title: "채용 공고",
      desc: "상세 설명과 함께 공고를 게시하고 공고별 공개 링크를 공유해 지원을 받으세요.",
    },
    {
      title: "지원자",
      desc: "이력서가 첨부된 인재 풀. 공고와의 적합도를 AI가 0에서 100으로 계산합니다.",
    },
    {
      title: "채용 절차",
      desc: "드래그 앤 드롭 칸반. 새 지원은 자동으로 스크리닝에 들어갑니다.",
    },
    {
      title: "팀",
      desc: "수락 기반 이메일 초대, 페이지별 권한, 워크스페이스 전환을 지원합니다.",
    },
  ],
  features: [
    {
      title: "AI 적합도",
      desc: "접수된 모든 이력서를 공고와 비교해 0에서 100까지 점수를 매깁니다.",
    },
    {
      title: "안전한 로그인",
      desc: "Google 또는 LinkedIn으로만 접속하며 관리할 비밀번호가 없습니다.",
    },
    {
      title: "공개 채용 페이지",
      desc: "워크스페이스 또는 개별 공고 링크를 공유하고 이력서와 함께 지원을 받으세요.",
    },
  ],
  cta: {
    title: "더 똑똑하게 채용을 시작하세요",
    subtitle: "계정으로 로그인하면 전체 플랫폼에 즉시 접속할 수 있습니다.",
  },
  footer: {
    description:
      "Lumni는 시스템을 구축하고 프로세스를 자동화하며 귀사의 팀에 엔지니어를 합류시킵니다. 최초 진단부터 프로덕션에서 실행되는 코드까지 함께합니다.",
    servicesHeading: "서비스",
    services: [
      "시스템 및 애플리케이션 개발",
      "프로세스 자동화",
      "기술 컨설팅",
      "사이버 보안",
      "개발 지원",
    ],
    contactHeading: "연락처",
    privacy: "개인정보 처리방침",
    terms: "이용약관",
    backToTop: "맨 위로",
    rights: "모든 권리 보유.",
  },
};

export default ko;

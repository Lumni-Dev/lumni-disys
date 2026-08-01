import type { Landing } from "@/i18n/types";

const ko: Landing = {
  languageLabel: "언어",
  nav: {
    modules: "모듈",
    features: "기능",
    access: "접속",
    signIn: "로그인",
  },
  hero: {
    titleLead: "실용적이고 빠른",
    titleAccent: "인사 ATS",
    subtitle:
      "기업, 채용 공고, 지원자, 채용 절차를 빠르고 안전하며 연결된 하나의 플랫폼에서 관리하세요. 첫 접촉부터 채용까지 더 나은 채용을 실현합니다.",
    ctaGuest: "시스템 들어가기",
    ctaAuthed: "시스템으로 이동",
    ctaSecondary: "모듈 보기",
  },
  kpis: {
    companies: "기업",
    openJobs: "채용 중인 공고",
    candidates: "지원자",
    inProcess: "진행 중",
  },
  stats: ["통합 모듈", "클라우드 기반", "기억할 비밀번호", "이용 가능"],
  modulesSection: {
    title: "인사팀에 필요한 모든 것",
    subtitle:
      "서로 연동되어 채용 업무 전체를 하나의 흐름으로 유지하는 다섯 가지 통합 모듈.",
  },
  modules: [
    {
      title: "기업",
      desc: "완전한 데이터와 실시간 상태로 고객사와 사업장을 등록하세요.",
    },
    {
      title: "채용 공고",
      desc: "공고를 게시하고 직급과 연봉 범위를 설정하며 채용 현황을 추적하세요.",
    },
    {
      title: "지원자",
      desc: "인재, 이력서, 포트폴리오를 검색 가능한 데이터베이스에 통합하세요.",
    },
    {
      title: "채용 절차",
      desc: "드래그 앤 드롭 방식의 시각적 파이프라인으로 지원자를 단계별로 이동시키세요.",
    },
    {
      title: "팀",
      desc: "이메일로 팀원을 초대하고 페이지별 권한을 관리하세요.",
    },
  ],
  features: [
    {
      title: "진정으로 빠른 속도",
      desc: "간결한 인터페이스, 단축키, 모든 페이지의 즉각적인 검색 기능.",
    },
    {
      title: "안전한 로그인",
      desc: "Google 또는 LinkedIn으로만 접속하며 관리할 비밀번호가 없습니다.",
    },
    {
      title: "모든 것이 정리된 상태",
      desc: "기업, 채용 공고, 지원자, 채용 절차가 한곳에서 연결됩니다.",
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

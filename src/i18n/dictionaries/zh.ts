import type { Landing } from "@/i18n/types";

const zh: Landing = {
  languageLabel: "语言",
  nav: {
    modules: "模块",
    features: "功能",
    access: "访问",
    pricing: "价格",
    signIn: "登录",
  },
  pricing: {
    title: "方案与价格",
    subtitle: "免费开始，需要时再升级。",
    cta: "开始",
  },
  hero: {
    titleLead: "实用又快速的",
    titleAccent: "人力资源 ATS",
    subtitle:
      "公司、职位、候选人和流程集中在一个平台，配备 AI 简历分析。从首次接触到成功录用，招得更好。",
    ctaGuest: "进入系统",
    ctaAuthed: "前往系统",
    ctaSecondary: "查看模块",
  },
  kpis: {
    companies: "公司",
    openJobs: "开放职位",
    candidates: "候选人",
    inProcess: "进行中",
  },
  stats: ["集成模块", "种语言", "需记住的密码", "可用性"],
  modulesSection: {
    title: "您的人力资源所需的一切",
    subtitle:
      "五个相互协作的集成模块，将全部招聘工作汇聚于同一个流程之中。",
  },
  modules: [
    {
      title: "公司",
      desc: "登记客户和单位，包含完整数据和实时状态。",
    },
    {
      title: "职位",
      desc: "发布带完整描述的职位，分享每个职位的公开链接以接收申请。",
    },
    {
      title: "候选人",
      desc: "附带简历的人才库，AI 计算与职位的匹配度（0 到 100）。",
    },
    {
      title: "流程",
      desc: "拖放式可视化看板，新申请自动进入筛选阶段。",
    },
    {
      title: "团队",
      desc: "通过邮件邀请（需接受），按页面设置权限，并可切换工作区。",
    },
  ],
  features: [
    {
      title: "AI 匹配度",
      desc: "每份收到的简历都会与职位对比，获得 0 到 100 的评分。",
    },
    {
      title: "安全登录",
      desc: "仅通过 Google 或 LinkedIn 访问，无需管理密码。",
    },
    {
      title: "公开职位页面",
      desc: "分享工作区或单个职位的链接，接收附带简历的申请。",
    },
  ],
  cta: {
    title: "开始更聪明地招聘",
    subtitle: "使用您的账户登录，立即畅享整个平台。",
  },
  footer: {
    description:
      "Lumni 构建系统、自动化流程，并将工程师融入您的团队。从最初的诊断到在生产环境中运行的代码。",
    servicesHeading: "服务",
    services: [
      "系统与应用开发",
      "流程自动化",
      "技术咨询",
      "网络安全",
      "开发支持",
    ],
    contactHeading: "联系我们",
    privacy: "隐私",
    terms: "条款",
    backToTop: "返回顶部",
    rights: "版权所有。",
  },
};

export default zh;

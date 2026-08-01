import type { Landing } from "@/i18n/types";

const ja: Landing = {
  languageLabel: "言語",
  nav: {
    modules: "モジュール",
    features: "特長",
    access: "アクセス",
    signIn: "ログイン",
  },
  hero: {
    titleLead: "実用的で速い",
    titleAccent: "人事ATS",
    subtitle:
      "企業、求人、候補者、選考プロセスを、高速で安全、そしてつながったひとつのプラットフォームに。最初の接点から採用まで、より良い採用活動を実現します。",
    ctaGuest: "システムに入る",
    ctaAuthed: "システムへ移動",
    ctaSecondary: "モジュールを見る",
  },
  kpis: {
    companies: "企業",
    openJobs: "募集中の求人",
    candidates: "候補者",
    inProcess: "選考中",
  },
  stats: ["統合されたモジュール", "クラウド上で稼働", "覚えるパスワード", "利用可能"],
  modulesSection: {
    title: "人事に必要なすべてを",
    subtitle:
      "互いに連携する5つの統合モジュールが、採用のすべてをひとつの流れにまとめます。",
  },
  modules: [
    {
      title: "企業",
      desc: "クライアントや拠点を、完全なデータとリアルタイムのステータスで登録します。",
    },
    {
      title: "求人",
      desc: "求人を掲載し、レベルや給与レンジを設定して、募集状況を追跡します。",
    },
    {
      title: "候補者",
      desc: "人材、履歴書、ポートフォリオを検索可能なデータベースに集約します。",
    },
    {
      title: "選考プロセス",
      desc: "ドラッグ＆ドロップの視覚的なパイプラインで、候補者を各ステージ間で移動できます。",
    },
    {
      title: "チーム",
      desc: "メールでチームを招待し、ページごとに権限を管理します。",
    },
  ],
  features: [
    {
      title: "本当に速い",
      desc: "無駄のないインターフェース、ショートカット、すべてのページでの即時検索。",
    },
    {
      title: "安全なログイン",
      desc: "GoogleまたはLinkedInのみでアクセスでき、パスワードの管理は不要です。",
    },
    {
      title: "すべてが整理された状態",
      desc: "企業、求人、候補者、選考プロセスをひとつの場所でつなげます。",
    },
  ],
  cta: {
    title: "よりスマートな採用を始めましょう",
    subtitle: "お使いのアカウントでログインすれば、プラットフォーム全体にすぐアクセスできます。",
  },
  footer: {
    description:
      "Lumniはシステムを構築し、プロセスを自動化し、エンジニアをお客様のチームに組み込みます。最初の診断から、本番環境で動くコードまで。",
    servicesHeading: "サービス",
    services: [
      "システムおよびアプリケーション開発",
      "プロセスの自動化",
      "技術コンサルティング",
      "サイバーセキュリティ",
      "開発サポート",
    ],
    contactHeading: "お問い合わせ",
    privacy: "プライバシー",
    terms: "利用規約",
    backToTop: "トップへ戻る",
    rights: "無断複製・転載を禁じます。",
  },
};

export default ja;

import type { Landing } from "@/i18n/types";

const ja: Landing = {
  languageLabel: "言語",
  nav: {
    modules: "モジュール",
    features: "特長",
    access: "アクセス",
    pricing: "料金",
    signIn: "ログイン",
  },
  pricing: {
    title: "料金プラン",
    subtitle: "無料で始めて、必要になったらアップグレード。",
    cta: "始める",
  },
  hero: {
    titleLead: "実用的で速い",
    titleAccent: "人事ATS",
    subtitle:
      "企業、求人、候補者、選考プロセスをひとつのプラットフォームに。AIによる履歴書分析つき。最初の接点から採用まで、より良い採用活動を実現します。",
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
  stats: ["統合されたモジュール", "言語", "覚えるパスワード", "利用可能"],
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
      desc: "詳しい説明つきで求人を公開し、求人ごとの公開リンクを共有して応募を受け付けます。",
    },
    {
      title: "候補者",
      desc: "履歴書つきの人材プール。求人との適合度をAIが0から100で算出します。",
    },
    {
      title: "選考プロセス",
      desc: "ドラッグ＆ドロップのカンバン。新しい応募は自動でスクリーニングに入ります。",
    },
    {
      title: "チーム",
      desc: "承認つきのメール招待、ページごとの権限設定、ワークスペースの切り替えに対応。",
    },
  ],
  features: [
    {
      title: "AI適合度",
      desc: "受け取った履歴書はすべて求人と照合され、0から100のスコアがつきます。",
    },
    {
      title: "安全なログイン",
      desc: "GoogleまたはLinkedInのみでアクセスでき、パスワードの管理は不要です。",
    },
    {
      title: "公開求人ページ",
      desc: "ワークスペースまたは個別求人のリンクを共有し、履歴書つきの応募を受け取れます。",
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

import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import {
  IconBuilding,
  IconBriefcase,
  IconUsers,
  IconFile,
  IconShield,
  IconBell,
  IconCheck,
  IconGoogle,
  IconLinkedin,
} from "@/components/ui/icons";

const modules = [
  {
    Icon: IconBuilding,
    title: "Empresas",
    desc: "Cadastre clientes e unidades com dados completos e status em tempo real.",
  },
  {
    Icon: IconBriefcase,
    title: "Vagas",
    desc: "Publique oportunidades, defina níveis, faixas salariais e acompanhe aberturas.",
  },
  {
    Icon: IconUsers,
    title: "Candidatos",
    desc: "Centralize talentos, currículos e portfólios em uma base pesquisável.",
  },
  {
    Icon: IconFile,
    title: "Processos",
    desc: "Pipeline visual com arrastar e soltar para mover candidatos entre etapas.",
  },
  {
    Icon: IconShield,
    title: "Colaboradores",
    desc: "Convide sua equipe por e-mail e controle permissões por página.",
  },
  {
    Icon: IconBell,
    title: "Notificações",
    desc: "Fique por dentro de cada movimentação do seu processo de recrutamento.",
  },
];

const features = [
  {
    title: "Rápido de verdade",
    desc: "Interface enxuta, atalhos e busca instantânea em todas as páginas.",
  },
  {
    title: "Login seguro",
    desc: "Acesso apenas com Google ou LinkedIn — sem senhas para gerenciar.",
  },
  {
    title: "Tudo organizado",
    desc: "Empresas, vagas, candidatos e processos conectados em um só lugar.",
  },
];

const stats = [
  { value: "6", label: "Módulos integrados" },
  { value: "100%", label: "Na nuvem" },
  { value: "0", label: "Senhas para lembrar" },
  { value: "24/7", label: "Disponível" },
];

export default async function LandingPage() {
  const session = await auth();
  const ctaHref = session ? "/dashboard" : "/login";
  const ctaLabel = session ? "Ir para o sistema" : "Acessar sistema";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-red opacity-25 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-20 h-80 w-80 rounded-full bg-red opacity-10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-64 -right-20 h-80 w-80 rounded-full bg-red opacity-10 blur-[120px]"
      />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red shadow-lg shadow-red/30">
              <Image
                src="/logo-disys-white.png"
                alt="DISYS"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
                priority
              />
            </div>
            <span className="text-base font-semibold tracking-tight">DISYS</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
            <a href="#modulos" className="transition-colors hover:text-foreground">
              Módulos
            </a>
            <a href="#recursos" className="transition-colors hover:text-foreground">
              Recursos
            </a>
            <a href="#acesso" className="transition-colors hover:text-foreground">
              Acesso
            </a>
          </nav>
          <Link
            href={ctaHref}
            className="rounded-lg bg-red px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-soft"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5">
        <section className="flex flex-col items-center pt-20 pb-16 text-center md:pt-28">
          <span className="mb-5 inline-flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-1 text-xs text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-red-soft" />
            Plataforma de RH · Nova geração
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            O ERP de Recursos Humanos{" "}
            <span className="bg-gradient-to-r from-red-soft to-red bg-clip-text text-transparent">
              feito para escalar
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            Empresas, vagas, candidatos e processos em uma única plataforma
            rápida, segura e conectada. Recrute melhor, do primeiro contato à
            contratação.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2.5 sm:flex-row">
            <Link
              href={ctaHref}
              className="rounded-lg bg-red px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red/30 transition-colors hover:bg-red-soft"
            >
              {ctaLabel}
            </Link>
            <a
              href="#modulos"
              className="rounded-lg border border-border bg-surface/60 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur transition-colors hover:border-red hover:bg-red/10"
            >
              Ver módulos
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <IconCheck className="h-3.5 w-3.5 text-red-soft" />
              Sem cartão de crédito
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconCheck className="h-3.5 w-3.5 text-red-soft" />
              Login com Google e LinkedIn
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconCheck className="h-3.5 w-3.5 text-red-soft" />
              100% na nuvem
            </span>
          </div>

          <div className="relative mt-16 w-full max-w-4xl">
            <div className="absolute -inset-x-10 -top-6 bottom-0 rounded-lg bg-red/20 blur-[80px]" />
            <div className="relative overflow-hidden rounded-lg border border-border bg-surface/80 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted/30" />
                <span className="ml-3 text-xs text-muted">disys.lumni.dev.br</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4">
                {[
                  { k: "Empresas", v: "128" },
                  { k: "Vagas abertas", v: "42" },
                  { k: "Candidatos", v: "1.204" },
                  { k: "Em processo", v: "76" },
                ].map((c) => (
                  <div
                    key={c.k}
                    className="rounded-lg border border-border bg-surface-2 p-3 text-left"
                  >
                    <p className="text-xs text-muted">{c.k}</p>
                    <p className="mt-1 text-xl font-semibold tracking-tight">
                      {c.v}
                    </p>
                    <div className="mt-2 flex h-8 items-end gap-1">
                      {[40, 65, 50, 80, 60, 95, 72].map((h, i) => (
                        <span
                          key={i}
                          className="flex-1 rounded-sm bg-red/70"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2.5 border-y border-border py-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </section>

        <section id="modulos" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Tudo que o seu RH precisa
            </h2>
            <p className="mt-3 text-muted">
              Seis módulos integrados que conversam entre si e mantêm todo o
              recrutamento em um só fluxo.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-lg border border-border bg-surface/60 p-5 backdrop-blur transition-colors hover:border-red/50"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-red opacity-0 blur-2xl transition-opacity group-hover:opacity-20" />
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-red/10 text-red-soft transition-colors group-hover:bg-red group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="recursos" className="scroll-mt-20 py-8">
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-border bg-surface/60 p-6 backdrop-blur"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-red/10 text-red-soft">
                  <IconCheck className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="acesso" className="scroll-mt-20 py-20">
          <div className="relative overflow-hidden rounded-lg border border-red/30 bg-surface/60 px-6 py-14 text-center backdrop-blur">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse 60% 100% at 50% 0%, #e11d2f55, transparent 70%)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Comece a recrutar de forma inteligente
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted">
                Entre com sua conta e tenha acesso imediato a toda a plataforma.
              </p>
              <div className="mt-8 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2.5 rounded-lg bg-red px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red/30 transition-colors hover:bg-red-soft"
                >
                  <IconGoogle className="h-4 w-4" />
                  {ctaLabel}
                </Link>
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-red hover:bg-red/10"
                >
                  <IconLinkedin className="h-4 w-4" />
                  Entrar com LinkedIn
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red">
              <Image
                src="/logo-disys-white.png"
                alt="DISYS"
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
              />
            </div>
            <span className="text-sm font-semibold tracking-tight">DISYS</span>
          </div>
          <p className="text-xs text-muted">
            © 2026 DISYS · ERP de Recursos Humanos
          </p>
        </div>
      </footer>
    </div>
  );
}

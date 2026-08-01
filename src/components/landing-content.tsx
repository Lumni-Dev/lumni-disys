"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
import { Sparkline } from "@/components/ui/sparkline";
import {
  IconBuilding,
  IconBriefcase,
  IconUsers,
  IconFile,
  IconShield,
  IconSearch,
  IconDashboard,
} from "@/components/ui/icons";

const MODULE_ICONS = [
  IconBuilding,
  IconBriefcase,
  IconUsers,
  IconFile,
  IconShield,
] as const;

const FEATURE_ICONS = [IconSearch, IconShield, IconDashboard] as const;

const STAT_VALUES = ["5", "100%", "0", "24/7"] as const;

const KPI_META = [
  { key: "companies", v: "128", delta: "+12%", up: true, data: [20, 24, 23, 30, 33, 39, 45, 52] },
  { key: "openJobs", v: "42", delta: "+8%", up: true, data: [16, 19, 18, 21, 26, 24, 30, 34] },
  { key: "candidates", v: "1.204", delta: "+23%", up: true, data: [38, 47, 55, 53, 68, 82, 95, 118] },
  { key: "inProcess", v: "76", delta: "-4%", up: false, data: [64, 66, 60, 63, 55, 54, 50, 47] },
] as const;

function TrendArrow({ up }: { up: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-2.5 w-2.5 ${up ? "" : "rotate-180"}`}
    >
      <path d="M6 9.5V2.5M3 5.5 6 2.5l3 3" />
    </svg>
  );
}

function Eyebrow({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
      {label}
    </span>
  );
}

export function LandingContent({ authed }: { authed: boolean }) {
  const { dict } = useI18n();
  const ctaHref = authed ? "/dashboard" : "/login";
  const ctaLabel = authed ? dict.hero.ctaAuthed : dict.hero.ctaGuest;

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
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-foreground opacity-[0.07] blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-20 h-80 w-80 rounded-full bg-foreground opacity-[0.04] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-64 -right-20 h-80 w-80 rounded-full bg-foreground opacity-[0.04] blur-[120px]"
      />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <span className="text-lg font-normal tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
            DISYS
          </span>
          <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
            <a href="#modulos" className="transition-colors hover:text-foreground">
              {dict.nav.modules}
            </a>
            <a href="#recursos" className="transition-colors hover:text-foreground">
              {dict.nav.features}
            </a>
            <a href="#acesso" className="transition-colors hover:text-foreground">
              {dict.nav.access}
            </a>
          </nav>
          <div className="flex items-center gap-2.5">
            <LanguageSwitcher variant="header" />
            <Link
              href={ctaHref}
              className="rounded-lg bg-foreground px-3.5 py-1.5 text-sm font-medium text-background transition-colors hover:bg-white"
            >
              {dict.nav.signIn}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5">
        <section className="flex flex-col items-center pt-20 pb-16 text-center md:pt-28">
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            {dict.hero.titleLead}{" "}
            <span className="bg-gradient-to-r from-foreground to-muted bg-clip-text text-transparent">
              {dict.hero.titleAccent}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            {dict.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center gap-2.5 sm:flex-row">
            <Link
              href={ctaHref}
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-lg shadow-black/40 transition-colors hover:bg-white"
            >
              {ctaLabel}
            </Link>
            <a
              href="#modulos"
              className="rounded-lg border border-border bg-surface/60 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur transition-colors hover:border-white hover:bg-white/10"
            >
              {dict.hero.ctaSecondary}
            </a>
          </div>
          <div className="relative mt-16 w-full max-w-4xl">
            <div className="absolute -inset-x-10 -top-6 bottom-0 rounded-lg bg-white/20 blur-[80px]" />
            <div className="relative overflow-hidden rounded-lg border border-border bg-surface/80 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted/30" />
                <span className="ml-3 text-xs text-muted" dir="ltr">
                  disys.lumni.dev.br
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4">
                {KPI_META.map((c) => (
                  <div
                    key={c.key}
                    className="group/kpi rounded-lg border border-border bg-surface-2 p-3 text-left transition-colors hover:border-white/25"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted">
                        {dict.kpis[c.key]}
                      </p>
                      <span
                        className={`inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          c.up
                            ? "bg-white/10 text-foreground"
                            : "bg-white/[0.05] text-muted"
                        }`}
                      >
                        <TrendArrow up={c.up} />
                        {c.delta}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xl font-semibold tracking-tight">
                      {c.v}
                    </p>
                    <Sparkline
                      data={[...c.data]}
                      height={30}
                      className="mt-2 opacity-70 transition-opacity group-hover/kpi:opacity-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2.5 border-y border-border py-8 md:grid-cols-4">
          {STAT_VALUES.map((value, i) => (
            <div key={dict.stats[i]} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {value}
              </p>
              <p className="mt-1 text-xs text-muted">{dict.stats[i]}</p>
            </div>
          ))}
        </section>

        <section id="modulos" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow label={dict.nav.modules} />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {dict.modulesSection.title}
            </h2>
            <p className="mt-3 text-muted">{dict.modulesSection.subtitle}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {dict.modules.map((mod, i) => {
              const Icon = MODULE_ICONS[i];
              return (
                <div
                  key={mod.title}
                  className="group relative overflow-hidden rounded-lg border border-border bg-surface/60 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-surface/80"
                >
                  <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-foreground opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10" />
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-foreground transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs tabular-nums text-muted/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {mod.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">{mod.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="recursos" className="scroll-mt-20 py-8">
          <div className="mb-10 flex justify-center">
            <Eyebrow label={dict.nav.features} />
          </div>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {dict.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-lg border border-border bg-surface/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/40"
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-foreground opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10" />
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white/[0.04] text-foreground transition-colors duration-300 group-hover:border-white/30 group-hover:bg-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="acesso" className="scroll-mt-20 py-20">
          <div className="relative overflow-hidden rounded-lg border border-white/20 bg-surface/60 px-6 py-16 text-center backdrop-blur">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.25]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                maskImage:
                  "radial-gradient(ellipse 70% 80% at 50% 0%, black 20%, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 80% at 50% 0%, black 20%, transparent 80%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse 60% 100% at 50% 0%, #ffffff22, transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="flex justify-center">
                <Eyebrow label={dict.nav.access} />
              </div>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                {dict.cta.title}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted">
                {dict.cta.subtitle}
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2.5 rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background shadow-lg shadow-black/40 transition-transform duration-300 hover:scale-[1.03] hover:bg-white"
                >
                  {ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

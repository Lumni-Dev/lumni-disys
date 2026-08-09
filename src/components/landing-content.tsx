"use client";

import Link from "next/link";
import { cx } from "@/lib/utils";
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
  IconCheck,
} from "@/components/ui/icons";

const MODULE_ICONS = [
  IconBuilding,
  IconBriefcase,
  IconUsers,
  IconFile,
  IconShield,
] as const;

const FEATURE_ICONS = [IconSearch, IconShield, IconDashboard] as const;

const STAT_VALUES = ["5", "12", "0", "24/7"] as const;

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
    <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-lg bg-white/70" />
      {label}
    </span>
  );
}

const PRICING_TIERS = [
  { key: "free", name: "Free", price: 0 },
  { key: "plus", name: "Plus", price: null },
  { key: "max", name: "Max", price: null },
] as const;

const TIER_LIMITS: Record<
  "free" | "plus" | "max",
  { workspaces: number | null; jobs: number | null; candidates: number | null; processes: number | null; members: number | null }
> = {
  free: { workspaces: 1, jobs: 5, candidates: 5, processes: 5, members: 1 },
  plus: { workspaces: 5, jobs: 25, candidates: 25, processes: 25, members: 5 },
  max: { workspaces: null, jobs: null, candidates: null, processes: null, members: null },
};

export function LandingContent({
  authed,
  prices,
}: {
  authed: boolean;
  prices: { plus: number; max: number };
}) {
  const { dict, admin } = useI18n();
  const ctaHref = authed ? "/dashboard" : "/login";
  const ctaLabel = authed ? dict.hero.ctaAuthed : dict.hero.ctaGuest;

  const brl = (cents: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

  const priceOf = (key: "free" | "plus" | "max") =>
    key === "free" ? "R$ 0" : brl(key === "max" ? prices.max : prices.plus);

  const tierDesc = (key: "free" | "plus" | "max") =>
    key === "free"
      ? admin.plan.freeDesc
      : key === "max"
        ? admin.plan.maxDesc
        : admin.plan.plusDesc;

  const featureRows = (key: "free" | "plus" | "max") => {
    const l = TIER_LIMITS[key];
    const val = (n: number | null) => (n == null ? admin.plan.unlimited : n);
    return [
      { label: admin.plan.companies, value: `${val(l.workspaces)}`, per: false },
      { label: admin.nav.jobs, value: `${val(l.jobs)}`, per: l.jobs != null },
      { label: admin.nav.candidates, value: `${val(l.candidates)}`, per: l.candidates != null },
      { label: admin.nav.pipeline, value: `${val(l.processes)}`, per: l.processes != null },
      { label: admin.nav.team, value: `${val(l.members)}`, per: l.members != null },
    ];
  };

  return (
    <div className="force-dark landing-root relative min-h-screen overflow-hidden bg-background text-foreground">
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
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-lg bg-foreground opacity-[0.07] blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-20 h-80 w-80 rounded-lg bg-foreground opacity-[0.04] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-64 -right-20 h-80 w-80 rounded-lg bg-foreground opacity-[0.04] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 95% 40% at 50% 100%, black 5%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 95% 40% at 50% 100%, black 5%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-20 left-1/2 h-[420px] w-[680px] max-w-[90vw] -translate-x-1/2 rounded-lg bg-foreground opacity-[0.05] blur-[150px]"
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
            <a href="#planos" className="transition-colors hover:text-foreground">
              {dict.nav.pricing}
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
                <span className="h-2.5 w-2.5 rounded-lg bg-white/60" />
                <span className="h-2.5 w-2.5 rounded-lg bg-muted/30" />
                <span className="h-2.5 w-2.5 rounded-lg bg-muted/30" />
                <span className="ml-3 text-xs text-muted" dir="ltr">
                  disys.lumni.dev.br
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4">
                {KPI_META.map((c) => (
                  <div
                    key={c.key}
                    className="group/kpi rounded-lg border border-border bg-surface-2 p-3 text-left transition-colors hover:border-white/[0.15]"
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

        <section className="relative grid grid-cols-2 gap-2.5 border-y border-border py-8 md:grid-cols-4">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-[640px] max-w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-foreground opacity-[0.05] blur-[110px]"
          />
          {STAT_VALUES.map((value, i) => (
            <div key={dict.stats[i]} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {value}
              </p>
              <p className="mt-1 text-xs text-muted">{dict.stats[i]}</p>
            </div>
          ))}
        </section>

        <section id="modulos" className="relative scroll-mt-20 py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-6 -z-10 h-[440px] w-[780px] max-w-[95%] -translate-x-1/2 rounded-lg bg-foreground opacity-[0.05] blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.22]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse 65% 70% at 50% 42%, black, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 65% 70% at 50% 42%, black, transparent 78%)",
            }}
          />
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
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-lg bg-foreground opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10" />
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

        <section id="recursos" className="relative scroll-mt-20 py-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-lg bg-foreground opacity-[0.045] blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-lg bg-foreground opacity-[0.045] blur-[120px]"
          />
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
                  <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-lg bg-foreground opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10" />
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

        <section id="planos" className="relative scroll-mt-20 py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-6 -z-10 h-[440px] w-[780px] max-w-[95%] -translate-x-1/2 rounded-lg bg-foreground opacity-[0.05] blur-[140px]"
          />
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow label={dict.nav.pricing} />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {dict.pricing.title}
            </h2>
            <p className="mt-3 text-muted">{dict.pricing.subtitle}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 items-start gap-2.5 md:grid-cols-3">
            {PRICING_TIERS.map((tier) => {
              const highlight = tier.key === "max";
              return (
                <div
                  key={tier.key}
                  className={cx(
                    "relative flex flex-col overflow-hidden rounded-lg border bg-surface/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1",
                    highlight
                      ? "border-white/40"
                      : "border-border hover:border-white/40",
                  )}
                >
                  <h3 className="text-base font-semibold text-foreground">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{tierDesc(tier.key)}</p>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                    {priceOf(tier.key)}
                    <span className="text-sm font-normal text-muted">
                      {admin.plan.perMonth}
                    </span>
                  </p>
                  <ul className="mt-5 flex flex-col gap-2">
                    {featureRows(tier.key).map((r) => (
                      <li
                        key={r.label}
                        className="flex items-center gap-2 text-sm text-muted"
                      >
                        <IconCheck className="h-3.5 w-3.5 shrink-0 text-foreground" />
                        <span className="text-foreground">{r.value}</span>
                        {r.label}
                        {r.per && (
                          <span className="text-muted/70">
                            {admin.plan.perCompanyShort}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={ctaHref}
                    className={cx(
                      "mt-6 inline-flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
                      highlight
                        ? "bg-foreground text-background hover:bg-white"
                        : "border border-border bg-surface/60 text-foreground hover:border-white hover:bg-white/10",
                    )}
                  >
                    {dict.pricing.cta}
                  </Link>
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

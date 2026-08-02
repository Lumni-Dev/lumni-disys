"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/context";

export default function CareersIndexPage() {
  const { admin } = useI18n();
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-2.5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-foreground opacity-[0.06] blur-[140px]"
      />

      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-surface/80 p-6 text-center shadow-2xl backdrop-blur">
        <p className="text-2xl font-normal tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
          DISYS
        </p>
        <p className="mt-4 text-sm text-muted">{admin.careers.invalidLink}</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10"
        >
          {admin.careers.goHome}
        </Link>
      </div>
    </div>
  );
}

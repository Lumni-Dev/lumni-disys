"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useI18n } from "@/i18n/context";
import { IconGoogle, IconLinkedin, IconSpinner } from "@/components/ui/icons";

function IconArrowLeft({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function LoginCard({ error }: { error: boolean }) {
  const { admin } = useI18n();
  const t = admin.login;
  const [loading, setLoading] = useState<"google" | "linkedin" | null>(null);

  function go(provider: "google" | "linkedin") {
    if (loading) return;
    setLoading(provider);
    void signIn(provider, { callbackUrl: "/dashboard" });
  }

  const busy = loading !== null;

  return (
    <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-surface/80 shadow-2xl backdrop-blur">
      <div className="flex flex-col items-center gap-2.5 border-b border-border p-2.5 text-center">
        <p className="text-3xl font-normal tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
          DISYS
        </p>
        <p className="text-xs text-muted">{t.subtitle}</p>
      </div>

      <div className="flex flex-col gap-2.5 p-2.5">
        {error && (
          <p className="rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-2 text-xs text-foreground">
            {t.error}
          </p>
        )}
        <button
          type="button"
          onClick={() => go("google")}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border disabled:hover:bg-surface-2"
        >
          {loading === "google" ? (
            <IconSpinner className="h-5 w-5" />
          ) : (
            <IconGoogle className="h-5 w-5" />
          )}
          {t.google}
        </button>

        <button
          type="button"
          onClick={() => go("linkedin")}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border disabled:hover:bg-surface-2"
        >
          {loading === "linkedin" ? (
            <IconSpinner className="h-5 w-5" />
          ) : (
            <IconLinkedin className="h-5 w-5" />
          )}
          {t.linkedin}
        </button>

        <Link
          href="/"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <IconArrowLeft className="h-4 w-4" />
          {t.backHome}
        </Link>

        <p className="pt-1.5 text-center text-[11px] text-muted">
          <a
            href="https://lumni.dev.br/terms"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            {t.terms}
          </a>
        </p>
      </div>
    </div>
  );
}

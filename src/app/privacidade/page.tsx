"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { isEmail } from "@/lib/validation";
import { cx } from "@/lib/utils";
import { Input } from "@/components/ui/form";
import { IconCheck } from "@/components/ui/icons";

export default function DataRightsPage() {
  const { admin } = useI18n();
  const t = admin.dataRights;
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState<"export" | "delete">("export");
  const [invalid, setInvalid] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) {
      setInvalid((a) => a + 1);
      return;
    }
    setSending(true);
    try {
      await fetch("/api/public/data-rights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), kind }),
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  const option = (value: "export" | "delete", label: string) => (
    <button
      type="button"
      onClick={() => setKind(value)}
      className={cx(
        "flex-1 rounded-lg border px-2.5 py-2 text-sm font-medium transition-colors",
        kind === value
          ? "border-white/40 bg-white/10 text-foreground"
          : "border-border bg-surface-2 text-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="force-dark relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-2.5">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-lg bg-foreground opacity-[0.06] blur-[140px]"
      />
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-surface/80 shadow-xl shadow-black/20 backdrop-blur">
        <div className="flex flex-col items-center gap-2.5 border-b border-border p-2.5 text-center">
          <p className="text-2xl font-semibold tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
            DISYS
          </p>
          <p className="text-xs text-muted">{t.subtitle}</p>
        </div>

        <div className="p-2.5">
          {sent ? (
            <div className="flex flex-col items-center gap-2.5 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-background">
                <IconCheck className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted">{t.sent}</p>
              <Link
                href="/"
                className="mt-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10"
              >
                {admin.careers.goHome}
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-2.5">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted">
                  {t.emailLabel}
                </span>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  invalid={invalid}
                  maxLength={200}
                  placeholder="voce@email.com"
                />
              </label>
              <div className="flex gap-2.5">
                {option("export", t.exportOption)}
                {option("delete", t.deleteOption)}
              </div>
              <button
                type="submit"
                disabled={sending}
                className="mt-1 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? admin.careers.sending : t.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

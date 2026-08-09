"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { IconCheck } from "@/components/ui/icons";

function kindOf(token: string): "export" | "delete" | null {
  try {
    const body = token.split(".")[0];
    const json = JSON.parse(
      atob(body.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { k?: string };
    return json.k === "delete" ? "delete" : json.k === "export" ? "export" : null;
  } catch {
    return null;
  }
}

export default function ConfirmDataRightsPage() {
  const { admin } = useI18n();
  const t = admin.dataRights;
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "invalid">("idle");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setToken(p.get("token") ?? "");
  }, []);

  const kind = useMemo(() => (token ? kindOf(token) : null), [token]);

  async function confirm() {
    if (!token || !kind) {
      setStatus("invalid");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/public/data-rights/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        setStatus("invalid");
        return;
      }
      const data = (await res.json()) as {
        kind: "export" | "delete";
        data?: unknown;
      };
      if (data.kind === "export") {
        const blob = new Blob([JSON.stringify(data.data ?? [], null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "meus-dados-disys.json";
        a.click();
        URL.revokeObjectURL(url);
      }
      setStatus("done");
    } catch {
      setStatus("invalid");
    } finally {
      setBusy(false);
    }
  }

  const invalidLink = token !== "" && !kind;

  return (
    <div className="force-dark relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-2.5">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-lg bg-foreground opacity-[0.06] blur-[140px]"
      />
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-surface/80 p-2.5 text-center shadow-xl shadow-black/20 backdrop-blur">
        <p className="mb-2.5 text-2xl font-semibold tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
          DISYS
        </p>

        {status === "invalid" || invalidLink ? (
          <>
            <p className="py-4 text-sm text-muted">{t.invalid}</p>
            <Link
              href="/privacidade"
              className="inline-flex rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10"
            >
              {admin.careers.goHome}
            </Link>
          </>
        ) : status === "done" ? (
          <div className="flex flex-col items-center gap-2.5 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-background">
              <IconCheck className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted">
              {kind === "delete" ? t.deleted : t.exportDownload}
            </p>
            <Link
              href="/"
              className="mt-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10"
            >
              {admin.careers.goHome}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 py-4">
            <p className="text-sm text-muted">{t.confirmTitle}</p>
            <button
              type="button"
              onClick={confirm}
              disabled={busy || !token}
              className="rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {kind === "delete" ? t.confirmDelete : t.exportDownload}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

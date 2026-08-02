"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { api } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";
import { IconGoogle, IconLinkedin } from "@/components/ui/icons";

type State =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "wrong-email" }
  | { kind: "ready"; owner: string }
  | { kind: "working" };

export function InviteCard({
  token,
  sessionEmail,
}: {
  token: string;
  sessionEmail: string | null;
}) {
  const { admin } = useI18n();
  const t = admin.invite;
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!sessionEmail) return;
    let alive = true;
    fetch(`/api/invite/${token}`)
      .then(async (res) => {
        if (!alive) return;
        if (res.ok) {
          const d = (await res.json()) as { owner: string };
          setState({ kind: "ready", owner: d.owner });
        } else if (res.status === 403) {
          setState({ kind: "wrong-email" });
        } else {
          setState({ kind: "invalid" });
        }
      })
      .catch(() => {
        if (alive) setState({ kind: "invalid" });
      });
    return () => {
      alive = false;
    };
  }, [token, sessionEmail]);

  function answer(action: "accept" | "decline") {
    setState({ kind: "working" });
    void api
      .post(`/api/invite/${token}`, { action })
      .then(() =>
        window.location.assign(action === "accept" ? "/dashboard" : "/"),
      )
      .catch(() => setState({ kind: "invalid" }));
  }

  const callbackUrl = `/invite/${token}`;

  return (
    <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-surface/80 shadow-2xl backdrop-blur">
      <div className="flex flex-col items-center gap-2.5 border-b border-border p-2.5 text-center">
        <p className="text-3xl font-normal tracking-[0.28em] text-foreground [font-family:var(--font-orbitron)]">
          DISYS
        </p>
        <p className="text-xs text-muted">{t.title}</p>
      </div>

      <div className="flex flex-col gap-2.5 p-2.5">
        {!sessionEmail ? (
          <>
            <p className="text-center text-sm text-muted">{t.signInToView}</p>
            <button
              type="button"
              onClick={() => void signIn("google", { callbackUrl })}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10"
            >
              <IconGoogle className="h-5 w-5" />
              Google
            </button>
            <button
              type="button"
              onClick={() => void signIn("linkedin", { callbackUrl })}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-white hover:bg-white/10"
            >
              <IconLinkedin className="h-5 w-5" />
              LinkedIn
            </button>
          </>
        ) : state.kind === "loading" || state.kind === "working" ? (
          <p className="p-2.5 text-center text-sm text-muted">
            {admin.common.loading}
          </p>
        ) : state.kind === "invalid" ? (
          <p className="p-2.5 text-center text-sm text-muted">{t.invalid}</p>
        ) : state.kind === "wrong-email" ? (
          <p className="p-2.5 text-center text-sm text-muted">{t.wrongEmail}</p>
        ) : (
          <>
            <p className="p-2.5 text-center text-sm text-foreground">
              {t.invitedBy(state.owner)}
            </p>
            <button
              type="button"
              onClick={() => answer("accept")}
              className="w-full rounded-lg bg-foreground px-2.5 py-2 text-sm font-medium text-background transition-colors hover:bg-white"
            >
              {t.accept}
            </button>
            <button
              type="button"
              onClick={() => answer("decline")}
              className="w-full rounded-lg border border-border px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:border-white/[0.15] hover:text-foreground"
            >
              {t.decline}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

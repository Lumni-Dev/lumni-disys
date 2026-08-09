"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { IconCheck } from "@/components/ui/icons";
import { api } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";
import { cx } from "@/lib/utils";

type Plan = "free" | "plus" | "max";
type Limits = {
  workspaces: number | null;
  jobs: number | null;
  candidates: number | null;
  processes: number | null;
  members: number | null;
};

type PlanInfo = {
  plan: Plan;
  usage: {
    workspaces: number;
    jobs: number;
    candidates: number;
    processes: number;
    members: number;
  };
  limits: Limits;
  prices: { plus: number; max: number };
  status: string;
  cancelAtPeriodEnd: boolean;
  renewsAt: string | null;
};

const TIER_LIMITS: Record<Plan, Limits> = {
  free: { workspaces: 1, jobs: 5, candidates: 5, processes: 5, members: 1 },
  plus: { workspaces: 5, jobs: 25, candidates: 25, processes: 25, members: 5 },
  max: {
    workspaces: null,
    jobs: null,
    candidates: null,
    processes: null,
    members: null,
  },
};

const TIERS: Plan[] = ["free", "plus", "max"];

const RANK: Record<Plan, number> = { free: 0, plus: 1, max: 2 };

export default function PlanPage() {
  const { admin } = useI18n();
  const [info, setInfo] = useState<PlanInfo | null>(null);
  const [notice, setNotice] = useState<"success" | "canceled" | null>(null);
  const [busy, setBusy] = useState<Plan | "manage" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  function load(url: string) {
    api
      .get<PlanInfo>(url)
      .then((d) => {
        setInfo(d);
        window.dispatchEvent(new CustomEvent("plan-updated", { detail: d.plan }));
      })
      .catch(() => {});
  }

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");
    if (checkout === "success") setNotice("success");
    if (checkout === "canceled") setNotice("canceled");
    if (checkout) window.history.replaceState(null, "", "/plan");
    load(
      sessionId
        ? `/api/plan?session_id=${encodeURIComponent(sessionId)}`
        : "/api/plan",
    );
  }, []);

  async function subscribe(tier: Plan) {
    if (tier === "free") return;
    setBusy(tier);
    try {
      const { url } = await api.post<{ url: string }>("/api/stripe/checkout", {
        tier,
      });
      if (url) {
        window.location.assign(url);
        return;
      }
    } catch {

    }
    setBusy(null);
  }

  async function manage(action: "cancel" | "resume") {
    setBusy("manage");
    try {
      await api.post("/api/plan", { action });
      load("/api/plan");
    } catch {

    } finally {
      setBusy(null);
      setConfirmCancel(false);
    }
  }

  const brl = (cents: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

  function fmtDate(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const current = info?.plan ?? "free";
  const priceOf = (tier: Plan) =>
    tier === "free" ? 0 : tier === "max" ? info?.prices.max ?? 0 : info?.prices.plus ?? 0;
  const tierName = (tier: Plan) =>
    tier === "free" ? "Free" : tier === "max" ? "Max" : "Plus";
  const tierDesc = (tier: Plan) =>
    tier === "free"
      ? admin.plan.freeDesc
      : tier === "max"
        ? admin.plan.maxDesc
        : admin.plan.plusDesc;

  const KPIS: {
    key: keyof PlanInfo["usage"];
    label: string;
    perCompany: boolean;
  }[] = [
    { key: "workspaces", label: admin.plan.companies, perCompany: false },
    { key: "jobs", label: admin.nav.jobs, perCompany: true },
    { key: "candidates", label: admin.nav.candidates, perCompany: true },
    { key: "processes", label: admin.nav.pipeline, perCompany: true },
    { key: "members", label: admin.nav.team, perCompany: true },
  ];

  const featureRows = (tier: Plan) => {
    const l = TIER_LIMITS[tier];
    const val = (n: number | null) => (n == null ? admin.plan.unlimited : n);
    return [
      { label: admin.plan.companies, value: `${val(l.workspaces)}` },
      { label: admin.nav.jobs, value: `${val(l.jobs)}`, per: l.jobs != null },
      {
        label: admin.nav.candidates,
        value: `${val(l.candidates)}`,
        per: l.candidates != null,
      },
      {
        label: admin.nav.pipeline,
        value: `${val(l.processes)}`,
        per: l.processes != null,
      },
      {
        label: admin.nav.team,
        value: `${val(l.members)}`,
        per: l.members != null,
      },
    ];
  };

  const renewNote =
    info && info.plan !== "free" && info.renewsAt
      ? info.cancelAtPeriodEnd
        ? admin.plan.endsAt(fmtDate(info.renewsAt))
        : admin.plan.renewsAt(fmtDate(info.renewsAt))
      : null;

  return (
    <PageShell
      showSearch={false}
      action={
        renewNote ? (
          <span className="text-xs text-muted">{renewNote}</span>
        ) : undefined
      }
    >
      {notice && (
        <div
          className={cx(
            "rounded-lg border p-2.5 text-sm",
            notice === "success"
              ? "border-hairline-strong bg-overlay text-foreground"
              : "border-hairline bg-surface-2 text-muted",
          )}
        >
          {notice === "success"
            ? admin.plan.checkoutSuccess
            : admin.plan.checkoutCanceled}
        </div>
      )}

      <Card>
        <CardHeader
          title={admin.plan.usageTitle}
          subtitle={admin.plan.usageSubtitle}
        />
        <CardBody className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
          {KPIS.map((k) => {
            const used = info?.usage[k.key] ?? 0;
            const limit = info?.limits[k.key] ?? null;
            const pct =
              limit == null ? 0 : Math.min(100, (used / limit) * 100);
            return (
              <div
                key={k.key}
                className="rounded-lg border border-hairline bg-surface-2/40 p-2.5"
              >
                <p className="truncate text-xs text-muted">
                  {k.label}
                  {k.perCompany && (
                    <span className="text-muted/70">
                      {" "}
                      {admin.plan.perCompanyShort}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {used}
                  <span className="text-xs font-normal text-muted">
                    {" / "}
                    {limit == null ? admin.plan.unlimited : limit}
                  </span>
                </p>
                {limit != null && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-lg bg-surface-2">
                    <div
                      className="h-full rounded-lg bg-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 items-start gap-2.5 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const isCurrent = current === tier;
          const paidCurrent = isCurrent && tier !== "free";
          const highlight = tier === "max";
          return (
            <Card
              key={tier}
              className={cx(
                isCurrent && "ring-1 ring-accent/40",
                !isCurrent && highlight && "ring-1 ring-hairline",
              )}
            >
              <CardHeader
                title={tierName(tier)}
                subtitle={tierDesc(tier)}
                action={
                  isCurrent && info ? (
                    <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                      {admin.plan.current}
                    </span>
                  ) : undefined
                }
              />
              <CardBody>
                <p className="text-2xl font-semibold text-foreground">
                  {tier === "free" ? "R$ 0" : info ? brl(priceOf(tier)) : "—"}
                  <span className="text-sm font-normal text-muted">
                    {admin.plan.perMonth}
                  </span>
                </p>

                <ul className="mt-2.5 flex flex-col gap-1.5">
                  {featureRows(tier).map((r) => (
                    <li
                      key={r.label}
                      className="flex items-center gap-2 text-sm text-muted"
                    >
                      <IconCheck className="h-3.5 w-3.5 shrink-0" />
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
              </CardBody>

              {info && !isCurrent && tier !== "free" && (
                <CardFooter>
                  <div className="flex w-full justify-end">
                    <Button
                      loading={busy === tier}
                      disabled={busy !== null}
                      onClick={() => void subscribe(tier)}
                    >
                      {busy === tier
                        ? admin.plan.redirecting
                        : RANK[tier] > RANK[current]
                          ? `${admin.plan.upgrade} ${tierName(tier)}`
                          : admin.plan.switchPlan}
                    </Button>
                  </div>
                </CardFooter>
              )}

              {paidCurrent && info && (
                <CardFooter>
                  <div className="flex w-full justify-end">
                    {info.cancelAtPeriodEnd ? (
                      <Button
                        variant="outline"
                        loading={busy === "manage"}
                        disabled={busy !== null}
                        onClick={() => void manage("resume")}
                      >
                        {admin.plan.resume}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled={busy !== null}
                        onClick={() => setConfirmCancel(true)}
                      >
                        {admin.plan.cancel}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={admin.plan.cancel}
        subtitle={admin.plan.cancelDesc}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void manage("cancel");
          }}
        >
          <ModalFooter submitLabel={admin.common.confirm} loading={busy === "manage"} />
        </form>
      </Modal>
    </PageShell>
  );
}

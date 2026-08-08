"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { IconCheck } from "@/components/ui/icons";
import { api } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";
import { cx } from "@/lib/utils";

type PlanInfo = {
  plan: "free" | "plus";
  isOwner: boolean;
  usage: {
    workspaces: number;
    companies: number;
    jobs: number;
    candidates: number;
  };
  limits: {
    workspaces: number;
    companies: number;
    jobs: number;
    candidates: number;
  };
  priceCents: number;
  status: string;
  cancelAtPeriodEnd: boolean;
  renewsAt: string | null;
};

type Resource = "workspaces" | "companies" | "jobs" | "candidates";
const RESOURCES: Resource[] = [
  "workspaces",
  "companies",
  "jobs",
  "candidates",
];

export default function PlanPage() {
  const { admin } = useI18n();
  const [info, setInfo] = useState<PlanInfo | null>(null);
  const [notice, setNotice] = useState<"success" | "canceled" | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    // Retorno do checkout: mostra o aviso e sincroniza o plano pela sessao
    // (fallback para quando o webhook nao alcanca o ambiente).
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");
    if (checkout === "success") setNotice("success");
    if (checkout === "canceled") setNotice("canceled");
    if (checkout) window.history.replaceState(null, "", "/plan");
    const url = sessionId
      ? `/api/plan?session_id=${encodeURIComponent(sessionId)}`
      : "/api/plan";
    api
      .get<PlanInfo>(url)
      .then((d) => {
        setInfo(d);
        // Atualiza o badge Free/Plus do menu sem precisar de reload.
        window.dispatchEvent(new CustomEvent("plan-updated", { detail: d.plan }));
      })
      .catch(() => {});
  }, []);

  async function subscribe() {
    setBusy(true);
    try {
      const { url } = await api.post<{ url: string }>(
        "/api/stripe/checkout",
        {},
      );
      if (url) {
        window.location.assign(url);
        return;
      }
      setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  async function manage(action: "cancel" | "resume") {
    setBusy(true);
    try {
      await api.post("/api/plan", { action });
      const fresh = await api.get<PlanInfo>("/api/plan");
      setInfo(fresh);
      window.dispatchEvent(
        new CustomEvent("plan-updated", { detail: fresh.plan }),
      );
    } catch {
      // Mantem os dados atuais; o usuario pode tentar de novo.
    } finally {
      setBusy(false);
      setConfirmCancel(false);
    }
  }

  // Datas sempre no fuso de Sao Paulo (padrao do sistema).
  function fmtDate(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const isPlus = info?.plan === "plus";
  // Mensalidade do Plus formatada em BRL (valor vem do env via API).
  const plusPrice =
    info &&
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "BRL",
    }).format(info.priceCents / 100);
  const resourceLabel: Record<Resource, string> = {
    workspaces: "Workspaces",
    companies: admin.nav.companies,
    jobs: admin.nav.jobs,
    candidates: admin.nav.candidates,
  };

  return (
    <PageShell showSearch={false}>
      {notice && (
        <div
          className={cx(
            "rounded-lg border p-2.5 text-sm",
            notice === "success"
              ? "border-white/20 bg-white/10 text-foreground"
              : "border-white/10 bg-surface-2 text-muted",
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
        <CardBody className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {RESOURCES.map((r) => {
            const used = info?.usage[r] ?? 0;
            const limit = info?.limits[r] ?? 1;
            const pct = isPlus ? 0 : Math.min(100, (used / limit) * 100);
            return (
              <div
                key={r}
                className="rounded-lg border border-white/[0.06] bg-surface-2/40 p-2.5"
              >
                <p className="text-xs text-muted">{resourceLabel[r]}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {used}
                  <span className="text-xs font-normal text-muted">
                    {" "}
                    / {isPlus ? admin.plan.unlimited : limit}
                  </span>
                </p>
                {!isPlus && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {/* Free */}
        <Card className={cx(!isPlus && "ring-1 ring-white/15")}>
          <CardHeader
            title="Free"
            subtitle={admin.plan.freeDesc}
            action={
              !isPlus &&
              info && (
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-white/10">
                  {admin.plan.current}
                </span>
              )
            }
          />
          <CardBody>
            <p className="text-2xl font-semibold text-foreground">
              R$ 0
              <span className="text-sm font-normal text-muted">
                {admin.plan.perMonth}
              </span>
            </p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {admin.plan.featuresFree.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <IconCheck className="h-3.5 w-3.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Plus */}
        <Card className={cx(isPlus && "ring-1 ring-accent/40")}>
          <CardHeader
            title="Plus"
            subtitle={admin.plan.plusDesc}
            action={
              isPlus ? (
                <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                  {admin.plan.current}
                </span>
              ) : undefined
            }
          />
          <CardBody>
            <p className="text-2xl font-semibold text-foreground">
              {plusPrice ?? "—"}
              <span className="text-sm font-normal text-muted">
                {admin.plan.perMonth}
              </span>
            </p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {admin.plan.featuresPlus.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <IconCheck className="h-3.5 w-3.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {info && !isPlus && info.isOwner && (
              <Button
                className="mt-3"
                disabled={busy}
                onClick={() => void subscribe()}
              >
                {busy ? admin.plan.redirecting : admin.plan.upgrade}
              </Button>
            )}
            {info && !info.isOwner && (
              <p className="mt-3 text-xs text-muted">{admin.plan.ownerOnly}</p>
            )}

            {info && isPlus && (
              <div className="mt-3 flex flex-col gap-2">
                {info.renewsAt && (
                  <p className="text-xs text-muted">
                    {info.cancelAtPeriodEnd
                      ? admin.plan.endsAt(fmtDate(info.renewsAt))
                      : admin.plan.renewsAt(fmtDate(info.renewsAt))}
                  </p>
                )}
                {info.isOwner &&
                  (info.cancelAtPeriodEnd ? (
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => void manage("resume")}
                    >
                      {admin.plan.resume}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => setConfirmCancel(true)}
                    >
                      {admin.plan.cancel}
                    </Button>
                  ))}
              </div>
            )}
          </CardBody>
        </Card>
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
          <ModalFooter submitLabel={admin.common.confirm} />
        </form>
      </Modal>
    </PageShell>
  );
}

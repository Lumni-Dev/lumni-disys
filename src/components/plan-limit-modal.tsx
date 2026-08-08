"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { useI18n } from "@/i18n/context";

// Aviso de limite do plano Free atingido (1 empresa/vaga/candidato), com
// atalho para a pagina do plano. Aberto pelas telas de cadastro quando a
// API devolve 402 plan_limit.
export function PlanLimitModal({
  resource,
  open,
  onClose,
}: {
  resource: "companies" | "jobs" | "candidates";
  open: boolean;
  onClose: () => void;
}) {
  const { admin } = useI18n();
  const messages = {
    companies: admin.plan.limitCompanies,
    jobs: admin.plan.limitJobs,
    candidates: admin.plan.limitCandidates,
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={admin.plan.limitTitle}
      subtitle={messages[resource]}
    >
      <div className="flex justify-end gap-2.5 p-2.5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          {admin.common.close}
        </button>
        <Link
          href="/plan"
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground shadow-[0_2px_10px_-2px_rgba(0,0,0,0.6)] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          {admin.plan.limitCta}
        </Link>
      </div>
    </Modal>
  );
}

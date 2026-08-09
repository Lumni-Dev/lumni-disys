"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { useI18n } from "@/i18n/context";

export function PlanLimitModal({
  resource,
  open,
  onClose,
}: {
  resource: "workspaces" | "jobs" | "candidates" | "processes" | "members";
  open: boolean;
  onClose: () => void;
}) {
  const { admin } = useI18n();
  const messages = {
    workspaces: admin.plan.limitWorkspaces,
    jobs: admin.plan.limitJobs,
    candidates: admin.plan.limitCandidates,
    processes: admin.plan.limitProcesses,
    members: admin.plan.limitMembers,
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
          onClick={onClose}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          {admin.plan.limitCta}
        </Link>
      </div>
    </Modal>
  );
}

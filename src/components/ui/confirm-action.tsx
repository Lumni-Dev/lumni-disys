"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/context";
import { Modal } from "./modal";
import { Tooltip } from "./tooltip";

export function ConfirmAction({
  label,
  title,
  message,
  confirmLabel,
  onConfirm,
  icon,
}: {
  label: string;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  icon?: ReactNode;
}) {
  const { admin } = useI18n();
  const [open, setOpen] = useState(false);
  const resolvedMessage = message ?? admin.modals.confirmMessage;
  const resolvedConfirm = confirmLabel ?? admin.common.confirm;

  return (
    <>
      {icon ? (
        <Tooltip label={label}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={label}
            title={label}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted shadow-sm transition-all duration-200 hover:border-white/[0.15] hover:text-foreground active:scale-[0.98]"
          >
            {icon}
          </button>
        </Tooltip>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-white/40 px-2.5 py-1.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-white/10 active:scale-[0.98]"
        >
          {label}
        </button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title ?? label}
        subtitle={resolvedMessage}
      >
        <div className="flex items-center justify-end gap-2.5 p-2.5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-muted transition-all duration-200 hover:border-white/[0.15] hover:bg-surface-2 hover:text-foreground active:scale-[0.98]"
          >
            {admin.common.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            className="rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-medium text-background shadow-[0_2px_10px_-2px_rgba(0,0,0,0.6)] transition-all duration-200 hover:bg-white active:scale-[0.98]"
          >
            {resolvedConfirm}
          </button>
        </div>
      </Modal>
    </>
  );
}

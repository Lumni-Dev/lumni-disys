"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/context";
import { Modal } from "./modal";
import { Button, IconButton } from "./button";
import { IconSpinner } from "./icons";

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

  onConfirm: () => void | Promise<void>;
  icon?: ReactNode;
}) {
  const { admin } = useI18n();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const resolvedMessage = message ?? admin.modals.confirmMessage;
  const resolvedConfirm = confirmLabel ?? admin.common.confirm;

  async function confirm() {
    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {icon ? (
        <IconButton
          label={label}
          icon={icon}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button variant="outline" onClick={() => setOpen(true)}>
          {label}
        </Button>
      )}

      <Modal
        open={open}

        onClose={() => !loading && setOpen(false)}
        title={title ?? label}
        subtitle={resolvedMessage}
      >
        <div className="flex items-center justify-end gap-2.5 p-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => setOpen(false)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-muted transition-all duration-200 hover:border-hairline-strong hover:bg-surface-2 hover:text-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {admin.common.cancel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={confirm}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-medium text-background transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
          >
            {loading && <IconSpinner className="h-4 w-4" />}
            {resolvedConfirm}
          </button>
        </div>
      </Modal>
    </>
  );
}

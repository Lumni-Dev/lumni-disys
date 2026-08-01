"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "./modal";
import { Tooltip } from "./tooltip";

export function ConfirmAction({
  label,
  title,
  message = "Esta ação não pode ser desfeita.",
  confirmLabel = "Confirmar",
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
  const [open, setOpen] = useState(false);

  return (
    <>
      {icon ? (
        <Tooltip label={label}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={label}
            title={label}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted shadow-sm transition-all duration-200 hover:border-white/25 hover:text-foreground active:scale-[0.98]"
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
        subtitle={message}
      >
        <div className="flex items-center justify-end gap-2.5 p-2.5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-muted transition-all duration-200 hover:border-white/25 hover:bg-surface-2 hover:text-foreground active:scale-[0.98]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            className="rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-medium text-background shadow-[0_2px_10px_-2px_rgba(0,0,0,0.6)] transition-all duration-200 hover:bg-white active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </Modal>
    </>
  );
}

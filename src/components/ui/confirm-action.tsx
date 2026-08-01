"use client";

import { useState } from "react";
import { Modal } from "./modal";

export function ConfirmAction({
  label,
  title,
  message = "Esta ação não pode ser desfeita.",
  confirmLabel = "Confirmar",
  onConfirm,
}: {
  label: string;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red/50 px-2.5 py-1.5 text-sm font-medium text-red-soft transition-colors hover:bg-red/10"
      >
        {label}
      </button>

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
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            className="rounded-lg bg-red px-2.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-soft"
          >
            {confirmLabel}
          </button>
        </div>
      </Modal>
    </>
  );
}

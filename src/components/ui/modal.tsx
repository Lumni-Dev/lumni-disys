"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { IconClose } from "./icons";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: "md" | "lg";
  children: ReactNode;
}) {
  const { admin } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-2.5 sm:items-center">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          "relative z-10 my-2.5 w-full rounded-lg border border-white/[0.08] bg-surface shadow-2xl shadow-black/50",
          size === "lg" ? "max-w-2xl" : "max-w-lg",
        )}
      >
        <div className="flex items-start justify-between gap-2.5 border-b border-white/[0.05] p-2.5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label={admin.common.close}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ModalFooter({
  submitLabel,
}: {
  // Fechar o modal já cancela; mantido opcional por compatibilidade.
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const { admin } = useI18n();
  const label = submitLabel ?? admin.common.save;
  return (
    <div className="flex items-center justify-end gap-2.5 border-t border-white/[0.05] p-2.5">
      <button
        type="submit"
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground shadow-[0_2px_10px_-2px_rgba(0,0,0,0.6)] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
      >
        {label}
      </button>
    </div>
  );
}

"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { IconClose } from "./icons";


const emptySubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  scope,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: "md" | "lg";


  scope?: string;
  children: ReactNode;
}) {
  const { admin } = useI18n();
  const mounted = useMounted();

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
    <div
      className={cx(
        "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-2.5 sm:items-center",
        scope,
      )}
    >
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
          "relative z-10 my-2.5 w-full rounded-lg border border-hairline bg-surface shadow-xl shadow-black/20",
          size === "lg" ? "max-w-2xl" : "max-w-lg",
        )}
      >
        <div className="flex items-start justify-between gap-2.5 border-b border-hairline p-2.5">
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
  secondaryAction,
}: {

  onCancel?: () => void;
  submitLabel?: string;

  secondaryAction?: ReactNode;
}) {
  const { admin } = useI18n();
  const label = submitLabel ?? admin.common.save;
  return (
    <div
      className={cx(
        "flex items-center gap-2.5 border-t border-hairline p-2.5",
        secondaryAction ? "justify-between" : "justify-end",
      )}
    >
      {secondaryAction}
      <button
        type="submit"
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
      >
        {label}
      </button>
    </div>
  );
}

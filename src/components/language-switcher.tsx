"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/i18n/context";
import { cx } from "@/lib/utils";

const MENU_WIDTH = 176; // w-44

function IconGlobe({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </svg>
  );
}

function IconChevron({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function LanguageSwitcher({
  variant = "header",
  className,
}: {
  variant?: "header" | "card";
  className?: string;
}) {
  const { locale, setLocale, dict, locales } = useI18n();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Posiciona o menu (portal, position fixed) ancorado ao botao, para
  // escapar de containers com overflow-hidden (ex.: o Card do perfil).
  useEffect(() => {
    if (!open) return;

    const place = () => {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const rawLeft = variant === "card" ? r.left : r.right - MENU_WIDTH;
      const left = Math.max(
        8,
        Math.min(rawLeft, window.innerWidth - MENU_WIDTH - 8),
      );
      setPos({ top: r.bottom + 6, left });
    };
    place();

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !btnRef.current?.contains(t) &&
        !menuRef.current?.contains(t)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, variant]);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <div className={cx("relative", className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={dict.languageLabel}
        className={cx(
          "inline-flex items-center gap-1.5 rounded-lg border border-border text-sm text-foreground transition-colors hover:border-white/40 hover:bg-white/5",
          variant === "card" ? "px-3 py-2" : "bg-surface/60 px-2.5 py-1.5 backdrop-blur",
        )}
      >
        <IconGlobe className="h-4 w-4 text-muted" />
        <span>{current.label}</span>
        <IconChevron className="h-3.5 w-3.5 text-muted" />
      </button>

      {open && pos
        ? createPortal(
            <ul
              ref={menuRef}
              role="listbox"
              aria-label={dict.languageLabel}
              style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
              className="fixed z-[100] max-h-72 overflow-auto rounded-lg border border-border bg-surface p-1 shadow-2xl"
            >
              {locales.map((l) => (
                <li key={l.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={l.code === locale}
                    dir={l.dir}
                    onClick={() => {
                      setLocale(l.code);
                      setOpen(false);
                    }}
                    className={cx(
                      "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      l.code === locale
                        ? "bg-white/10 text-foreground"
                        : "text-muted hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <span>{l.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted">
                      {l.code}
                    </span>
                  </button>
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}

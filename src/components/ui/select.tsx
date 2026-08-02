"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";
import { controlClass } from "./form";
import { IconChevronDown, IconCheck } from "./icons";

export type Option = string | { value: string; label: string };

const normalize = (o: Option) =>
  typeof o === "string" ? { value: o, label: o } : o;

export function Select({
  value,
  onChange,
  options,
  placeholder = "Selecione…",
  emptyLabel,
  disabled,
  invalid = 0,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  invalid?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (invalid && el) {
      el.classList.remove("animate-shake");
      void el.offsetWidth;
      el.classList.add("animate-shake");
    }
  }, [invalid]);

  const opts = [
    ...(emptyLabel !== undefined ? [{ value: "", label: emptyLabel }] : []),
    ...options.map(normalize),
  ];
  const selected = opts.find((o) => o.value === value);

  useEffect(() => setMounted(true), []);

  function measure() {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setRect(r);
  }

  function openPanel() {
    if (disabled) return;
    measure();
    setActiveIndex(Math.max(0, opts.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function choose(v: string) {
    onChange(v);
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(opts.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (opts[activeIndex]) choose(opts[activeIndex].value);
      }
    }
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t))
        return;
      setOpen(false);
    }
    function onReposition() {
      measure();
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, activeIndex, opts]);

  let panelStyle: React.CSSProperties = {};
  let maxHeight = 260;
  if (rect) {
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    const estimated = Math.min(opts.length * 38 + 8, 260);
    const openUp = below < estimated && above > below;
    maxHeight = Math.min(260, (openUp ? above : below) - 8);
    panelStyle = openUp
      ? {
          position: "fixed",
          bottom: window.innerHeight - rect.top + 4,
          left: rect.left,
          width: rect.width,
        }
      : {
          position: "fixed",
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        };
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={cx(
          controlClass,
          "flex cursor-pointer items-center justify-between gap-2.5 text-left disabled:cursor-not-allowed disabled:opacity-40",
          open && "border-white/50 ring-1 ring-white/30",
          !!invalid && "ring-1 ring-accent",
          className,
        )}
        style={invalid ? { borderColor: "var(--accent)" } : undefined}
      >
        <span className={cx("truncate", !selected && "text-muted")}>
          {selected?.label ?? placeholder}
        </span>
        <IconChevronDown
          className={cx(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open &&
        mounted &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            style={{ ...panelStyle, maxHeight }}
            className="scroll-thin z-[60] overflow-y-auto rounded-lg border border-white/10 bg-surface p-1 shadow-2xl shadow-black/50"
          >
            {opts.map((o, i) => {
              const isSelected = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => choose(o.value)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cx(
                    "flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
                    i === activeIndex
                      ? "bg-foreground text-background"
                      : isSelected
                        ? "text-foreground"
                        : "text-foreground hover:bg-surface-2",
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected && <IconCheck className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}

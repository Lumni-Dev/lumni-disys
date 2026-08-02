"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";
import { controlClass } from "./form";
import { IconChevronDown } from "./icons";

// Campo de busca com sugestoes: filtra conforme digita, aceita valor livre e
// tem navegacao por teclado. O painel usa portal com posicao fixa (mesmo
// padrao do Select) para nao ser cortado por modais.

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function Combobox({
  value,
  onChange,
  onPick,
  options,
  placeholder,
  invalid = 0,
  maxLength,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Disparado apenas quando o usuario escolhe uma sugestao da lista. */
  onPick?: (value: string) => void;
  options: string[];
  placeholder?: string;
  invalid?: number;
  maxLength?: number;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Shake em submit invalido (mesmo comportamento do Input).
  useEffect(() => {
    const el = inputRef.current;
    if (invalid && el) {
      el.classList.remove("animate-shake");
      void el.offsetWidth;
      el.classList.add("animate-shake");
    }
  }, [invalid]);

  const filtered = useMemo(() => {
    const q = fold(value.trim());
    const base = q ? options.filter((o) => fold(o).includes(q)) : options;
    return base.slice(0, 50);
  }, [options, value]);

  function measure() {
    const r = inputRef.current?.getBoundingClientRect();
    if (r) setRect(r);
  }

  function openPanel() {
    if (disabled) return;
    measure();
    setActive(-1);
    setOpen(true);
  }

  function choose(v: string) {
    onChange(v);
    onPick?.(v);
    setOpen(false);
    inputRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;

    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (inputRef.current?.contains(t) || panelRef.current?.contains(t))
        return;
      setOpen(false);
    }
    function onReposition() {
      measure();
    }

    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      openPanel();
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      // Com sugestao ativa, Enter escolhe; sem, deixa o form submeter.
      if (active >= 0 && filtered[active]) {
        e.preventDefault();
        choose(filtered[active]);
      } else {
        setOpen(false);
      }
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  // Painel abre para cima quando falta espaco embaixo (igual ao Select).
  let panelStyle: React.CSSProperties = {};
  let maxHeight = 220;
  if (rect) {
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    const estimated = Math.min(filtered.length * 38 + 8, 220);
    const openUp = below < estimated && above > below;
    maxHeight = Math.min(220, (openUp ? above : below) - 8);
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
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(-1);
          if (!open) openPanel();
        }}
        onFocus={openPanel}
        onClick={() => {
          if (!open) openPanel();
        }}
        onKeyDown={onKeyDown}
        className={cx(
          controlClass,
          "pr-8 disabled:cursor-not-allowed disabled:opacity-40",
          !!invalid && "ring-1 ring-accent",
        )}
        style={invalid ? { borderColor: "var(--accent)" } : undefined}
      />
      <IconChevronDown
        className={cx(
          "pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-transform",
          open && "rotate-180",
        )}
      />

      {open &&
        rect &&
        filtered.length > 0 &&
        createPortal(
          <div
            ref={panelRef}
            id={listId}
            role="listbox"
            style={{ ...panelStyle, maxHeight }}
            className="scroll-thin z-[60] overflow-y-auto rounded-lg border border-white/[0.08] bg-surface p-1 shadow-2xl shadow-black/50"
          >
            {filtered.map((o, i) => (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
                onMouseEnter={() => setActive(i)}
                className={cx(
                  "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
                  i === active
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-surface-2",
                )}
              >
                <span className="truncate">{o}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

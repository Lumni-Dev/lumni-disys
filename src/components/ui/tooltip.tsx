"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";

export function Tooltip({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  function place() {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ x: r.left + r.width / 2, y: r.bottom + 6 });
  }

  // Mantém o tooltip dentro da viewport (evita corte/estouro na horizontal).
  useLayoutEffect(() => {
    if (!coords || !tipRef.current) return;
    const t = tipRef.current.getBoundingClientRect();
    const pad = 8;
    let x = coords.x;
    if (t.left < pad) x += pad - t.left;
    else if (t.right > window.innerWidth - pad)
      x -= t.right - (window.innerWidth - pad);
    if (Math.abs(x - coords.x) > 0.5) setCoords({ x, y: coords.y });
  }, [coords]);

  return (
    <span
      ref={wrapRef}
      className={cx("inline-flex", className)}
      onMouseEnter={place}
      onMouseLeave={() => setCoords(null)}
      onFocus={place}
      onBlur={() => setCoords(null)}
    >
      {children}
      {coords &&
        createPortal(
          <span
            ref={tipRef}
            style={{
              position: "fixed",
              left: coords.x,
              top: coords.y,
              transform: "translateX(-50%)",
            }}
            className="pointer-events-none z-[100] whitespace-nowrap rounded-lg border border-white/[0.08] bg-surface px-2 py-1 text-xs text-foreground shadow-xl shadow-black/50"
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/lib/utils";

export const controlClass =
  "w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-white/50 focus:ring-1 focus:ring-white/30";

export function Field({
  label,
  children,
  full,
  req,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
  req?: boolean;
}) {
  return (
    <label className={cx("flex flex-col gap-1.5", full && "sm:col-span-2")}>
      <span className="text-xs font-medium text-muted">
        {label}
        {req && <span className="text-accent"> *</span>}
      </span>
      {children}
    </label>
  );
}

// `invalid` é um contador: muda a cada tentativa de submit inválida para
// re-disparar o shake; > 0 pinta a borda com a cor do tema.
function useShake<T extends HTMLElement>(invalid: number) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (invalid && el) {
      el.classList.remove("animate-shake");
      void el.offsetWidth; // reflow para reiniciar a animação
      el.classList.add("animate-shake");
    }
  }, [invalid]);
  return ref;
}

const invalidStyle = (invalid: number, style?: React.CSSProperties) => ({
  ...style,
  ...(invalid ? { borderColor: "var(--accent)" } : {}),
});

export function Input({
  invalid = 0,
  className,
  style,
  ...props
}: { invalid?: number } & React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useShake<HTMLInputElement>(invalid);
  return (
    <input
      ref={ref}
      {...props}
      className={cx(controlClass, !!invalid && "ring-1 ring-accent", className)}
      style={invalidStyle(invalid, style)}
    />
  );
}

export function Textarea({
  invalid = 0,
  maxLength,
  value,
  className,
  style,
  ...props
}: { invalid?: number } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useShake<HTMLTextAreaElement>(invalid);
  const len = typeof value === "string" ? value.length : 0;
  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        maxLength={maxLength}
        {...props}
        className={cx(
          controlClass,
          "resize-none",
          maxLength != null && "pb-6",
          !!invalid && "ring-1 ring-accent",
          className,
        )}
        style={invalidStyle(invalid, style)}
      />
      {maxLength != null && (
        <span className="pointer-events-none absolute bottom-1.5 right-2.5 text-[11px] text-muted">
          {len}/{maxLength}
        </span>
      )}
    </div>
  );
}

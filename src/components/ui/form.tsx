"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/lib/utils";

export const controlClass =
  "w-full rounded-lg border border-border bg-surface-2/70 px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-hairline-strong";

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

function useShake<T extends HTMLElement>(invalid: number) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (invalid && el) {
      el.classList.remove("animate-shake");
      void el.offsetWidth;
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
  type,
  onChange,
  ...props
}: { invalid?: number } & React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useShake<HTMLInputElement>(invalid);

  const upper = type === undefined || type === "text" || type === "search";
  const handleChange: React.ChangeEventHandler<HTMLInputElement> | undefined =
    upper && onChange
      ? (e) => {
          e.target.value = e.target.value.toUpperCase();
          onChange(e);
        }
      : onChange;
  return (
    <input
      ref={ref}
      type={type}
      {...props}
      onChange={handleChange}

      className={cx(
        controlClass,
        "truncate",
        !!invalid && "ring-1 ring-accent",
        className,
      )}
      style={{
        ...invalidStyle(invalid, style),
        ...(upper ? { textTransform: "uppercase" } : {}),
      }}
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
    <div className="flex flex-col gap-1">
      <textarea
        ref={ref}
        value={value}
        maxLength={maxLength}
        {...props}
        className={cx(
          controlClass,
          "resize-none",
          !!invalid && "ring-1 ring-accent",
          className,
        )}
        style={invalidStyle(invalid, style)}
      />

      {maxLength != null && (
        <span className="self-end text-[11px] tabular-nums leading-none text-muted/70">
          {len}/{maxLength}
        </span>
      )}
    </div>
  );
}

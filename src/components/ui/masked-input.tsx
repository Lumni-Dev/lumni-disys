"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { cx } from "@/lib/utils";
import { controlClass } from "./form";

type BaseProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "style"
> & {
  invalid?: number;

  value?: string;
  onChange?: (value: string) => void;
};

const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function formatPhone(value: string) {

  const d = onlyDigits(value).slice(0, 15);
  return d ? `+${d}` : "";
}

export function moneyToNumber(value: string): number {
  const d = onlyDigits(value);
  return d ? parseInt(d, 10) / 100 : 0;
}

export function formatMoney(value: string) {
  const d = onlyDigits(value).slice(0, 12);
  if (!d) return "";
  const amount = (parseInt(d, 10) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `R$ ${amount}`;
}

function MaskedInput({
  format,
  invalid = 0,
  value,
  onChange,
  className,
  ...props
}: BaseProps & { format: (v: string) => string }) {
  const [internal, setInternal] = useState("");
  const controlled = value !== undefined;
  const val = controlled ? value : internal;
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (invalid && el) {
      el.classList.remove("animate-shake");
      void el.offsetWidth;
      el.classList.add("animate-shake");
    }
  }, [invalid]);

  function handle(raw: string) {
    const formatted = format(raw);
    if (controlled) onChange?.(formatted);
    else setInternal(formatted);
  }

  return (
    <input
      ref={ref}
      {...props}
      value={val}
      onChange={(e) => handle(e.target.value)}
      className={cx(controlClass, !!invalid && "ring-1 ring-accent", className)}
      style={invalid ? { borderColor: "var(--accent)" } : undefined}
    />
  );
}

export function PhoneInput(props: BaseProps) {
  return <MaskedInput format={formatPhone} inputMode="tel" {...props} />;
}

export function MoneyInput(props: BaseProps) {
  return <MaskedInput format={formatMoney} inputMode="numeric" {...props} />;
}

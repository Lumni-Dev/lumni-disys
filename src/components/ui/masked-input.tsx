"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { cx } from "@/lib/utils";
import { controlClass } from "./form";

type BaseProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "style"
> & {
  invalid?: number;
  // Uso controlado opcional: o pai guarda o valor já formatado.
  value?: string;
  onChange?: (value: string) => void;
};

const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function formatCnpj(value: string) {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(
    8,
    12,
  )}-${d.slice(12)}`;
}

export function formatPhone(value: string) {
  // Formato internacional: o usuário digita o número completo com o código do
  // país; a máscara só garante o "+" na frente (padrão E.164, até 15 dígitos).
  const d = onlyDigits(value).slice(0, 15);
  return d ? `+${d}` : "";
}

// Converte o valor formatado ("R$ 1.234,56") em número (1234.56).
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

export function CnpjInput(props: BaseProps) {
  return <MaskedInput format={formatCnpj} inputMode="numeric" {...props} />;
}

export function PhoneInput(props: BaseProps) {
  return <MaskedInput format={formatPhone} inputMode="tel" {...props} />;
}

export function MoneyInput(props: BaseProps) {
  return <MaskedInput format={formatMoney} inputMode="numeric" {...props} />;
}

"use client";

import { useState, type InputHTMLAttributes } from "react";
import { controlClass } from "./form";

type BaseProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
>;

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
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function formatMoney(value: string) {
  const d = onlyDigits(value);
  if (!d) return "";
  const amount = (parseInt(d, 10) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `R$ ${amount}`;
}

function useMask(format: (v: string) => string, initial = "") {
  const [value, setValue] = useState(initial);
  return {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(format(e.target.value)),
  };
}

export function CnpjInput(props: BaseProps) {
  const mask = useMask(formatCnpj);
  return (
    <input {...props} {...mask} inputMode="numeric" className={controlClass} />
  );
}

export function PhoneInput(props: BaseProps) {
  const mask = useMask(formatPhone);
  return (
    <input {...props} {...mask} inputMode="tel" className={controlClass} />
  );
}

export function MoneyInput(props: BaseProps) {
  const mask = useMask(formatMoney);
  return (
    <input {...props} {...mask} inputMode="numeric" className={controlClass} />
  );
}

import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

export const controlClass =
  "w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-red/60 focus:ring-1 focus:ring-red/40";

export function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <label className={cx("flex flex-col gap-1.5", full && "sm:col-span-2")}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(controlClass, className)} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return <textarea {...props} className={cx(controlClass, "resize-none")} />;
}

import type { ReactNode } from "react";
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
  return (
    <span className={cx("group/tt relative inline-flex", className)}>
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground opacity-0 shadow-lg transition-opacity group-hover/tt:opacity-100">
        {label}
      </span>
    </span>
  );
}

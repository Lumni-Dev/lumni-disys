import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "elevated overflow-hidden rounded-lg border border-white/[0.06] bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 border-b border-white/[0.05] p-2.5">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cx("p-2.5", className)}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex items-center justify-between gap-2.5 border-t border-white/[0.05] bg-white/[0.015] p-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

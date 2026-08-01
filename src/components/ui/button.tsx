import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-red text-white hover:bg-red-soft",
  outline:
    "border border-border text-muted hover:bg-surface-2 hover:text-foreground",
  ghost: "text-muted hover:bg-surface-2 hover:text-foreground",
};

export function Button({
  variant = "primary",
  icon,
  children,
  className,
  ...props
}: {
  variant?: Variant;
  icon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function AddButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return <Button onClick={onClick}>{children}</Button>;
}

export function IconButton({
  children,
  ...props
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground"
    >
      {children}
    </button>
  );
}

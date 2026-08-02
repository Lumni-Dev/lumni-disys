import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";
import { IconPlus } from "./icons";
import { Tooltip } from "./tooltip";

type Variant = "primary" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-[0_2px_10px_-2px_rgba(0,0,0,0.6)] hover:brightness-110 active:scale-[0.98]",
  outline:
    "border border-border bg-surface-2/40 text-muted shadow-sm hover:border-white/[0.15] hover:bg-surface-2 hover:text-foreground active:scale-[0.98]",
  ghost: "text-muted hover:bg-surface-2 hover:text-foreground active:scale-[0.98]",
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
  // Sem texto = botão quadrado só com ícone; com texto = altura padrão + padding.
  const iconOnly = icon != null && children == null;
  return (
    <button
      {...props}
      className={cx(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
        iconOnly ? "w-8" : "px-3",
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
  children: string;
  onClick?: () => void;
}) {
  return (
    <Tooltip label={children}>
      <Button
        onClick={onClick}
        aria-label={children}
        icon={<IconPlus className="h-4 w-4" />}
      />
    </Tooltip>
  );
}

export function IconButton({
  children,
  ...props
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted shadow-sm transition-all duration-200 hover:border-white/[0.15] hover:text-foreground active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";
import { IconPlus } from "./icons";
import { Tooltip } from "./tooltip";

type Variant = "primary" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground hover:brightness-110",
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
  // Sem texto = botão quadrado só com ícone; com texto = altura padrão + padding.
  const iconOnly = icon != null && children == null;
  return (
    <button
      {...props}
      className={cx(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
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
      className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground"
    >
      {children}
    </button>
  );
}

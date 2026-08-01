import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

type Tone = "red" | "neutral" | "solid";

const tones: Record<Tone, string> = {
  red: "bg-white/10 text-foreground",
  neutral: "bg-surface-2 text-foreground",
  solid: "bg-foreground text-background",
};

export function Avatar({
  children,
  tone = "red",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

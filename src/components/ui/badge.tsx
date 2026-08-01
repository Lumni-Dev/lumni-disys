import type { ReactNode } from "react";

export type Tone = "neutral" | "red" | "green" | "amber" | "blue";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  red: "bg-white/15 text-foreground border-white/25",
  green: "bg-white/10 text-foreground border-white/20",
  amber: "bg-white/[0.06] text-muted border-white/15",
  blue: "bg-surface-2 text-muted border-border",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

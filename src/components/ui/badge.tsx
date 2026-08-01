import type { ReactNode } from "react";

export type Tone = "neutral" | "red" | "green" | "amber" | "blue";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  red: "bg-red/10 text-red-soft border-red/30",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  blue: "bg-sky-500/10 text-sky-400 border-sky-500/30",
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
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

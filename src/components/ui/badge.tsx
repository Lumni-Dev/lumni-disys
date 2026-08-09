import type { ReactNode } from "react";

export type Tone = "neutral" | "red" | "green" | "amber" | "blue";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  red: "bg-overlay-strong text-foreground border-hairline-strong",
  green: "bg-overlay text-foreground border-hairline-strong",
  amber: "bg-overlay text-muted border-hairline",
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
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

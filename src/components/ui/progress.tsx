import { cx } from "@/lib/utils";

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "h-1.5 overflow-hidden rounded-lg bg-surface-2",
        className,
      )}
    >
      <div
        className="h-full rounded-lg bg-gradient-to-r from-red to-red-soft"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

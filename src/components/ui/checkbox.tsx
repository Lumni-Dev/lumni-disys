import { cx } from "@/lib/utils";
import { IconCheck } from "./icons";

export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer items-center gap-2 text-sm",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={cx(
          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
          checked
            ? "border-white bg-foreground text-background"
            : "border-border bg-surface-2 text-transparent",
        )}
      >
        <IconCheck className="h-3 w-3" />
      </span>
      {label && <span className="text-foreground">{label}</span>}
    </label>
  );
}

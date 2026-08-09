import Link from "next/link";
import { Sparkline } from "./sparkline";

export function StatCard({
  label,
  value,
  delta,
  href,
  data,
}: {
  label: string;
  value: string;
  delta: string;
  href: string;
  data?: number[];
}) {
  return (
    <Link
      href={href}
      className="elevated group flex flex-col overflow-hidden rounded-lg border border-hairline bg-surface transition-all duration-200 hover:border-hairline-strong"
    >
      <div className="border-b border-hairline p-2.5">
        <p className="text-xs text-muted">{label}</p>
      </div>
      <div className="p-2.5">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {data && <Sparkline data={data} className="mt-2.5" />}
      </div>
      <div className="border-t border-hairline bg-overlay-faint p-2.5 text-xs font-medium text-foreground">
        {delta}
      </div>
    </Link>
  );
}

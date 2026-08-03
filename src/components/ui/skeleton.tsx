import { cx } from "@/lib/utils";

/** Bloco de carregamento com shimmer (animate-pulse). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cx("animate-pulse rounded-lg bg-white/10", className)} />
  );
}

/** Linhas fantasmas para tabelas. Usar dentro de <Tbody>. */
export function SkeletonRows({ rows = 6, cols }: { rows?: number; cols: number }) {
  const widths = ["w-3/4", "w-1/2", "w-2/3", "w-1/3", "w-1/2"];
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="p-2.5">
              <Skeleton className={cx("h-4", widths[(r + c) % widths.length])} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

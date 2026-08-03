import { cx } from "@/lib/utils";

export function Sparkline({
  data,
  className,
  height = 34,
}: {
  data: number[];
  className?: string;
  height?: number;
}) {
  const w = 100;
  const h = 34;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return [x, y] as const;
  });

  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cx("w-full", className)}
      style={{ height }}
      aria-hidden
    >
      <path d={area} fill="var(--accent)" fillOpacity={0.15} />
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

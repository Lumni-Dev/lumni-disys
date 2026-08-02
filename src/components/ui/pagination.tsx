"use client";

import { cx, ACTIVE } from "@/lib/utils";
import { useI18n } from "@/i18n/context";

export function Pagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  const { admin } = useI18n();
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted transition-all duration-200 hover:border-white/[0.15] hover:bg-surface-2 hover:text-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
      >
        {admin.common.previous}
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPage(p)}
          className={cx(
            "h-7 min-w-7 rounded-lg border px-2 text-xs font-medium transition-all duration-200 active:scale-[0.98]",
            p === page
              ? cx("border-white", ACTIVE)
              : "border-border text-muted hover:border-white/[0.15] hover:bg-surface-2 hover:text-foreground",
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page === pageCount}
        onClick={() => onPage(page + 1)}
        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted transition-all duration-200 hover:border-white/[0.15] hover:bg-surface-2 hover:text-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
      >
        {admin.common.next}
      </button>
    </div>
  );
}

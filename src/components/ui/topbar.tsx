"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import { IconSearch, IconMenu } from "./icons";
import { useSidebar } from "@/components/sidebar-context";

export function Topbar({
  action,
  searchPlaceholder = "Buscar...",
  showSearch = true,
  searchValue,
  onSearchChange,
}: {
  action?: ReactNode;
  searchPlaceholder?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  const { setMobileOpen } = useSidebar();
  const emptyOnDesktop = !showSearch && !action;

  return (
    <header
      className={cx(
        "sticky top-0 z-10 flex items-center gap-2.5 border-b border-border bg-background/80 p-2.5 backdrop-blur",
        emptyOnDesktop && "lg:hidden",
      )}
    >
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground lg:hidden"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      {showSearch ? (
        <div className="relative max-w-md flex-1">
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-red/60 focus:ring-1 focus:ring-red/40"
          />
        </div>
      ) : (
        <div className="flex-1" />
      )}
      {action && (
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
          {action}
        </div>
      )}
    </header>
  );
}

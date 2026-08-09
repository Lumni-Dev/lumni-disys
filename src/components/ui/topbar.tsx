"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { IconSearch, IconMenu } from "./icons";
import { useSidebar } from "@/components/sidebar-context";

export function Topbar({
  action,
  searchPlaceholder,
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
  const { admin } = useI18n();
  const { setMobileOpen } = useSidebar();
  const placeholder = searchPlaceholder ?? admin.common.search;
  const emptyOnDesktop = !showSearch && !action;

  return (
    <header
      className={cx(
        "sticky top-0 z-10 flex items-center gap-2.5 border-b border-hairline bg-background/60 p-2.5 shadow-[0_1px_0_0_var(--overlay-faint)] backdrop-blur-xl",
        emptyOnDesktop && "lg:hidden",
      )}
    >
      <button
        onClick={() => setMobileOpen(true)}
        aria-label={admin.sidebar.openMenu}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-all duration-200 hover:border-hairline-strong hover:text-foreground active:scale-[0.98] lg:hidden"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      {showSearch ? (
        <div className="relative max-w-md flex-1">
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            maxLength={80}
            placeholder={placeholder}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2/70 py-1.5 pl-8 pr-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-hairline-strong"
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

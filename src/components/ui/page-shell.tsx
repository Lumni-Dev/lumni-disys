import type { ReactNode } from "react";
import { Topbar } from "./topbar";

export function PageShell({
  action,
  searchPlaceholder,
  showSearch = true,
  searchValue,
  onSearchChange,
  children,
}: {
  action?: ReactNode;
  searchPlaceholder?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <>
      <Topbar
        action={action}
        searchPlaceholder={searchPlaceholder}
        showSearch={showSearch}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />
      <div className="flex flex-col gap-2.5 p-2.5">{children}</div>
    </>
  );
}

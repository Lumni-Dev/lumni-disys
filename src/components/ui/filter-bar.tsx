import type { ReactNode } from "react";
import { Select } from "./select";

export function FilterBar({
  children,
  onClear,
  hasFilters,
}: {
  children: ReactNode;
  onClear?: () => void;
  hasFilters?: boolean;
}) {
  return (
    <div className="elevated flex flex-wrap items-center gap-2.5 rounded-lg border border-white/[0.06] bg-surface p-2.5">
      <span className="text-xs font-medium text-muted">Filtros</span>
      {children}
      {hasFilters && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="w-full sm:w-44">
      <Select
        value={value}
        onChange={onChange}
        emptyLabel={placeholder}
        options={options}
      />
    </div>
  );
}

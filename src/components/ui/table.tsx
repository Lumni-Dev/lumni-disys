import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
        {children}
      </tr>
    </thead>
  );
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="p-2.5 font-medium">{children}</th>;
}

export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="transition-colors hover:bg-surface-2/50">{children}</tr>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cx("p-2.5", className)}>{children}</td>;
}

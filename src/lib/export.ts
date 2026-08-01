export type Column<T> = { key: keyof T; label: string };

export function downloadExcel<T extends Record<string, unknown>>(
  fileName: string,
  columns: Column<T>[],
  rows: T[],
) {
  const sep = ";";
  const escape = (value: unknown) => {
    const s = String(value ?? "");
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = columns.map((c) => escape(c.label)).join(sep);
  const body = rows
    .map((r) => columns.map((c) => escape(r[c.key])).join(sep))
    .join("\n");

  const csv = `${header}\n${body}`;
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

"use client";

import { useI18n } from "@/i18n/context";
import { Button } from "./button";
import { IconDownload } from "./icons";

export function SelectionBar({
  count,
  onExport,
  onCancel,
}: {
  count: number;
  onExport: () => void;
  onCancel: () => void;
}) {
  const { admin } = useI18n();
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-muted">
        {admin.common.selectedCount(count)}
      </span>
      <Button variant="outline" onClick={onCancel}>
        {admin.common.cancel}
      </Button>
      <Button
        icon={<IconDownload className="h-4 w-4" />}
        disabled={count === 0}
        onClick={onExport}
      >
        {admin.common.export}
      </Button>
    </div>
  );
}

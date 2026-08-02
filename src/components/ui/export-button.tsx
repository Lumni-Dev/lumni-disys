"use client";

import { useI18n } from "@/i18n/context";
import { Button } from "./button";
import { Tooltip } from "./tooltip";
import { IconDownload } from "./icons";

export function ExportButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label?: string;
}) {
  const { admin } = useI18n();
  const text = label ?? admin.common.exportExcel;
  return (
    <Tooltip label={text}>
      <Button
        variant="outline"
        onClick={onClick}
        aria-label={text}
        title={text}
        icon={<IconDownload className="h-4 w-4" />}
      />
    </Tooltip>
  );
}

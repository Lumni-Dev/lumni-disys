import { Button } from "./button";
import { Tooltip } from "./tooltip";
import { IconDownload } from "./icons";

export function ExportButton({
  onClick,
  label = "Baixar Excel",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <Tooltip label={label}>
      <Button
        variant="outline"
        onClick={onClick}
        aria-label={label}
        title={label}
        icon={<IconDownload className="h-4 w-4" />}
      />
    </Tooltip>
  );
}

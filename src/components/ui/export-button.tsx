import { IconButton } from "./button";
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
      <IconButton onClick={onClick} aria-label={label}>
        <IconDownload className="h-5 w-5" />
      </IconButton>
    </Tooltip>
  );
}

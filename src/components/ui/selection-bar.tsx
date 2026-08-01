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
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-muted">
        {count} selecionado{count === 1 ? "" : "s"}
      </span>
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        icon={<IconDownload className="h-4 w-4" />}
        disabled={count === 0}
        onClick={onExport}
      >
        Exportar
      </Button>
    </div>
  );
}

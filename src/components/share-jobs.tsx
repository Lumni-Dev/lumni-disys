"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { IconShare } from "@/components/ui/icons";

export function ShareJobs() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/careers`);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        icon={<IconShare className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      >
        Compartilhar
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Compartilhar vagas publicamente"
        subtitle="Qualquer pessoa com o link pode ver e buscar as vagas abertas"
      >
        <div className="flex flex-col gap-2.5 p-2.5">
          <div className="flex gap-2.5">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
              className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm text-foreground outline-none"
            />
            <Button onClick={copy}>{copied ? "Copiado!" : "Copiar"}</Button>
          </div>
          <a
            href="/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-red-soft hover:underline"
          >
            Abrir página pública
          </a>
        </div>
      </Modal>
    </>
  );
}

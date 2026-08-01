"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { IconShare } from "@/components/ui/icons";
import { api } from "@/lib/api-client";

export function ShareJobs() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function openShare() {
    setOpen(true);
    setUrl("");
    try {
      const { token } = await api.get<{ token: string }>("/api/account");
      setUrl(`${window.location.origin}/careers/${token}`);
    } catch {
      setUrl("");
    }
  }

  async function copy() {
    if (!url) return;
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
      <Tooltip label="Compartilhar vagas">
        <Button
          variant="outline"
          aria-label="Compartilhar vagas"
          icon={<IconShare className="h-4 w-4" />}
          onClick={openShare}
        />
      </Tooltip>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Compartilhar vagas publicamente"
        subtitle="Qualquer pessoa com o link ve as vagas abertas do seu projeto"
      >
        <div className="flex flex-col gap-2.5 p-2.5">
          <div className="flex gap-2.5">
            <input
              readOnly
              value={url}
              placeholder="Gerando link..."
              onFocus={(e) => e.target.select()}
              className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm text-foreground outline-none"
            />
            <Button onClick={copy} disabled={!url}>
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground hover:underline"
            >
              Abrir pagina publica
            </a>
          )}
        </div>
      </Modal>
    </>
  );
}

"use client";

import { useRef, useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/masked-input";
import { IconCheck } from "@/components/ui/icons";
import type { Job } from "@/lib/data";

export function ApplyModal({
  job,
  onClose,
}: {
  job: Job | null;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [cv, setCv] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  function close() {
    setSent(false);
    setCv("");
    onClose();
  }

  return (
    <Modal
      open={!!job}
      onClose={close}
      title={sent ? "Candidatura enviada" : "Candidatar-se"}
      subtitle={job ? `${job.title} · ${job.company}` : ""}
    >
      {sent ? (
        <div className="flex flex-col items-center gap-2.5 p-2.5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red text-white">
            <IconCheck className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Recebemos sua candidatura!
          </p>
          <p className="text-xs text-muted">
            Boa sorte no processo seletivo. Entraremos em contato por e-mail.
          </p>
          <button
            type="button"
            onClick={close}
            className="mt-1.5 rounded-lg bg-red px-2.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-soft"
          >
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-2.5 p-2.5 sm:grid-cols-2">
            <Field label="Nome completo" full>
              <Input required placeholder="Ex.: Ana Ribeiro" />
            </Field>
            <Field label="E-mail">
              <Input type="email" required placeholder="voce@email.com" />
            </Field>
            <Field label="Telefone">
              <PhoneInput placeholder="(11) 90000-0000" />
            </Field>
            <Field label="LinkedIn / Portfólio" full>
              <Input placeholder="https://..." />
            </Field>
            <Field label="Mensagem" full>
              <Textarea
                rows={3}
                placeholder="Conte por que você é ideal para esta vaga..."
              />
            </Field>
            <Field label="Currículo" full>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-between rounded-lg border border-dashed border-border bg-surface-2 px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-red/50 hover:text-foreground"
              >
                <span className="truncate">
                  {cv || "Anexar currículo (PDF, DOC)"}
                </span>
                <span className="text-red-soft">Selecionar</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setCv(e.target.files?.[0]?.name ?? "")}
              />
            </Field>
          </div>
          <ModalFooter onCancel={close} submitLabel="Enviar candidatura" />
        </form>
      )}
    </Modal>
  );
}

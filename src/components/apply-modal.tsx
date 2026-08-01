"use client";

import { useRef, useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/masked-input";
import { IconCheck } from "@/components/ui/icons";
import { isEmail, isPhone, isUrl } from "@/lib/validation";
import type { Job } from "@/lib/data";

export function ApplyModal({
  job,
  onClose,
}: {
  job: Job | null;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [message, setMessage] = useState("");
  const [cv, setCv] = useState("");
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState(0);
  const invalid = (k: string) => (errs[k] ? attempt : 0);
  const fileRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const errors = {
      name: !name.trim(),
      email: !isEmail(email),
      phone: !isPhone(phone),
      linkedin: !isUrl(linkedin),
      message: !message.trim(),
      cv: !cv.trim(),
    };
    setErrs(errors);
    if (Object.values(errors).some(Boolean)) {
      setAttempt((a) => a + 1);
      return;
    }
    setSent(true);
  }

  function close() {
    setSent(false);
    setName("");
    setEmail("");
    setPhone("");
    setLinkedin("");
    setMessage("");
    setCv("");
    setErrs({});
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-background">
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
            className="mt-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-medium text-background transition-colors hover:bg-white"
          >
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="grid grid-cols-1 gap-2.5 p-2.5 sm:grid-cols-2">
            <Field label="Nome completo" full req>
              <Input
                invalid={invalid("name")}
                maxLength={160}
                placeholder="Ex.: Ana Ribeiro"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="E-mail" req>
              <Input
                type="email"
                invalid={invalid("email")}
                maxLength={200}
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Telefone" req>
              <PhoneInput
                invalid={invalid("phone")}
                placeholder="+55 11 99999-9999"
                value={phone}
                onChange={setPhone}
              />
            </Field>
            <Field label="LinkedIn / Portfólio" full req>
              <Input
                type="url"
                invalid={invalid("linkedin")}
                maxLength={300}
                placeholder="https://..."
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </Field>
            <Field label="Mensagem" full req>
              <Textarea
                rows={3}
                maxLength={500}
                invalid={invalid("message")}
                placeholder="Conte por que você é ideal para esta vaga..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>
            <Field label="Currículo" full req>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={invalid("cv") ? { borderColor: "var(--accent)" } : undefined}
                className="flex w-full items-center justify-between rounded-lg border border-dashed border-border bg-surface-2 px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-white/40 hover:text-foreground"
              >
                <span className="truncate">
                  {cv || "Anexar currículo (PDF, DOC)"}
                </span>
                <span className="text-foreground">Selecionar</span>
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

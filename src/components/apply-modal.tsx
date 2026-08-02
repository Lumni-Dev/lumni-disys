"use client";

import { useRef, useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/masked-input";
import { IconCheck } from "@/components/ui/icons";
import { isEmail, isPhone, isUrl } from "@/lib/validation";
import { useI18n } from "@/i18n/context";
import type { Job } from "@/lib/data";

export function ApplyModal({
  job,
  token,
  onClose,
}: {
  job: Job | null;
  token: string;
  onClose: () => void;
}) {
  const { admin } = useI18n();
  const t = admin.careers;
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [message, setMessage] = useState("");
  const [cvName, setCvName] = useState("");
  const [cvData, setCvData] = useState("");
  const [cvTooBig, setCvTooBig] = useState(false);
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState(0);
  const invalid = (k: string) => (errs[k] ? attempt : 0);
  const fileRef = useRef<HTMLInputElement>(null);

  const MAX_CV_BYTES = 2 * 1024 * 1024;

  // Le o arquivo de verdade (base64) para enviar junto com a candidatura.
  function onCvFile(file: File | undefined) {
    setCvTooBig(false);
    if (!file) return;
    if (file.size > MAX_CV_BYTES) {
      setCvName("");
      setCvData("");
      setCvTooBig(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCvName(file.name);
      setCvData(String(reader.result ?? ""));
    };
    reader.readAsDataURL(file);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errors = {
      name: !name.trim(),
      email: !isEmail(email),
      phone: !isPhone(phone),
      linkedin: !isUrl(linkedin),
      message: !message.trim(),
      cv: !cvData,
    };
    setErrs(errors);
    if (Object.values(errors).some(Boolean)) {
      setAttempt((a) => a + 1);
      return;
    }
    if (!job) return;

    setSending(true);
    setFailed(false);
    try {
      const res = await fetch("/api/public/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          jobId: job.id,
          jobTitle: job.title,
          name,
          email,
          phone,
          linkedin,
          message,
          cvName,
          cvData,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  function close() {
    setSent(false);
    setSending(false);
    setFailed(false);
    setName("");
    setEmail("");
    setPhone("");
    setLinkedin("");
    setMessage("");
    setCvName("");
    setCvData("");
    setCvTooBig(false);
    setErrs({});
    onClose();
  }

  return (
    <Modal
      open={!!job}
      onClose={close}
      title={sent ? t.sentTitle : t.apply}
      subtitle={job ? `${job.title} · ${job.company}` : ""}
    >
      {sent ? (
        <div className="flex flex-col items-center gap-2.5 p-2.5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-background">
            <IconCheck className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">{t.received}</p>
          <p className="text-xs text-muted">{t.goodLuck}</p>
          <button
            type="button"
            onClick={close}
            className="mt-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-medium text-background transition-colors hover:bg-white"
          >
            {admin.common.close}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="grid grid-cols-1 gap-2.5 p-2.5 sm:grid-cols-2">
            <Field label={t.fullName} full req>
              <Input
                invalid={invalid("name")}
                maxLength={160}
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label={t.email} req>
              <Input
                type="email"
                invalid={invalid("email")}
                maxLength={200}
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label={t.phone} req>
              <PhoneInput
                invalid={invalid("phone")}
                placeholder="+55 11 99999-9999"
                value={phone}
                onChange={setPhone}
              />
            </Field>
            <Field label={t.linkedin} full req>
              <Input
                type="url"
                invalid={invalid("linkedin")}
                maxLength={300}
                placeholder="https://..."
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </Field>
            <Field label={t.message} full req>
              <Textarea
                rows={3}
                maxLength={500}
                invalid={invalid("message")}
                placeholder={t.messagePlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>
            <Field label={t.cv} full req>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={invalid("cv") ? { borderColor: "var(--accent)" } : undefined}
                className="flex w-full items-center justify-between rounded-lg border border-dashed border-border bg-surface-2 px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-white/40 hover:text-foreground"
              >
                <span className="truncate">{cvName || t.cvAttach}</span>
                <span className="text-foreground">{t.cvSelect}</span>
              </button>
              {cvTooBig && (
                <span className="text-xs text-accent">{t.cvTooBig}</span>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => onCvFile(e.target.files?.[0])}
              />
            </Field>
          </div>
          {failed && <p className="px-2.5 text-xs text-accent">{t.sendFailed}</p>}
          <ModalFooter
            onCancel={close}
            submitLabel={sending ? t.sending : t.send}
          />
        </form>
      )}
    </Modal>
  );
}

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Select, type Option } from "@/components/ui/select";
import {
  MoneyInput,
  moneyToNumber,
  formatMoney,
} from "@/components/ui/masked-input";
import { isBlank, isEmail, isUrl, isCount } from "@/lib/validation";
import { api } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";
import type { Job, Candidate, PipelineCard } from "@/lib/data";

// Sugestoes dos campos de vinculo: titulos de vagas e candidatos da conta,
// carregados quando o modal abre.
function useJobs(open: boolean): Job[] {
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => {
    if (!open) return;
    api
      .get<Job[]>("/api/jobs")
      .then(setJobs)
      .catch(() => {});
  }, [open]);
  return jobs;
}

function useCandidates(open: boolean): Candidate[] {
  const [list, setList] = useState<Candidate[]>([]);
  useEffect(() => {
    if (!open) return;
    api
      .get<Candidate[]>("/api/candidates")
      .then(setList)
      .catch(() => {});
  }, [open]);
  return list;
}

const LEVELS = ["Estágio", "Trainee", "Júnior", "Pleno", "Sênior", "Temporário"];
const JOB_TYPES = ["Remoto", "Híbrido", "Presencial"];
const STAGES = [
  "Triagem",
  "Entrevista RH",
  "Teste técnico",
  "Entrevista final",
  "Proposta",
];

// Mantem o valor canonico PT (usado na logica/API) e traduz apenas o rotulo.
function localizedOptions(
  values: string[],
  labels: Record<string, string>,
): Option[] {
  return values.map((v) => ({ value: v, label: labels[v] ?? v }));
}

function FormModal({
  open,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  secondaryAction,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => boolean | Promise<boolean>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  const { admin } = useI18n();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  // Fecha so quando o save conclui; se falhar, mantem aberto e avisa.
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      if (await onSubmit()) onClose();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle}>
      <form onSubmit={submit} noValidate>
        <div className="grid grid-cols-1 gap-2.5 p-2.5 sm:grid-cols-2">
          {children}
        </div>
        {error && (
          <p className="px-2.5 pb-1 text-xs text-red-400">
            {admin.common.saveError}
          </p>
        )}
        <ModalFooter onCancel={onClose} secondaryAction={secondaryAction} />
      </form>
    </Modal>
  );
}

function useValidation() {
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState(0);
  function run(errors: Record<string, boolean>): boolean {
    setErrs(errors);
    if (Object.values(errors).some(Boolean)) {
      setAttempt((a) => a + 1);
      return false;
    }
    return true;
  }
  const invalid = (key: string) => (errs[key] ? attempt : 0);
  const hasError = (key: string) => !!errs[key];
  return { run, invalid, hasError };
}

export function JobModal({
  open,
  onClose,
  onSave,
  job,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (j: Job) => void;
  job?: Job | null;
}) {
  const [title, setTitle] = useState(job?.title ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [level, setLevel] = useState(job?.level ?? "");
  const [type, setType] = useState(job?.type ?? "");
  const [openings, setOpenings] = useState(String(job?.openings ?? ""));
  const [status, setStatus] = useState<string>(job?.status ?? "");
  const [salaryFrom, setSalaryFrom] = useState(
    job?.salaryFrom ? formatMoney(String(job.salaryFrom)) : "",
  );
  const [salaryTo, setSalaryTo] = useState(
    job?.salaryTo ? formatMoney(String(job.salaryTo)) : "",
  );
  const { run, invalid, hasError } = useValidation();
  const { admin } = useI18n();
  const t = admin.modals.job;

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={job ? t.editTitle : t.newTitle}
      subtitle={job ? t.editSubtitle : t.newSubtitle}
      onSubmit={async () => {
        const from = moneyToNumber(salaryFrom);
        const to = moneyToNumber(salaryTo);
        const order = from > 0 && to > 0 && from > to;
        const ok = run({
          title: isBlank(title),
          level: isBlank(level),
          type: isBlank(type),
          openings: !isCount(openings),
          status: isBlank(status),
          salaryFrom: isBlank(salaryFrom),
          salaryTo: isBlank(salaryTo),
          salaryOrder: order,
        });
        if (!ok) return false;
        await onSave({
          id: job?.id ?? 0,
          title: title.trim(),
          // A empresa e o proprio workspace: o servidor preenche o nome.
          company: job?.company ?? "",
          description: description.trim(),
          level,
          type,
          openings: Number(openings) || 0,
          // Faixa salarial gravada em centavos.
          salaryFrom: Math.round(from * 100),
          salaryTo: Math.round(to * 100),
          // O total de candidatos e um contador automatico, nao editavel.
          applicants: job?.applicants ?? 0,
          status: status as Job["status"],
        });
        return true;
      }}
    >
      <Field label={t.title} full req>
        <Input
          invalid={invalid("title")}
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <Field label={t.description} full>
        <Textarea
          rows={5}
          maxLength={5000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <Field label={t.level} req>
        <Select
          value={level}
          onChange={setLevel}
          options={localizedOptions(LEVELS, admin.levels)}
          emptyLabel={admin.modals.select}
          invalid={invalid("level")}
        />
      </Field>
      <Field label={t.type} req>
        <Select
          value={type}
          onChange={setType}
          options={localizedOptions(JOB_TYPES, admin.jobTypes)}
          emptyLabel={admin.modals.select}
          invalid={invalid("type")}
        />
      </Field>
      <Field label={t.openings} req>
        <Input
          inputMode="numeric"
          maxLength={5}
          invalid={invalid("openings")}
          value={openings}
          onChange={(e) => setOpenings(e.target.value.replace(/\D/g, ""))}
        />
      </Field>
      <Field label={t.status} req>
        <Select
          value={status}
          onChange={setStatus}
          options={localizedOptions(
            ["Aberta", "Em análise", "Fechada"],
            admin.status,
          )}
          emptyLabel={admin.modals.select}
          invalid={invalid("status")}
        />
      </Field>
      <Field label={t.salaryRange} full req>
        <div className="grid grid-cols-2 gap-2.5">
          <MoneyInput
            invalid={invalid("salaryFrom") || invalid("salaryOrder")}
            placeholder={t.salaryFrom}
            value={salaryFrom}
            onChange={setSalaryFrom}
          />
          <MoneyInput
            invalid={invalid("salaryTo") || invalid("salaryOrder")}
            placeholder={t.salaryTo}
            value={salaryTo}
            onChange={setSalaryTo}
          />
        </div>
      </Field>
      {hasError("salaryOrder") && (
        <p className="-mt-1 text-xs text-accent sm:col-span-2">
          {t.salaryOrderError}
        </p>
      )}
    </FormModal>
  );
}

export function CandidateModal({
  open,
  onClose,
  onSave,
  candidate,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (c: Candidate) => void;
  candidate?: Candidate | null;
}) {
  const [name, setName] = useState(candidate?.name ?? "");
  const [email, setEmail] = useState(candidate?.email ?? "");
  const [jobId, setJobId] = useState<string>(
    candidate?.jobId ? String(candidate.jobId) : "",
  );
  const [linkedin, setLinkedin] = useState(candidate?.linkedin ?? "");
  // Curriculo obrigatorio: na edicao o arquivo atual vale, e da para trocar.
  const [cvName, setCvName] = useState(candidate?.cvName ?? "");
  const [cvData, setCvData] = useState("");
  const [cvTooBig, setCvTooBig] = useState(false);
  const cvRef = useRef<HTMLInputElement>(null);
  const hasCv = Boolean(cvData || candidate?.hasCv);
  const { run, invalid } = useValidation();
  const { admin } = useI18n();
  const t = admin.modals.candidate;
  // Vaga pretendida vinculada por ID: seleciona uma vaga cadastrada.
  const jobs = useJobs(open);

  function onCvFile(file: File | undefined) {
    setCvTooBig(false);
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setCvName(candidate?.cvName ?? "");
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

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={candidate ? t.editTitle : t.newTitle}
      subtitle={candidate ? t.editSubtitle : t.newSubtitle}
      onSubmit={async () => {
        const ok = run({
          name: isBlank(name),
          email: !isEmail(email),
          role: isBlank(jobId),
          linkedin: !isUrl(linkedin),
          cv: !hasCv,
        });
        if (!ok) return false;
        await onSave({
          id: candidate?.id ?? 0,
          name: name.trim(),
          email: email.trim(),
          // Vinculo por ID; o titulo vai junto so como rotulo (o servidor o
          // rederiva a partir do jobId).
          jobId: Number(jobId) || null,
          role:
            jobs.find((j) => String(j.id) === jobId)?.title ??
            candidate?.role ??
            "",
          // A etapa e gerenciada na pagina de Processos; aqui preserva a atual
          // (ou "Triagem" no cadastro).
          stage: (candidate?.stage ?? "Triagem") as Candidate["stage"],
          // A data real vem do servidor (updatedAt); este valor e ignorado.
          modifiedAt: candidate?.modifiedAt ?? "",
          linkedin: linkedin.trim(),
          cvName,
          cvData,
        });
        return true;
      }}
    >
      <Field label={t.fullName} full req>
        <Input
          invalid={invalid("name")}
          maxLength={160}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label={t.email} full req>
        <Input
          type="email"
          invalid={invalid("email")}
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label={t.desiredRole} full req>
        <Select
          invalid={invalid("role")}
          value={jobId}
          onChange={setJobId}
          options={jobs.map((j) => ({ value: String(j.id), label: j.title }))}
          emptyLabel={admin.modals.select}
        />
      </Field>
      <p className="rounded-lg border border-dashed border-border bg-surface-2/40 px-2.5 py-2 text-center text-xs text-muted sm:col-span-2">
        {t.jobHint}{" "}
        <Link href="/jobs" className="font-medium text-accent hover:underline">
          {t.jobHintLink}
        </Link>
      </p>
      <Field label={t.linkedin} full req>
        <Input
          type="url"
          invalid={invalid("linkedin")}
          maxLength={300}
          placeholder={t.linkedinPlaceholder}
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
        />
      </Field>
      <Field label={admin.careers.cv} full req>
        <button
          type="button"
          onClick={() => cvRef.current?.click()}
          style={invalid("cv") ? { borderColor: "var(--accent)" } : undefined}
          className="flex w-full items-center justify-between rounded-lg border border-dashed border-border bg-surface-2 px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-white/40 hover:text-foreground"
        >
          <span className="truncate">{cvName || admin.careers.cvAttach}</span>
          <span className="text-foreground">{admin.careers.cvSelect}</span>
        </button>
        {cvTooBig && (
          <span className="text-xs text-accent">{admin.careers.cvTooBig}</span>
        )}
        <input
          ref={cvRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => onCvFile(e.target.files?.[0])}
        />
      </Field>
    </FormModal>
  );
}

export function ProcessModal({
  open,
  onClose,
  onSave,
  onDelete,
  card,
  currentStage,
  stages = STAGES,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (card: PipelineCard, stage: string) => void;
  onDelete?: (id: number) => void;
  card?: PipelineCard | null;
  currentStage?: string;
  stages?: string[];
}) {
  const [candidateId, setCandidateId] = useState<string>(
    card?.candidateId ? String(card.candidateId) : "",
  );
  const [stage, setStage] = useState(currentStage ?? "");
  const { run, invalid } = useValidation();
  const { admin } = useI18n();
  const t = admin.modals.process;
  const candidates = useCandidates(open);
  const jobs = useJobs(open);

  const editing = Boolean(card);
  // Candidato escolhido (novo) ou o do card (edicao). A vaga e a empresa sao
  // derivadas da vaga pretendida do candidato (por ID) — somente exibicao.
  const selected = candidates.find((c) => String(c.id) === candidateId);
  const derivedJob = selected?.jobId
    ? jobs.find((j) => j.id === selected.jobId)
    : undefined;
  const nameLabel = editing ? (card?.name ?? "") : (selected?.name ?? "");
  const jobLabel = editing ? (card?.job ?? "") : (derivedJob?.title ?? "");
  const companyLabel = editing
    ? (card?.company ?? "")
    : (derivedJob?.company ?? "");

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={card ? t.editTitle : t.newTitle}
      subtitle={card ? t.editSubtitle : t.newSubtitle}
      secondaryAction={
        card && onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-red-400 transition-all duration-200 hover:border-red-400/40 hover:bg-red-500/10 active:scale-[0.98]"
          >
            {t.remove}
          </button>
        ) : undefined
      }
      onSubmit={async () => {
        const ok = run({
          name: editing ? false : isBlank(candidateId),
          stage: isBlank(stage),
        });
        if (!ok) return false;
        await onSave(
          {
            id: card?.id ?? 0,
            candidateId: editing
              ? (card?.candidateId ?? null)
              : Number(candidateId) || null,
            name: nameLabel,
            job: jobLabel,
            company: companyLabel,
          },
          stage,
        );
        return true;
      }}
    >
      <Field label={t.candidate} full req>
        {editing ? (
          <p className="truncate rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm text-foreground">
            {nameLabel || "—"}
          </p>
        ) : (
          <Select
            invalid={invalid("name")}
            value={candidateId}
            onChange={(v) => {
              setCandidateId(v);
              const c = candidates.find((x) => String(x.id) === v);
              // Default: etapa atual do candidato, se for uma etapa valida
              // (candidato fora do processo tem "-", entao cai em Triagem).
              if (c && isBlank(stage))
                setStage(stages.includes(c.stage) ? c.stage : "Triagem");
            }}
            options={candidates.map((c) => ({
              value: String(c.id),
              label: c.name,
            }))}
            emptyLabel={admin.modals.select}
          />
        )}
      </Field>
      <Field label={t.job}>
        <p className="truncate rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm text-muted">
          {jobLabel || "—"}
        </p>
      </Field>
      <Field label={t.company}>
        <p className="truncate rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm text-muted">
          {companyLabel || "—"}
        </p>
      </Field>
      <Field label={t.stage} full req>
        <Select
          value={stage}
          onChange={setStage}
          options={localizedOptions(stages, admin.stages)}
          emptyLabel={admin.modals.select}
          invalid={invalid("stage")}
        />
      </Field>
    </FormModal>
  );
}

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Select, type Option } from "@/components/ui/select";
import {
  CnpjInput,
  MoneyInput,
  moneyToNumber,
  formatMoney,
} from "@/components/ui/masked-input";
import { isBlank, isEmail, isUrl, isCnpj, isCount } from "@/lib/validation";
import { fetchCountries, fetchStates, fetchCities, type UF } from "@/lib/ibge";
import { fetchCnpj, sameCity } from "@/lib/cnpj";
import { api } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";
import type { Company, Job, Candidate, PipelineCard } from "@/lib/data";

// Sugestoes dos campos de vinculo: nomes de empresas, titulos de vagas e
// candidatos da conta, carregados quando o modal abre.
// Empresas da conta (id + nome) para o vinculo por ID no modal de vaga.
function useCompanies(open: boolean): Company[] {
  const [rows, setRows] = useState<Company[]>([]);
  useEffect(() => {
    if (!open) return;
    api
      .get<Company[]>("/api/companies")
      .then(setRows)
      .catch(() => {});
  }, [open]);
  return rows;
}

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
  onSubmit: () => boolean;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  function submit(e: FormEvent) {
    e.preventDefault();
    if (onSubmit()) onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle}>
      <form onSubmit={submit} noValidate>
        <div className="grid grid-cols-1 gap-2.5 p-2.5 sm:grid-cols-2">
          {children}
        </div>
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

export function CompanyModal({
  open,
  onClose,
  onSave,
  company,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (c: Company) => void;
  company?: Company | null;
}) {
  const loc = company?.location ?? "";
  const [name, setName] = useState(company?.name ?? "");
  const [sector, setSector] = useState(company?.sector ?? "");
  const [country, setCountry] = useState("Brasil");
  const [cnpj, setCnpj] = useState(company?.cnpj ?? "");
  const [taxId, setTaxId] = useState("");
  const [uf, setUf] = useState(loc.includes(" - ") ? loc.split(" - ")[1] : "");
  const [city, setCity] = useState(loc.includes(" - ") ? loc.split(" - ")[0] : "");
  const [stateText, setStateText] = useState("");
  const [cityText, setCityText] = useState("");
  const [status, setStatus] = useState<string>(company?.status ?? "");
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<UF[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const lastCnpj = useRef(""); // ultimo CNPJ resolvido com sucesso
  const fetchingCnpj = useRef(""); // CNPJ em busca agora (evita chamada dupla)
  const { run, invalid } = useValidation();
  const { admin } = useI18n();
  const t = admin.modals.company;

  const isBrazil = country === "Brasil";

  useEffect(() => {
    fetchCountries().then(setCountries);
    fetchStates().then(setStates);
  }, []);
  useEffect(() => {
    fetchCities(uf).then(setCities);
  }, [uf]);

  function changeCountry(v: string) {
    setCountry(v);
    // Troca de país zera a localização e o documento fiscal.
    setCnpj("");
    setTaxId("");
    setUf("");
    setCity("");
    setStateText("");
    setCityText("");
    lastCnpj.current = "";
  }

  // Busca os dados do CNPJ na BrasilAPI e preenche os demais campos —
  // nome, setor, pais, estado, cidade e o status padrao. So marca o CNPJ
  // como resolvido em caso de sucesso: uma falha transitoria pode ser
  // refeita no proximo change/blur.
  async function lookupCnpj(v: string) {
    const digits = v.replace(/\D/g, "");
    if (digits.length !== 14) return;
    if (digits === lastCnpj.current || digits === fetchingCnpj.current) return;
    fetchingCnpj.current = digits;
    setCnpjLoading(true);
    const info = await fetchCnpj(digits);
    setCnpjLoading(false);
    fetchingCnpj.current = "";
    if (!info) return;
    lastCnpj.current = digits;
    setCountry("Brasil");
    if (info.name) setName(info.name);
    if (info.sector) setSector(info.sector);
    if (info.uf) {
      setUf(info.uf);
      const list = await fetchCities(info.uf);
      setCity(list.find((c) => sameCity(c, info.city)) ?? "");
    }
    // Vagas em aberto nao vem do CNPJ; status assume a situacao cadastral,
    // sem sobrescrever uma escolha ja feita.
    setStatus((cur) => cur || (info.active ? "Ativa" : "Pausada"));
  }

  // Dispara a busca a cada digitacao (quando completa) e ao sair do campo.
  function changeCnpj(v: string) {
    setCnpj(v);
    void lookupCnpj(v);
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={company ? t.editTitle : t.newTitle}
      subtitle={company ? t.editSubtitle : t.newSubtitle}
      onSubmit={() => {
        const ok = run({
          name: isBlank(name),
          sector: isBlank(sector),
          country: isBlank(country),
          status: isBlank(status),
          ...(isBrazil
            ? { cnpj: !isCnpj(cnpj), uf: isBlank(uf), city: isBlank(city) }
            : {
                taxId: isBlank(taxId),
                stateText: isBlank(stateText),
                cityText: isBlank(cityText),
              }),
        });
        if (!ok) return false;
        const location = isBrazil
          ? `${city} - ${uf}`
          : `${cityText.trim()} - ${stateText.trim()} (${country})`;
        onSave({
          id: company?.id ?? 0,
          name: name.trim(),
          // CNPJ (Brasil) ou documento fiscal (exterior), gravado no banco.
          cnpj: (isBrazil ? cnpj : taxId).trim(),
          sector: sector.trim(),
          location,
          // openings e calculado no servidor a partir das vagas; o valor
          // enviado e ignorado (mantido so para o tipo Company).
          openings: company?.openings ?? 0,
          status: status as Company["status"],
        });
        return true;
      }}
    >
      {/* CNPJ primeiro: ao localizar, preenche nome, setor, UF, cidade e status. */}
      {isBrazil ? (
        <Field label={t.cnpj} full req>
          <CnpjInput
            invalid={invalid("cnpj")}
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={changeCnpj}
            onBlur={() => void lookupCnpj(cnpj)}
          />
          {cnpjLoading && (
            <span className="text-xs text-muted">{t.cnpjLookup}</span>
          )}
        </Field>
      ) : (
        <Field label={t.taxId} full req>
          <Input
            invalid={invalid("taxId")}
            maxLength={40}
            placeholder={t.taxIdPlaceholder}
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
          />
        </Field>
      )}

      <Field label={t.name} full req>
        <Input
          invalid={invalid("name")}
          maxLength={160}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label={t.country} req>
        <Select
          value={country}
          onChange={changeCountry}
          options={countries}
          emptyLabel={admin.modals.select}
          invalid={invalid("country")}
        />
      </Field>
      <Field label={t.sector} req>
        <Input
          invalid={invalid("sector")}
          maxLength={120}
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        />
      </Field>

      {isBrazil ? (
        <>
          <Field label={t.state} req>
            <Select
              value={uf}
              onChange={(v) => {
                setUf(v);
                setCity("");
              }}
              options={states.map((s) => ({ value: s.sigla, label: s.nome }))}
              emptyLabel={admin.modals.select}
              invalid={invalid("uf")}
            />
          </Field>
          <Field label={t.city} req>
            <Select
              value={city}
              onChange={setCity}
              options={cities}
              disabled={!uf}
              placeholder={uf ? t.selectCity : t.selectStateFirst}
              invalid={invalid("city")}
            />
          </Field>
        </>
      ) : (
        <>
          <Field label={t.stateProvince} req>
            <Input
              invalid={invalid("stateText")}
              maxLength={120}
              value={stateText}
              onChange={(e) => setStateText(e.target.value)}
            />
          </Field>
          <Field label={t.city} req>
            <Input
              invalid={invalid("cityText")}
              maxLength={120}
              value={cityText}
              onChange={(e) => setCityText(e.target.value)}
            />
          </Field>
        </>
      )}

      <Field label={t.status} req>
        <Select
          value={status}
          onChange={setStatus}
          options={localizedOptions(["Ativa", "Pausada"], admin.status)}
          emptyLabel={admin.modals.select}
          invalid={invalid("status")}
        />
      </Field>
    </FormModal>
  );
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
  const [companyId, setCompanyId] = useState<string>(
    job?.companyId ? String(job.companyId) : "",
  );
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
  const companies = useCompanies(open);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={job ? t.editTitle : t.newTitle}
      subtitle={job ? t.editSubtitle : t.newSubtitle}
      onSubmit={() => {
        const from = moneyToNumber(salaryFrom);
        const to = moneyToNumber(salaryTo);
        const order = from > 0 && to > 0 && from > to;
        const ok = run({
          title: isBlank(title),
          company: isBlank(companyId),
          level: isBlank(level),
          type: isBlank(type),
          openings: !isCount(openings),
          status: isBlank(status),
          salaryFrom: isBlank(salaryFrom),
          salaryTo: isBlank(salaryTo),
          salaryOrder: order,
        });
        if (!ok) return false;
        onSave({
          id: job?.id ?? 0,
          title: title.trim(),
          // Vinculo por ID; o nome vai junto so como rotulo (o servidor o
          // rederiva a partir do companyId).
          companyId: Number(companyId) || null,
          company:
            companies.find((c) => String(c.id) === companyId)?.name ??
            job?.company ??
            "",
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
      <Field label={t.company} full req>
        <Select
          invalid={invalid("company")}
          value={companyId}
          onChange={setCompanyId}
          options={companies.map((c) => ({
            value: String(c.id),
            label: c.name,
          }))}
          emptyLabel={admin.modals.select}
        />
      </Field>
      <p className="rounded-lg border border-dashed border-border bg-surface-2/40 px-2.5 py-2 text-center text-xs text-muted sm:col-span-2">
        {t.companyHint}{" "}
        <Link
          href="/companies"
          className="font-medium text-accent hover:underline"
        >
          {t.companyHintLink}
        </Link>
      </p>
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
      onSubmit={() => {
        const ok = run({
          name: isBlank(name),
          email: !isEmail(email),
          role: isBlank(jobId),
          linkedin: !isUrl(linkedin),
          cv: !hasCv,
        });
        if (!ok) return false;
        onSave({
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
            {t.remove ?? "Remover do processo"}
          </button>
        ) : undefined
      }
      onSubmit={() => {
        const ok = run({
          name: editing ? false : isBlank(candidateId),
          stage: isBlank(stage),
        });
        if (!ok) return false;
        onSave(
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

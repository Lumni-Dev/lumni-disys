"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Select, type Option } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { CnpjInput, MoneyInput, moneyToNumber } from "@/components/ui/masked-input";
import { isBlank, isEmail, isUrl, isCnpj, isCount } from "@/lib/validation";
import { fetchCountries, fetchStates, fetchCities, type UF } from "@/lib/ibge";
import { fetchCnpj, sameCity } from "@/lib/cnpj";
import { api } from "@/lib/api-client";
import { useI18n } from "@/i18n/context";
import type { Company, Job, Candidate, PipelineCard } from "@/lib/data";

// Sugestoes dos campos de vinculo: nomes de empresas, titulos de vagas e
// candidatos da conta, carregados quando o modal abre.
function useCompanyNames(open: boolean): string[] {
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    if (!open) return;
    api
      .get<Company[]>("/api/companies")
      .then((rows) => setNames(rows.map((c) => c.name)))
      .catch(() => {});
  }, [open]);
  return names;
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
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => boolean;
  title: string;
  subtitle: string;
  children: React.ReactNode;
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
        <ModalFooter onCancel={onClose} />
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
  const [cnpj, setCnpj] = useState("");
  const [taxId, setTaxId] = useState("");
  const [uf, setUf] = useState(loc.includes(" - ") ? loc.split(" - ")[1] : "");
  const [city, setCity] = useState(loc.includes(" - ") ? loc.split(" - ")[0] : "");
  const [stateText, setStateText] = useState("");
  const [cityText, setCityText] = useState("");
  const [openings, setOpenings] = useState(String(company?.openings ?? ""));
  const [status, setStatus] = useState<string>(company?.status ?? "");
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<UF[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const lastCnpj = useRef("");
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

  // CNPJ completo: busca na BrasilAPI e preenche pais, estado e cidade
  // (e o nome, se ainda estiver em branco).
  async function changeCnpj(v: string) {
    setCnpj(v);
    const digits = v.replace(/\D/g, "");
    if (digits.length !== 14 || digits === lastCnpj.current) return;
    lastCnpj.current = digits;
    setCnpjLoading(true);
    const info = await fetchCnpj(digits);
    setCnpjLoading(false);
    if (!info) return;
    setCountry("Brasil");
    if (info.uf) {
      setUf(info.uf);
      const list = await fetchCities(info.uf);
      setCity(list.find((c) => sameCity(c, info.city)) ?? "");
    }
    if (info.name) setName((cur) => (cur.trim() ? cur : info.name));
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
          openings: !isCount(openings),
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
          sector: sector.trim(),
          location,
          openings: Number(openings) || 0,
          status: status as Company["status"],
        });
        return true;
      }}
    >
      <Field label={t.name} full req>
        <Input
          invalid={invalid("name")}
          maxLength={160}
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        <Field label={t.cnpj} req>
          <CnpjInput
            invalid={invalid("cnpj")}
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={changeCnpj}
          />
          {cnpjLoading && (
            <span className="text-xs text-muted">{t.cnpjLookup}</span>
          )}
        </Field>
      ) : (
        <Field label={t.taxId} req>
          <Input
            invalid={invalid("taxId")}
            maxLength={40}
            placeholder={t.taxIdPlaceholder}
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
          />
        </Field>
      )}

      <Field label={t.country} req>
        <Select
          value={country}
          onChange={changeCountry}
          options={countries}
          emptyLabel={admin.modals.select}
          invalid={invalid("country")}
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
  const [company, setCompany] = useState(job?.company ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [level, setLevel] = useState(job?.level ?? "");
  const [type, setType] = useState(job?.type ?? "");
  const [openings, setOpenings] = useState(String(job?.openings ?? ""));
  const [status, setStatus] = useState<string>(job?.status ?? "");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const { run, invalid, hasError } = useValidation();
  const { admin } = useI18n();
  const t = admin.modals.job;
  const companyNames = useCompanyNames(open);

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
          company: isBlank(company),
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
          company: company.trim(),
          description: description.trim(),
          level,
          type,
          openings: Number(openings) || 0,
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
        <Combobox
          invalid={invalid("company")}
          maxLength={160}
          value={company}
          onChange={setCompany}
          options={companyNames}
          placeholder={admin.modals.searchOrType}
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
  const [role, setRole] = useState(candidate?.role ?? "");
  const [linkedin, setLinkedin] = useState(candidate?.linkedin ?? "");
  const [stage, setStage] = useState<string>(candidate?.stage ?? "");
  const { run, invalid } = useValidation();
  const { admin } = useI18n();
  const t = admin.modals.candidate;
  // Sugere os titulos das vagas cadastradas para facilitar o vinculo
  // candidato -> vaga (valor livre continua permitido).
  const jobs = useJobs(open);
  const jobTitles = [...new Set(jobs.map((j) => j.title))];

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
          role: isBlank(role),
          linkedin: !isUrl(linkedin),
          stage: isBlank(stage),
        });
        if (!ok) return false;
        onSave({
          id: candidate?.id ?? 0,
          name: name.trim(),
          email: email.trim(),
          role: role.trim(),
          stage: stage as Candidate["stage"],
          // A data real vem do servidor (updatedAt); este valor e ignorado.
          modifiedAt: candidate?.modifiedAt ?? "",
          linkedin: linkedin.trim(),
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
      <Field label={t.email} req>
        <Input
          type="email"
          invalid={invalid("email")}
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label={t.desiredRole} req>
        <Combobox
          invalid={invalid("role")}
          maxLength={160}
          value={role}
          onChange={setRole}
          options={jobTitles}
          placeholder={admin.modals.searchOrType}
        />
      </Field>
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
      <Field label={t.stage} full req>
        <Select
          value={stage}
          onChange={setStage}
          options={localizedOptions(STAGES, admin.stages)}
          emptyLabel={admin.modals.select}
          invalid={invalid("stage")}
        />
      </Field>
    </FormModal>
  );
}

export function ProcessModal({
  open,
  onClose,
  onSave,
  card,
  currentStage,
  stages = STAGES,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (card: PipelineCard, stage: string) => void;
  card?: PipelineCard | null;
  currentStage?: string;
  stages?: string[];
}) {
  const [name, setName] = useState(card?.name ?? "");
  const [job, setJob] = useState(card?.job ?? "");
  const [company, setCompany] = useState(card?.company ?? "");
  const [stage, setStage] = useState(currentStage ?? "");
  const { run, invalid } = useValidation();
  const { admin } = useI18n();
  const t = admin.modals.process;
  const candidates = useCandidates(open);
  const jobs = useJobs(open);
  const companyNames = useCompanyNames(open);
  const jobTitles = [...new Set(jobs.map((j) => j.title))];

  // Escolher um candidato preenche o que estiver em branco: etapa atual dele
  // e, se o cargo pretendido bater com uma vaga, a vaga e a empresa.
  function pickCandidate(v: string) {
    const c = candidates.find((x) => x.name === v);
    if (!c) return;
    if (!card && isBlank(stage)) setStage(c.stage);
    if (isBlank(job) && c.role) {
      const j = jobs.find((x) => x.title === c.role);
      if (j) {
        setJob(j.title);
        if (isBlank(company)) setCompany(j.company);
      }
    }
  }

  // Escolher uma vaga sempre traz a empresa dela junto.
  function pickJob(v: string) {
    const j = jobs.find((x) => x.title === v);
    if (j?.company) setCompany(j.company);
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={card ? t.editTitle : t.newTitle}
      subtitle={card ? t.editSubtitle : t.newSubtitle}
      onSubmit={() => {
        const ok = run({
          name: isBlank(name),
          job: isBlank(job),
          company: isBlank(company),
          stage: isBlank(stage),
        });
        if (!ok) return false;
        onSave(
          {
            id: card?.id ?? 0,
            name: name.trim(),
            job: job.trim(),
            company: company.trim(),
          },
          stage,
        );
        return true;
      }}
    >
      <Field label={t.candidate} full req>
        <Combobox
          invalid={invalid("name")}
          maxLength={160}
          value={name}
          onChange={setName}
          onPick={pickCandidate}
          options={candidates.map((c) => c.name)}
          placeholder={admin.modals.searchOrType}
        />
      </Field>
      <Field label={t.job} req>
        <Combobox
          invalid={invalid("job")}
          maxLength={200}
          value={job}
          onChange={setJob}
          onPick={pickJob}
          options={jobTitles}
          placeholder={admin.modals.searchOrType}
        />
      </Field>
      <Field label={t.company} req>
        <Combobox
          invalid={invalid("company")}
          maxLength={160}
          value={company}
          onChange={setCompany}
          options={companyNames}
          placeholder={admin.modals.searchOrType}
        />
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

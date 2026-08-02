"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { Select, type Option } from "@/components/ui/select";
import { CnpjInput, MoneyInput, moneyToNumber } from "@/components/ui/masked-input";
import { isBlank, isEmail, isUrl, isCnpj, isCount } from "@/lib/validation";
import { fetchCountries, fetchStates, fetchCities, type UF } from "@/lib/ibge";
import { useI18n } from "@/i18n/context";
import type { Company, Job, Candidate, PipelineCard } from "@/lib/data";

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
          <Field label={t.cnpj} req>
            <CnpjInput
              invalid={invalid("cnpj")}
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={setCnpj}
            />
          </Field>
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
          <Field label={t.taxId} req>
            <Input
              invalid={invalid("taxId")}
              maxLength={40}
              placeholder={t.taxIdPlaceholder}
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
          </Field>
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
  const [level, setLevel] = useState(job?.level ?? "");
  const [type, setType] = useState(job?.type ?? "");
  const [applicants, setApplicants] = useState(String(job?.applicants ?? ""));
  const [status, setStatus] = useState<string>(job?.status ?? "");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const { run, invalid, hasError } = useValidation();
  const { admin } = useI18n();
  const t = admin.modals.job;

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
          applicants: !isCount(applicants),
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
          level,
          type,
          applicants: Number(applicants) || 0,
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
        <Input
          invalid={invalid("company")}
          maxLength={160}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
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
      <Field label={t.applicants} req>
        <Input
          inputMode="numeric"
          maxLength={5}
          invalid={invalid("applicants")}
          value={applicants}
          onChange={(e) => setApplicants(e.target.value.replace(/\D/g, ""))}
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
          modifiedAt: "01/08/2026",
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
        <Input
          invalid={invalid("role")}
          maxLength={160}
          value={role}
          onChange={(e) => setRole(e.target.value)}
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
        <Input
          invalid={invalid("name")}
          maxLength={160}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label={t.job} req>
        <Input
          invalid={invalid("job")}
          maxLength={200}
          value={job}
          onChange={(e) => setJob(e.target.value)}
        />
      </Field>
      <Field label={t.company} req>
        <Input
          invalid={invalid("company")}
          maxLength={160}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
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

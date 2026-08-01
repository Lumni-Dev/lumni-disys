"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { CnpjInput, MoneyInput, moneyToNumber } from "@/components/ui/masked-input";
import { isBlank, isEmail, isUrl, isCnpj, isCount } from "@/lib/validation";
import { fetchCountries, fetchStates, fetchCities, type UF } from "@/lib/ibge";
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
      title={company ? "Editar empresa" : "Nova empresa"}
      subtitle={
        company ? "Atualize os dados da empresa" : "Cadastre uma empresa parceira"
      }
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
      <Field label="Nome da empresa" full req>
        <Input
          invalid={invalid("name")}
          maxLength={160}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="Setor" req>
        <Input
          invalid={invalid("sector")}
          maxLength={120}
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        />
      </Field>
      <Field label="País" req>
        <Select
          value={country}
          onChange={changeCountry}
          options={countries}
          emptyLabel="Selecionar"
          invalid={invalid("country")}
        />
      </Field>

      {isBrazil ? (
        <>
          <Field label="CNPJ" req>
            <CnpjInput
              invalid={invalid("cnpj")}
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={setCnpj}
            />
          </Field>
          <Field label="Estado" req>
            <Select
              value={uf}
              onChange={(v) => {
                setUf(v);
                setCity("");
              }}
              options={states.map((s) => ({ value: s.sigla, label: s.nome }))}
              emptyLabel="Selecionar"
              invalid={invalid("uf")}
            />
          </Field>
          <Field label="Cidade" req>
            <Select
              value={city}
              onChange={setCity}
              options={cities}
              disabled={!uf}
              placeholder={uf ? "Selecione a cidade" : "Escolha o estado antes"}
              invalid={invalid("city")}
            />
          </Field>
        </>
      ) : (
        <>
          <Field label="Registro fiscal" req>
            <Input
              invalid={invalid("taxId")}
              maxLength={40}
              placeholder="Tax ID / VAT / EIN…"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
          </Field>
          <Field label="Estado / Província" req>
            <Input
              invalid={invalid("stateText")}
              maxLength={120}
              value={stateText}
              onChange={(e) => setStateText(e.target.value)}
            />
          </Field>
          <Field label="Cidade" req>
            <Input
              invalid={invalid("cityText")}
              maxLength={120}
              value={cityText}
              onChange={(e) => setCityText(e.target.value)}
            />
          </Field>
        </>
      )}

      <Field label="Vagas abertas" req>
        <Input
          inputMode="numeric"
          maxLength={5}
          invalid={invalid("openings")}
          value={openings}
          onChange={(e) => setOpenings(e.target.value.replace(/\D/g, ""))}
        />
      </Field>
      <Field label="Status" req>
        <Select
          value={status}
          onChange={setStatus}
          options={["Ativa", "Pausada"]}
          emptyLabel="Selecionar"
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

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={job ? "Editar vaga" : "Nova vaga"}
      subtitle={job ? "Atualize os dados da vaga" : "Publique uma nova posição"}
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
      <Field label="Título da vaga" full req>
        <Input
          invalid={invalid("title")}
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <Field label="Empresa" full req>
        <Input
          invalid={invalid("company")}
          maxLength={160}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </Field>
      <Field label="Nível" req>
        <Select
          value={level}
          onChange={setLevel}
          options={LEVELS}
          emptyLabel="Selecionar"
          invalid={invalid("level")}
        />
      </Field>
      <Field label="Modalidade" req>
        <Select
          value={type}
          onChange={setType}
          options={JOB_TYPES}
          emptyLabel="Selecionar"
          invalid={invalid("type")}
        />
      </Field>
      <Field label="Candidatos" req>
        <Input
          inputMode="numeric"
          maxLength={5}
          invalid={invalid("applicants")}
          value={applicants}
          onChange={(e) => setApplicants(e.target.value.replace(/\D/g, ""))}
        />
      </Field>
      <Field label="Status" req>
        <Select
          value={status}
          onChange={setStatus}
          options={["Aberta", "Em análise", "Fechada"]}
          emptyLabel="Selecionar"
          invalid={invalid("status")}
        />
      </Field>
      <Field label="Faixa salarial" full req>
        <div className="grid grid-cols-2 gap-2.5">
          <MoneyInput
            invalid={invalid("salaryFrom") || invalid("salaryOrder")}
            placeholder="Salário de"
            value={salaryFrom}
            onChange={setSalaryFrom}
          />
          <MoneyInput
            invalid={invalid("salaryTo") || invalid("salaryOrder")}
            placeholder="Salário até"
            value={salaryTo}
            onChange={setSalaryTo}
          />
        </div>
      </Field>
      {hasError("salaryOrder") && (
        <p className="-mt-1 text-xs text-accent sm:col-span-2">
          O salário &quot;de&quot; não pode ser maior que o &quot;até&quot;.
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

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={candidate ? "Editar candidato" : "Adicionar candidato"}
      subtitle={
        candidate
          ? "Atualize os dados do candidato"
          : "Inclua um candidato no banco de talentos"
      }
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
      <Field label="Nome completo" full req>
        <Input
          invalid={invalid("name")}
          maxLength={160}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="E-mail" req>
        <Input
          type="email"
          invalid={invalid("email")}
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Cargo pretendido" req>
        <Input
          invalid={invalid("role")}
          maxLength={160}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </Field>
      <Field label="LinkedIn ou Portfólio" full req>
        <Input
          type="url"
          invalid={invalid("linkedin")}
          maxLength={300}
          placeholder="https://linkedin.com/in/…"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
        />
      </Field>
      <Field label="Etapa" full req>
        <Select
          value={stage}
          onChange={setStage}
          options={STAGES}
          emptyLabel="Selecionar"
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

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={card ? "Editar processo" : "Novo processo"}
      subtitle={
        card ? "Atualize o candidato no funil" : "Inicie um processo seletivo"
      }
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
      <Field label="Candidato" full req>
        <Input
          invalid={invalid("name")}
          maxLength={160}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="Vaga" req>
        <Input
          invalid={invalid("job")}
          maxLength={200}
          value={job}
          onChange={(e) => setJob(e.target.value)}
        />
      </Field>
      <Field label="Empresa" req>
        <Input
          invalid={invalid("company")}
          maxLength={160}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </Field>
      <Field label="Etapa" full req>
        <Select
          value={stage}
          onChange={setStage}
          options={stages}
          emptyLabel="Selecionar"
          invalid={invalid("stage")}
        />
      </Field>
    </FormModal>
  );
}

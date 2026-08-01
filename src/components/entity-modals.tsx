"use client";

import { useState, type FormEvent } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { CnpjInput, MoneyInput } from "@/components/ui/masked-input";
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
  onSubmit: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle}>
      <form onSubmit={submit}>
        <div className="grid grid-cols-1 gap-2.5 p-2.5 sm:grid-cols-2">
          {children}
        </div>
        <ModalFooter onCancel={onClose} />
      </form>
    </Modal>
  );
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
  const [name, setName] = useState(company?.name ?? "");
  const [sector, setSector] = useState(company?.sector ?? "");
  const [location, setLocation] = useState(company?.location ?? "");
  const [openings, setOpenings] = useState(String(company?.openings ?? 0));
  const [status, setStatus] = useState<Company["status"]>(
    company?.status ?? "Ativa",
  );

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={company ? "Editar empresa" : "Nova empresa"}
      subtitle={
        company ? "Atualize os dados da empresa" : "Cadastre uma empresa parceira"
      }
      onSubmit={() =>
        onSave({
          id: company?.id ?? 0,
          name: name.trim(),
          sector: sector.trim(),
          location: location.trim(),
          openings: Number(openings) || 0,
          status,
        })
      }
    >
      <Field label="Nome da empresa" full>
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Setor">
        <Input value={sector} onChange={(e) => setSector(e.target.value)} />
      </Field>
      <Field label="CNPJ">
        <CnpjInput placeholder="00.000.000/0000-00" />
      </Field>
      <Field label="Cidade">
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </Field>
      <Field label="Vagas abertas">
        <Input
          type="number"
          min={0}
          value={openings}
          onChange={(e) => setOpenings(e.target.value)}
        />
      </Field>
      <Field label="Status">
        <Select
          value={status}
          onChange={(v) => setStatus(v as Company["status"])}
          options={["Ativa", "Pausada"]}
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
  const [level, setLevel] = useState(job?.level ?? "Pleno");
  const [type, setType] = useState(job?.type ?? "Remoto");
  const [applicants, setApplicants] = useState(String(job?.applicants ?? 0));
  const [status, setStatus] = useState<Job["status"]>(job?.status ?? "Aberta");

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={job ? "Editar vaga" : "Nova vaga"}
      subtitle={job ? "Atualize os dados da vaga" : "Publique uma nova posição"}
      onSubmit={() =>
        onSave({
          id: job?.id ?? 0,
          title: title.trim(),
          company: company.trim(),
          level,
          type,
          applicants: Number(applicants) || 0,
          status,
        })
      }
    >
      <Field label="Título da vaga" full>
        <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Empresa" full>
        <Input
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </Field>
      <Field label="Nível">
        <Select value={level} onChange={setLevel} options={LEVELS} />
      </Field>
      <Field label="Modalidade">
        <Select value={type} onChange={setType} options={JOB_TYPES} />
      </Field>
      <Field label="Candidatos">
        <Input
          type="number"
          min={0}
          value={applicants}
          onChange={(e) => setApplicants(e.target.value)}
        />
      </Field>
      <Field label="Status">
        <Select
          value={status}
          onChange={(v) => setStatus(v as Job["status"])}
          options={["Aberta", "Em análise", "Fechada"]}
        />
      </Field>
      <Field label="Faixa salarial" full>
        <div className="grid grid-cols-2 gap-2.5">
          <MoneyInput placeholder="Salário de" />
          <MoneyInput placeholder="Salário até" />
        </div>
      </Field>
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
  const [stage, setStage] = useState<Candidate["stage"]>(
    candidate?.stage ?? "Triagem",
  );

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
      onSubmit={() =>
        onSave({
          id: candidate?.id ?? 0,
          name: name.trim(),
          email: email.trim(),
          role: role.trim(),
          stage,
          modifiedAt: "01/08/2026",
          linkedin: linkedin.trim(),
        })
      }
    >
      <Field label="Nome completo" full>
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="E-mail">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Cargo pretendido">
        <Input value={role} onChange={(e) => setRole(e.target.value)} />
      </Field>
      <Field label="LinkedIn ou Portfólio" full>
        <Input
          type="url"
          placeholder="https://linkedin.com/in/…"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
        />
      </Field>
      <Field label="Etapa" full>
        <Select
          value={stage}
          onChange={(v) => setStage(v as Candidate["stage"])}
          options={STAGES}
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
  const [stage, setStage] = useState(currentStage ?? stages[0]);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={card ? "Editar processo" : "Novo processo"}
      subtitle={
        card ? "Atualize o candidato no funil" : "Inicie um processo seletivo"
      }
      onSubmit={() =>
        onSave(
          {
            id: card?.id ?? 0,
            name: name.trim(),
            job: job.trim(),
            company: company.trim(),
          },
          stage,
        )
      }
    >
      <Field label="Candidato" full>
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Vaga">
        <Input value={job} onChange={(e) => setJob(e.target.value)} />
      </Field>
      <Field label="Empresa">
        <Input value={company} onChange={(e) => setCompany(e.target.value)} />
      </Field>
      <Field label="Etapa" full>
        <Select value={stage} onChange={setStage} options={stages} />
      </Field>
    </FormModal>
  );
}

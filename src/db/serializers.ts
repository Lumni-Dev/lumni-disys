import { emptyPermissions, type Member } from "@/lib/permissions";

// Datas/horas sempre no fuso de Sao Paulo (os timestamps do banco sao UTC).
const SAO_PAULO = "America/Sao_Paulo";

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: SAO_PAULO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

/** Hora (HH:mm) no fuso de Sao Paulo, para exibir ao lado da data. */
export function formatTime(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: SAO_PAULO,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

type JobRow = {
  id: number;
  title: string;
  company: string;
  description: string;
  type: string;
  level: string;
  openings: number;
  applicants: number;
  salaryFrom: number;
  salaryTo: number;
  status: string;
  createdAt: Date | string;
};
export function serializeJob(r: JobRow, applicants: number = r.applicants) {
  return {
    id: r.id,
    title: r.title,
    company: r.company,
    description: r.description,
    type: r.type,
    level: r.level,
    openings: r.openings,
    // Candidatos = numero real de candidatos da vaga (calculado nas rotas);
    // o valor da coluna e apenas o padrao quando nao informado.
    applicants,
    salaryFrom: r.salaryFrom,
    salaryTo: r.salaryTo,
    status: r.status,
    postedAt: formatDate(r.createdAt),
  };
}

type CandidateRow = {
  id: number;
  jobId: number | null;
  name: string;
  role: string;
  email: string;
  phone?: string;
  stage: string;
  linkedin: string;
  cvName?: string;
  updatedAt: Date | string;
  // A listagem envia so o flag (hasCv); rotas com .returning() trazem o
  // conteudo e o flag e derivado aqui. O base64 nunca vai na resposta.
  cvBase64?: string;
  hasCv?: boolean;
  matchScore?: number | null;
};
export function serializeCandidate(r: CandidateRow) {
  return {
    id: r.id,
    jobId: r.jobId,
    name: r.name,
    role: r.role,
    email: r.email,
    phone: r.phone ?? "",
    stage: r.stage,
    linkedin: r.linkedin,
    hasCv: r.hasCv ?? Boolean(r.cvBase64),
    cvName: r.cvName ?? "",
    matchScore: r.matchScore ?? null,
    modifiedAt: formatDate(r.updatedAt),
    modifiedAtTime: formatTime(r.updatedAt),
  };
}

type MemberRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};
type PermissionRow = { memberId: number; module: string; action: string };

export function serializeMember(
  member: MemberRow,
  permissionRows: PermissionRow[],
): Member & { id: number } {
  const permissions = emptyPermissions();
  for (const p of permissionRows) {
    if (permissions[p.module]) permissions[p.module][p.action] = true;
  }
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status,
    permissions,
  };
}

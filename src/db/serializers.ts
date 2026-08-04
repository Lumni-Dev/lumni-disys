import { emptyPermissions, type Member } from "@/lib/permissions";

export function formatDate(value: Date | string) {
  const d = new Date(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

type CompanyRow = {
  id: number;
  name: string;
  sector: string;
  location: string;
  openings: number;
  status: string;
};
export function serializeCompany(r: CompanyRow, openings: number = r.openings) {
  return {
    id: r.id,
    name: r.name,
    sector: r.sector,
    location: r.location,
    // Vagas somadas das vagas "Aberta" da empresa (calculado nas rotas); o
    // valor da coluna e apenas o padrao quando nao informado.
    openings,
    status: r.status,
  };
}

type JobRow = {
  id: number;
  title: string;
  companyId: number | null;
  company: string;
  description: string;
  type: string;
  level: string;
  openings: number;
  applicants: number;
  status: string;
  createdAt: Date | string;
};
export function serializeJob(r: JobRow) {
  return {
    id: r.id,
    title: r.title,
    companyId: r.companyId,
    company: r.company,
    description: r.description,
    type: r.type,
    level: r.level,
    openings: r.openings,
    applicants: r.applicants,
    status: r.status,
    postedAt: formatDate(r.createdAt),
  };
}

type CandidateRow = {
  id: number;
  name: string;
  role: string;
  email: string;
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
    name: r.name,
    role: r.role,
    email: r.email,
    stage: r.stage,
    linkedin: r.linkedin,
    hasCv: r.hasCv ?? Boolean(r.cvBase64),
    cvName: r.cvName ?? "",
    matchScore: r.matchScore ?? null,
    modifiedAt: formatDate(r.updatedAt),
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

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
export function serializeCompany(r: CompanyRow) {
  return {
    id: r.id,
    name: r.name,
    sector: r.sector,
    location: r.location,
    openings: r.openings,
    status: r.status,
  };
}

type JobRow = {
  id: number;
  title: string;
  company: string;
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
    company: r.company,
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
  updatedAt: Date | string;
};
export function serializeCandidate(r: CandidateRow) {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    email: r.email,
    stage: r.stage,
    linkedin: r.linkedin,
    modifiedAt: formatDate(r.updatedAt),
  };
}

type MemberRow = { id: number; name: string; email: string; role: string };
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
    permissions,
  };
}

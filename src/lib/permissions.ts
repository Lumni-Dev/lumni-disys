export type Action = "view" | "create" | "edit" | "delete";
export type Permissions = Record<string, Record<string, boolean>>;

export type Member = {
  name: string;
  email: string;
  role: string;
  /** "pending" enquanto o convite nao foi aceito; "accepted" depois. */
  status?: string;
  permissions: Permissions;
};

export const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "jobs", label: "Vagas" },
  { key: "candidates", label: "Candidatos" },
  { key: "pipeline", label: "Processos" },
  { key: "team", label: "Colaboradores" },
];

export const ACTIONS: { key: Action; label: string }[] = [
  { key: "view", label: "Ver" },
  { key: "create", label: "Criar" },
  { key: "edit", label: "Editar" },
  { key: "delete", label: "Excluir" },
];

export function emptyPermissions(): Permissions {
  return Object.fromEntries(
    MODULES.map((m) => [
      m.key,
      Object.fromEntries(ACTIONS.map((a) => [a.key, false])),
    ]),
  );
}

export function permissionsFrom(map: Record<string, Action[]>): Permissions {
  const p = emptyPermissions();
  for (const [module, actions] of Object.entries(map)) {
    for (const a of actions) if (p[module]) p[module][a] = true;
  }
  return p;
}

const MODULE_KEYS = new Set(MODULES.map((m) => m.key));
const ACTION_KEYS = new Set<string>(ACTIONS.map((a) => a.key));

/**
 * Converte a matriz de permissoes do body em linhas para o banco, aceitando
 * SOMENTE modulos/acoes conhecidos (descarta chaves arbitrarias/desconhecidas).
 */
export function validPermissionRows(
  memberId: number,
  permissions: Record<string, Record<string, boolean>> = {},
): { memberId: number; module: string; action: string }[] {
  const rows: { memberId: number; module: string; action: string }[] = [];
  for (const [module, actions] of Object.entries(permissions ?? {})) {
    if (!MODULE_KEYS.has(module)) continue;
    for (const [action, allowed] of Object.entries(actions ?? {})) {
      if (allowed && ACTION_KEYS.has(action))
        rows.push({ memberId, module, action });
    }
  }
  return rows;
}

export function countPermissions(p: Permissions) {
  let total = 0;
  let pages = 0;
  for (const m of MODULES) {
    const n = ACTIONS.filter((a) => p[m.key]?.[a.key]).length;
    total += n;
    if (n > 0) pages++;
  }
  return { total, pages };
}

export const initialTeam: Member[] = [
  {
    name: "Ana Ribeiro",
    email: "ana.ribeiro@disys.com",
    role: "Recrutadora",
    permissions: permissionsFrom({
      dashboard: ["view"],
      jobs: ["view", "create", "edit"],
      candidates: ["view", "create", "edit"],
      pipeline: ["view", "edit"],
    }),
  },
  {
    name: "Carlos Souza",
    email: "carlos.souza@disys.com",
    role: "Gestor",
    permissions: permissionsFrom({
      dashboard: ["view"],
      jobs: ["view"],
      candidates: ["view"],
      pipeline: ["view"],
    }),
  },
  {
    name: "Marina Alves",
    email: "marina.alves@disys.com",
    role: "Administradora",
    permissions: permissionsFrom({
      dashboard: ["view", "create", "edit", "delete"],
      jobs: ["view", "create", "edit", "delete"],
      candidates: ["view", "create", "edit", "delete"],
      pipeline: ["view", "create", "edit", "delete"],
      team: ["view", "create", "edit", "delete"],
    }),
  },
];

import { randomBytes } from "crypto";
import { and, asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";

export type Account = { id: number; publicToken: string };

function newToken(): string {
  return randomBytes(9).toString("hex");
}

/** O e-mail tem acesso a esta conta? (dono ou colaborador dela) */
async function hasAccess(email: string, accountId: number): Promise<boolean> {
  const [acc] = await db
    .select({ ownerEmail: schema.accounts.ownerEmail })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, accountId));
  if (!acc) return false;
  if (acc.ownerEmail === email) return true;
  const [member] = await db
    .select({ id: schema.teamMembers.id })
    .from(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.accountId, accountId),
        eq(schema.teamMembers.email, email),
        eq(schema.teamMembers.status, "accepted"),
      ),
    );
  return Boolean(member);
}

/**
 * Workspace ativo do e-mail, nesta ordem: o escolhido pelo usuario (se o
 * vinculo ainda vale) > o primeiro workspace proprio > o primeiro convite
 * aceito > null (o usuario ainda precisa criar um workspace no onboarding —
 * nada e criado automaticamente).
 */
export async function accountForEmail(email: string): Promise<Account | null> {
  // 1) Workspace ativo escolhido pelo usuario, se ainda tiver acesso.
  const [profile] = await db
    .select({ activeAccountId: schema.userProfiles.activeAccountId })
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.email, email));
  if (profile?.activeAccountId) {
    if (await hasAccess(email, profile.activeAccountId)) {
      const [acc] = await db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.id, profile.activeAccountId));
      if (acc) return { id: acc.id, publicToken: acc.publicToken };
    }
  }

  // 2) Primeiro workspace proprio.
  const [owned] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.ownerEmail, email))
    .orderBy(asc(schema.accounts.id))
    .limit(1);
  if (owned) return { id: owned.id, publicToken: owned.publicToken };

  // 3) Primeiro convite ACEITO (quem so foi convidado cai aqui).
  const [member] = await db
    .select()
    .from(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.email, email),
        eq(schema.teamMembers.status, "accepted"),
      ),
    )
    .orderBy(asc(schema.teamMembers.id))
    .limit(1);
  if (member?.accountId) {
    const [acc] = await db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.id, member.accountId));
    if (acc) return { id: acc.id, publicToken: acc.publicToken };
  }

  return null;
}

/**
 * Cria um workspace para o e-mail com o nome dado e ja o torna o ativo.
 * O limite de workspaces por plano e validado pela rota (workspaceLimitError).
 */
export async function createWorkspace(
  email: string,
  name: string,
): Promise<Account> {
  const [created] = await db
    .insert(schema.accounts)
    .values({ ownerEmail: email, name: name.slice(0, 120), publicToken: newToken() })
    .returning();
  await db
    .insert(schema.userProfiles)
    .values({ email, activeAccountId: created.id })
    .onConflictDoUpdate({
      target: schema.userProfiles.email,
      set: { activeAccountId: created.id },
    });
  return { id: created.id, publicToken: created.publicToken };
}

/** Conta ativa do usuario logado, ou null (sem sessao ou sem workspace). */
export async function currentAccount(): Promise<Account | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return accountForEmail(email);
}

/** Conta pelo token publico (usado na pagina publica de vagas). */
export async function accountByToken(token: string): Promise<Account | null> {
  const [acc] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.publicToken, token));
  return acc ? { id: acc.id, publicToken: acc.publicToken } : null;
}

import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";

export type Account = { id: number; publicToken: string };

function newToken(): string {
  return randomBytes(9).toString("hex");
}

async function ownedAccount(email: string): Promise<Account | null> {
  const [acc] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.ownerEmail, email));
  return acc ? { id: acc.id, publicToken: acc.publicToken } : null;
}

/**
 * Conta (workspace) do e-mail: se ele e colaborador de um projeto, e aquela
 * conta; senao, e o dono da propria (criada no primeiro acesso).
 */
export async function accountForEmail(email: string): Promise<Account> {
  const [member] = await db
    .select()
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.email, email));
  if (member?.accountId) {
    const [acc] = await db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.id, member.accountId));
    if (acc) return { id: acc.id, publicToken: acc.publicToken };
  }

  const owned = await ownedAccount(email);
  if (owned) return owned;

  const [created] = await db
    .insert(schema.accounts)
    .values({ ownerEmail: email, publicToken: newToken() })
    .onConflictDoNothing({ target: schema.accounts.ownerEmail })
    .returning();
  if (created) return { id: created.id, publicToken: created.publicToken };

  // Corrida: outra requisicao criou a conta; le de novo.
  const again = await ownedAccount(email);
  if (again) return again;
  throw new Error("Falha ao resolver a conta");
}

/** Conta do usuario logado, ou null se nao houver sessao. */
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

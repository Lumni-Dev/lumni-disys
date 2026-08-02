import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";

export type Account = { id: number; publicToken: string };

function newToken(): string {
  return randomBytes(9).toString("hex");
}

// Registros de exemplo para uma conta nova: um por pagina, marcados "(exemplo)".
// Os valores de status/etapa sao os canonicos usados na logica (Ativa, Aberta,
// Triagem), so os nomes trazem o "(exemplo)".
async function seedExampleData(accountId: number): Promise<void> {
  try {
    await db.insert(schema.companies).values({
      accountId,
      name: "Empresa Lumni Dev (exemplo)",
      sector: "Tecnologia",
      location: "Sao Paulo, SP",
      openings: 3,
      status: "Ativa",
    });
    await db.insert(schema.jobs).values({
      accountId,
      title: "Desenvolvedor(a) Full Stack (exemplo)",
      company: "Empresa Lumni Dev (exemplo)",
      type: "Remoto",
      level: "Pleno",
      openings: 2,
      applicants: 1,
      status: "Aberta",
    });
    const [candidate] = await db
      .insert(schema.candidates)
      .values({
        accountId,
        name: "Ana Maria Silva (exemplo)",
        // Mesmo titulo da vaga de exemplo: mostra o vinculo candidato -> vaga.
        role: "Desenvolvedor(a) Full Stack (exemplo)",
        email: "ana.exemplo@lumni.dev.br",
        stage: "Triagem",
        linkedin: "https://www.linkedin.com/in/exemplo",
      })
      .returning({ id: schema.candidates.id });
    await db.insert(schema.pipelineCards).values({
      accountId,
      candidateId: candidate?.id ?? null,
      name: "Ana Maria Silva (exemplo)",
      job: "Desenvolvedor(a) Full Stack (exemplo)",
      company: "Empresa Lumni Dev (exemplo)",
      stage: "Triagem",
      position: 0,
    });
    await db
      .insert(schema.teamMembers)
      .values({
        accountId,
        name: "Colaborador Exemplo (exemplo)",
        email: `colaborador.exemplo.${accountId}@exemplo.disys`,
        role: "Recrutador(a)",
      })
      .onConflictDoNothing({ target: schema.teamMembers.email });
  } catch {
    // O seed nao pode bloquear a criacao da conta.
  }
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
 * conta; senao, e o dono da propria (criada no primeiro acesso, com exemplos).
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
  if (created) {
    await seedExampleData(created.id);
    return { id: created.id, publicToken: created.publicToken };
  }

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

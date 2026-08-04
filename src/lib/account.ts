import { randomBytes } from "crypto";
import { and, asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { EXAMPLE_CV_NAME, exampleCvDataUrl } from "@/lib/example-cv";
import { isSuperAdmin } from "@/lib/superadmin";

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
      description:
        "Vaga de exemplo: desenvolvimento de aplicacoes web modernas, do banco de dados a interface. Edite ou exclua este registro quando quiser.",
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
        // Curriculo de exemplo: mostra o botao de download desde o inicio.
        cvName: EXAMPLE_CV_NAME,
        cvBase64: exampleCvDataUrl(),
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
      .onConflictDoNothing({
        target: [schema.teamMembers.accountId, schema.teamMembers.email],
      });
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

/** O e-mail tem acesso a esta conta? (dono ou colaborador dela) */
async function hasAccess(email: string, accountId: number): Promise<boolean> {
  // Super-admin enxerga qualquer workspace (somente leitura), sem vinculo.
  if (isSuperAdmin(email)) return true;
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
 * Conta (workspace) do e-mail, nesta ordem: o workspace ativo escolhido (se o
 * vinculo ainda vale) > a conta propria > o primeiro convite de colaborador >
 * cria a propria no primeiro acesso (com exemplos).
 */
export async function accountForEmail(email: string): Promise<Account> {
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

  // 2) Conta propria.
  const owned = await ownedAccount(email);
  if (owned) return owned;

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

  // 4) Primeiro acesso: cria a conta propria com os exemplos.
  return ensureOwnAccount(email);
}

/**
 * Conta propria do e-mail: retorna a existente ou cria uma nova com os
 * exemplos (tambem usada pelo botao "Criar meu workspace" de quem so
 * participa como convidado).
 */
export async function ensureOwnAccount(email: string): Promise<Account> {
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

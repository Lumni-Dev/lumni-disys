import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { accountForEmail } from "@/lib/account";
import { MODULES } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await accountForEmail(email);
  // Sem workspace: o cliente mostra o onboarding de criacao.
  if (!account)
    return NextResponse.json({
      token: "",
      owner: false,
      modules: [],
      noWorkspace: true,
    });

  const [acc] = await db
    .select({ ownerEmail: schema.accounts.ownerEmail })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, account.id));
  const owner = acc?.ownerEmail === email;

  // Modulos que o usuario pode VER: dono ve tudo; colaborador, so os que
  // tiverem a permissao "view" (usado para montar o menu lateral).
  let modules: string[];
  if (owner) {
    modules = MODULES.map((m) => m.key);
  } else {
    const [member] = await db
      .select({ id: schema.teamMembers.id })
      .from(schema.teamMembers)
      .where(
        and(
          eq(schema.teamMembers.email, email),
          eq(schema.teamMembers.accountId, account.id),
          eq(schema.teamMembers.status, "accepted"),
        ),
      );
    if (member) {
      const rows = await db
        .select({ module: schema.memberPermissions.module })
        .from(schema.memberPermissions)
        .where(
          and(
            eq(schema.memberPermissions.memberId, member.id),
            eq(schema.memberPermissions.action, "view"),
          ),
        );
      modules = [...new Set(rows.map((r) => r.module))];
    } else {
      modules = [];
    }
  }

  return NextResponse.json({
    token: account.publicToken,
    // Colaboradores usam a conta do dono; so o dono pode excluir o workspace.
    owner,
    modules,
  });
}

// Exclui o workspace ATIVO do dono: todos os dados da conta, os acessos dos
// colaboradores e a propria conta. O perfil do usuario permanece (ele pode
// ter outros workspaces). Irreversivel.
export async function DELETE() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const active = await accountForEmail(email);
  if (!active)
    return NextResponse.json({ error: "no_workspace" }, { status: 400 });

  const [acc] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.id, active.id));
  if (!acc || acc.ownerEmail !== email)
    return NextResponse.json(
      { error: "Somente o dono do workspace pode excluir a conta" },
      { status: 403 },
    );

  await db.transaction(async (tx) => {
    // Auditoria: registra a exclusao antes de apagar, ja que nada mais sobra.
    await tx.insert(schema.deletedAccounts).values({
      accountId: acc.id,
      ownerEmail: acc.ownerEmail,
      accountCreatedAt: acc.createdAt,
      // O workspace passou a ser a empresa; nao ha mais tabela de empresas.
      companiesCount: 0,
      jobsCount: await tx.$count(schema.jobs, eq(schema.jobs.accountId, acc.id)),
      candidatesCount: await tx.$count(
        schema.candidates,
        eq(schema.candidates.accountId, acc.id),
      ),
      teamMembersCount: await tx.$count(
        schema.teamMembers,
        eq(schema.teamMembers.accountId, acc.id),
      ),
    });
    await tx
      .delete(schema.pipelineCards)
      .where(eq(schema.pipelineCards.accountId, acc.id));
    await tx
      .delete(schema.candidates)
      .where(eq(schema.candidates.accountId, acc.id));
    await tx.delete(schema.jobs).where(eq(schema.jobs.accountId, acc.id));
    // As permissoes caem em cascata (FK member_permissions -> team_members).
    await tx
      .delete(schema.teamMembers)
      .where(eq(schema.teamMembers.accountId, acc.id));
    // O perfil do usuario permanece (ele pode ter outros workspaces); o
    // activeAccountId cai para null via FK (onDelete: set null).
    await tx.delete(schema.accounts).where(eq(schema.accounts.id, acc.id));
  });

  return NextResponse.json({ ok: true });
}

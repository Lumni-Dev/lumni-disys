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
  const [own] = await db
    .select({ id: schema.accounts.id })
    .from(schema.accounts)
    .where(eq(schema.accounts.ownerEmail, email));
  const owner = own?.id === account.id;

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

// Exclui o workspace inteiro do dono: todos os dados da conta, os acessos dos
// colaboradores, o perfil e a propria conta. Irreversivel.
export async function DELETE() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [acc] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.ownerEmail, email));
  if (!acc)
    return NextResponse.json(
      { error: "Somente o dono do workspace pode excluir a conta" },
      { status: 403 },
    );

  await db.transaction(async (tx) => {
    await tx
      .delete(schema.pipelineCards)
      .where(eq(schema.pipelineCards.accountId, acc.id));
    await tx
      .delete(schema.candidates)
      .where(eq(schema.candidates.accountId, acc.id));
    await tx.delete(schema.jobs).where(eq(schema.jobs.accountId, acc.id));
    await tx
      .delete(schema.companies)
      .where(eq(schema.companies.accountId, acc.id));
    // As permissoes caem em cascata (FK member_permissions -> team_members).
    await tx
      .delete(schema.teamMembers)
      .where(eq(schema.teamMembers.accountId, acc.id));
    await tx
      .delete(schema.userProfiles)
      .where(eq(schema.userProfiles.email, email));
    await tx.delete(schema.accounts).where(eq(schema.accounts.id, acc.id));
  });

  return NextResponse.json({ ok: true });
}

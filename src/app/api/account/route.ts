import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
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

    owner,
    modules,
  });
}




export async function DELETE() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Exclui a conta do usuario por completo: TODOS os workspaces que ele possui
  // (e os dados deles), as colaboracoes dele em outros workspaces e o perfil.
  const owned = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.ownerEmail, email));
  if (owned.length === 0)
    return NextResponse.json({ error: "no_workspace" }, { status: 400 });

  const ids = owned.map((a) => a.id);

  await db.transaction(async (tx) => {
    for (const acc of owned) {
      await tx.insert(schema.deletedAccounts).values({
        accountId: acc.id,
        ownerEmail: acc.ownerEmail,
        accountCreatedAt: acc.createdAt,
        companiesCount: 0,
        jobsCount: await tx.$count(
          schema.jobs,
          eq(schema.jobs.accountId, acc.id),
        ),
        candidatesCount: await tx.$count(
          schema.candidates,
          eq(schema.candidates.accountId, acc.id),
        ),
        teamMembersCount: await tx.$count(
          schema.teamMembers,
          eq(schema.teamMembers.accountId, acc.id),
        ),
      });
    }
    await tx
      .delete(schema.pipelineCards)
      .where(inArray(schema.pipelineCards.accountId, ids));
    await tx
      .delete(schema.candidates)
      .where(inArray(schema.candidates.accountId, ids));
    await tx.delete(schema.jobs).where(inArray(schema.jobs.accountId, ids));
    await tx
      .delete(schema.teamMembers)
      .where(inArray(schema.teamMembers.accountId, ids));
    await tx.delete(schema.accounts).where(inArray(schema.accounts.id, ids));
    // Remove as colaboracoes do usuario em workspaces de outros donos.
    await tx
      .delete(schema.teamMembers)
      .where(eq(schema.teamMembers.email, email));
    // Apaga o perfil (foto/nome/tema) para nao ressuscitar ao recriar a conta.
    await tx
      .delete(schema.userProfiles)
      .where(eq(schema.userProfiles.email, email));
  });

  return NextResponse.json({ ok: true });
}

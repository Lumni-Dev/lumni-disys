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

    await tx.insert(schema.deletedAccounts).values({
      accountId: acc.id,
      ownerEmail: acc.ownerEmail,
      accountCreatedAt: acc.createdAt,

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

    await tx
      .delete(schema.teamMembers)
      .where(eq(schema.teamMembers.accountId, acc.id));


    await tx.delete(schema.accounts).where(eq(schema.accounts.id, acc.id));

    // Se era o ultimo workspace do dono, apaga o perfil (foto/nome/tema) para
    // nao "ressuscitar" a imagem antiga ao recriar a conta depois.
    const remaining = await tx.$count(
      schema.accounts,
      eq(schema.accounts.ownerEmail, email),
    );
    if (remaining === 0) {
      await tx
        .delete(schema.userProfiles)
        .where(eq(schema.userProfiles.email, email));
    }
  });

  return NextResponse.json({ ok: true });
}

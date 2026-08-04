import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { serializeMember } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { validPermissionRows } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

// Contexto de dono: so o dono do workspace altera permissoes de membros, e
// ninguem pode editar/excluir o proprio registro ou o do dono (auto-escalada).
async function ownerContext(accountId: number) {
  const session = await auth();
  const email = session?.user?.email ?? "";
  const [acc] = await db
    .select({ ownerEmail: schema.accounts.ownerEmail })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, accountId));
  const ownerEmail = acc?.ownerEmail ?? "";
  return { email, ownerEmail, isOwner: !!email && ownerEmail === email };
}

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("team", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();
  const { email, ownerEmail, isOwner } = await ownerContext(account.id);

  const [target] = await db
    .select({ email: schema.teamMembers.email })
    .from(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.id, id),
        eq(schema.teamMembers.accountId, account.id),
      ),
    );
  if (!target)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isOwner && (target.email === email || target.email === ownerEmail))
    return NextResponse.json(
      { error: "Sem permissao para editar este membro" },
      { status: 403 },
    );

  const [member] = await db
    .update(schema.teamMembers)
    .set({
      name: String(body.name ?? "").slice(0, 160),
      email: String(body.email ?? "").slice(0, 200),
      role: String(body.role ?? "").slice(0, 120),
    })
    .where(
      and(
        eq(schema.teamMembers.id, id),
        eq(schema.teamMembers.accountId, account.id),
      ),
    )
    .returning();
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Permissoes: SOMENTE o dono altera. Para nao-dono, mantem as atuais.
  let rows: { memberId: number; module: string; action: string }[];
  if (isOwner) {
    await db
      .delete(schema.memberPermissions)
      .where(eq(schema.memberPermissions.memberId, id));
    rows = validPermissionRows(id, body.permissions);
    if (rows.length) await db.insert(schema.memberPermissions).values(rows);
  } else {
    rows = await db
      .select()
      .from(schema.memberPermissions)
      .where(eq(schema.memberPermissions.memberId, id));
  }

  return NextResponse.json(serializeMember(member, rows));
}

export async function DELETE(_req: Request, { params }: Params) {
  const { account, response } = await authorize("team", "delete");
  if (!account) return response;

  const id = Number((await params).id);
  const { email, ownerEmail, isOwner } = await ownerContext(account.id);

  const [target] = await db
    .select({ email: schema.teamMembers.email })
    .from(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.id, id),
        eq(schema.teamMembers.accountId, account.id),
      ),
    );
  if (target && !isOwner && (target.email === email || target.email === ownerEmail))
    return NextResponse.json(
      { error: "Sem permissao para remover este membro" },
      { status: 403 },
    );

  await db
    .delete(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.id, id),
        eq(schema.teamMembers.accountId, account.id),
      ),
    );
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { accountForEmail, ensureOwnAccount } from "@/lib/account";

// Workspaces do usuario: a conta propria (se existir) + todas em que ele e
// colaborador. Usado pelo seletor do sidebar.
export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const current = await accountForEmail(email);

  const [own] = await db
    .select({ id: schema.accounts.id, ownerEmail: schema.accounts.ownerEmail })
    .from(schema.accounts)
    .where(eq(schema.accounts.ownerEmail, email));

  const memberships = await db
    .select({ id: schema.accounts.id, ownerEmail: schema.accounts.ownerEmail })
    .from(schema.teamMembers)
    .innerJoin(
      schema.accounts,
      eq(schema.teamMembers.accountId, schema.accounts.id),
    )
    .where(
      and(
        eq(schema.teamMembers.email, email),
        eq(schema.teamMembers.status, "accepted"),
      ),
    )
    .orderBy(asc(schema.teamMembers.id));

  // A propria conta primeiro; convites depois (sem duplicar).
  const raw = [
    ...(own ? [{ ...own, owner: true }] : []),
    ...memberships
      .filter((m) => m.id !== own?.id)
      .map((m) => ({ ...m, owner: false })),
  ];

  // Nome do dono (perfil), para rotular o workspace no seletor.
  const ownerEmails = [...new Set(raw.map((w) => w.ownerEmail))];
  const profiles = ownerEmails.length
    ? await db
        .select({
          email: schema.userProfiles.email,
          name: schema.userProfiles.name,
        })
        .from(schema.userProfiles)
        .where(inArray(schema.userProfiles.email, ownerEmails))
    : [];
  const nameByEmail = new Map(profiles.map((p) => [p.email, p.name]));

  return NextResponse.json(
    raw.map((w) => ({
      id: w.id,
      owner: w.owner,
      ownerEmail: w.ownerEmail,
      ownerName: nameByEmail.get(w.ownerEmail) ?? "",
      active: w.id === current.id,
    })),
  );
}

// Cria (ou recupera) o workspace proprio de quem so participa como
// convidado, e ja o torna o ativo.
export async function POST() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const own = await ensureOwnAccount(email);
  await db
    .insert(schema.userProfiles)
    .values({ email, activeAccountId: own.id })
    .onConflictDoUpdate({
      target: schema.userProfiles.email,
      set: { activeAccountId: own.id },
    });

  return NextResponse.json({ ok: true, id: own.id });
}

// Troca o workspace ativo (valida que o usuario tem acesso a ele).
export async function PUT(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = Number(body.id);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Id invalido" }, { status: 400 });

  const [acc] = await db
    .select({ id: schema.accounts.id, ownerEmail: schema.accounts.ownerEmail })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, id));
  if (!acc)
    return NextResponse.json({ error: "Workspace nao existe" }, { status: 404 });

  if (acc.ownerEmail !== email) {
    const [member] = await db
      .select({ id: schema.teamMembers.id })
      .from(schema.teamMembers)
      .where(
        and(
          eq(schema.teamMembers.accountId, id),
          eq(schema.teamMembers.email, email),
          eq(schema.teamMembers.status, "accepted"),
        ),
      );
    if (!member)
      return NextResponse.json({ error: "Sem acesso" }, { status: 403 });
  }

  await db
    .insert(schema.userProfiles)
    .values({ email, activeAccountId: id })
    .onConflictDoUpdate({
      target: schema.userProfiles.email,
      set: { activeAccountId: id },
    });

  return NextResponse.json({ ok: true });
}

// Sai do workspace ativo (apenas colaborador; o dono exclui a conta na tela
// de conta). Remove o vinculo, as permissoes caem em cascata e a resolucao
// volta para a conta propria.
export async function DELETE() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const current = await accountForEmail(email);

  const [acc] = await db
    .select({ ownerEmail: schema.accounts.ownerEmail })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, current.id));
  if (acc?.ownerEmail === email)
    return NextResponse.json(
      { error: "O dono nao sai do proprio workspace" },
      { status: 400 },
    );

  await db
    .delete(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.accountId, current.id),
        eq(schema.teamMembers.email, email),
      ),
    );
  await db
    .update(schema.userProfiles)
    .set({ activeAccountId: null })
    .where(eq(schema.userProfiles.email, email));

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { accountForEmail, createWorkspace } from "@/lib/account";
import { workspaceLimitError } from "@/lib/plan";

// Workspaces do usuario: todos os que ele possui + os em que colabora.
// Usado pelo seletor do sidebar (lista vazia = onboarding de criacao).
export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const current = await accountForEmail(email);

  const owned = await db
    .select({
      id: schema.accounts.id,
      name: schema.accounts.name,
      ownerEmail: schema.accounts.ownerEmail,
    })
    .from(schema.accounts)
    .where(eq(schema.accounts.ownerEmail, email))
    .orderBy(asc(schema.accounts.id));

  const memberships = await db
    .select({
      id: schema.accounts.id,
      name: schema.accounts.name,
      ownerEmail: schema.accounts.ownerEmail,
    })
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

  // Os proprios primeiro; convites depois (sem duplicar).
  const ownedIds = new Set(owned.map((w) => w.id));
  const raw = [
    ...owned.map((w) => ({ ...w, owner: true })),
    ...memberships
      .filter((m) => !ownedIds.has(m.id))
      .map((m) => ({ ...m, owner: false })),
  ];

  // Nome do dono (perfil), para rotular workspaces de convite sem nome.
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
      name: w.name,
      owner: w.owner,
      ownerEmail: w.ownerEmail,
      ownerName: nameByEmail.get(w.ownerEmail) ?? "",
      active: w.id === current?.id,
    })),
  );
}

// Cria um workspace com o nome dado (sugestao da UI: o nome da empresa) e ja
// o torna o ativo. Plano Free permite 1 workspace; Plus e ilimitado.
export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  if (!name)
    return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });

  const limited = await workspaceLimitError(email);
  if (limited) return limited;

  const created = await createWorkspace(email, name);
  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
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
// volta para os workspaces proprios.
export async function DELETE() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const current = await accountForEmail(email);
  if (!current)
    return NextResponse.json({ error: "no_workspace" }, { status: 400 });

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

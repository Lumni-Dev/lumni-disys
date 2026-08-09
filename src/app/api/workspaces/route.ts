import { NextResponse } from "next/server";
import { and, asc, count, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { accountForEmail, createWorkspace } from "@/lib/account";
import { workspaceLimitError } from "@/lib/plan";

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

  const ownedIds = new Set(owned.map((w) => w.id));
  const raw = [
    ...owned.map((w) => ({ ...w, owner: true })),
    ...memberships
      .filter((m) => !ownedIds.has(m.id))
      .map((m) => ({ ...m, owner: false })),
  ];

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

  const allIds = raw.map((w) => w.id);
  const jobRows = allIds.length
    ? await db
        .select({ accountId: schema.jobs.accountId, n: count() })
        .from(schema.jobs)
        .where(inArray(schema.jobs.accountId, allIds))
        .groupBy(schema.jobs.accountId)
    : [];
  const jobCountBy = new Map(jobRows.map((r) => [r.accountId, r.n]));

  return NextResponse.json(
    raw.map((w) => ({
      id: w.id,
      name: w.name,
      owner: w.owner,
      ownerEmail: w.ownerEmail,
      ownerName: nameByEmail.get(w.ownerEmail) ?? "",
      active: w.id === current?.id,
      jobCount: jobCountBy.get(w.id) ?? 0,
    })),
  );
}

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

import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";

type Params = { params: Promise<{ id: string }> };

async function ownedAccount(id: number, email: string) {
  const [acc] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.id, id));
  if (!acc || acc.ownerEmail !== email) return null;
  return acc;
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await params).id);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Id invalido" }, { status: 400 });

  const acc = await ownedAccount(id, email);
  if (!acc)
    return NextResponse.json({ error: "Sem acesso" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  if (!name)
    return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });

  await db
    .update(schema.accounts)
    .set({ name: name.slice(0, 120) })
    .where(eq(schema.accounts.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await params).id);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Id invalido" }, { status: 400 });

  const acc = await ownedAccount(id, email);
  if (!acc)
    return NextResponse.json({ error: "Sem acesso" }, { status: 403 });

  const [jobs] = await db
    .select({ n: count() })
    .from(schema.jobs)
    .where(eq(schema.jobs.accountId, id));
  if (jobs.n > 0)
    return NextResponse.json(
      { error: "has_jobs", dependency: "jobs", count: jobs.n },
      { status: 409 },
    );

  await db.transaction(async (tx) => {
    await tx.insert(schema.deletedAccounts).values({
      accountId: acc.id,
      ownerEmail: acc.ownerEmail,
      accountCreatedAt: acc.createdAt,
      companiesCount: 0,
      jobsCount: 0,
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

    await tx
      .delete(schema.teamMembers)
      .where(eq(schema.teamMembers.accountId, acc.id));

    await tx.delete(schema.accounts).where(eq(schema.accounts.id, acc.id));
  });

  return NextResponse.json({ ok: true });
}

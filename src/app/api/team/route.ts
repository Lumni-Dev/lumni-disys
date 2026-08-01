import { NextResponse } from "next/server";
import { asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeMember } from "@/db/serializers";
import { currentAccount } from "@/lib/account";

type PermInput = Record<string, Record<string, boolean>>;

function permissionRows(memberId: number, permissions: PermInput = {}) {
  const rows: { memberId: number; module: string; action: string }[] = [];
  for (const [module, actions] of Object.entries(permissions)) {
    for (const [action, allowed] of Object.entries(actions)) {
      if (allowed) rows.push({ memberId, module, action });
    }
  }
  return rows;
}

export async function GET() {
  const account = await currentAccount();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await db
    .select()
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.accountId, account.id))
    .orderBy(asc(schema.teamMembers.id));

  const ids = members.map((m) => m.id);
  const perms = ids.length
    ? await db
        .select()
        .from(schema.memberPermissions)
        .where(inArray(schema.memberPermissions.memberId, ids))
    : [];

  const byMember = new Map<
    number,
    { memberId: number; module: string; action: string }[]
  >();
  for (const p of perms) {
    const arr = byMember.get(p.memberId) ?? [];
    arr.push(p);
    byMember.set(p.memberId, arr);
  }

  return NextResponse.json(
    members.map((m) => serializeMember(m, byMember.get(m.id) ?? [])),
  );
}

export async function POST(req: Request) {
  const account = await currentAccount();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const [member] = await db
    .insert(schema.teamMembers)
    .values({
      accountId: account.id,
      name: body.name,
      email: body.email,
      role: body.role ?? "",
    })
    .returning();

  const rows = permissionRows(member.id, body.permissions);
  if (rows.length) await db.insert(schema.memberPermissions).values(rows);

  return NextResponse.json(serializeMember(member, rows), { status: 201 });
}

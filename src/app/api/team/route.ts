import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeMember } from "@/db/serializers";

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
  const members = await db
    .select()
    .from(schema.teamMembers)
    .orderBy(asc(schema.teamMembers.id));
  const perms = await db.select().from(schema.memberPermissions);

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
  const body = await req.json();
  const [member] = await db
    .insert(schema.teamMembers)
    .values({
      name: body.name,
      email: body.email,
      role: body.role ?? "",
    })
    .returning();

  const rows = permissionRows(member.id, body.permissions);
  if (rows.length) await db.insert(schema.memberPermissions).values(rows);

  return NextResponse.json(serializeMember(member, rows), { status: 201 });
}

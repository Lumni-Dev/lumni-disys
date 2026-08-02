import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeMember } from "@/db/serializers";
import { authorize } from "@/lib/authz";

type Params = { params: Promise<{ id: string }> };
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

export async function PUT(req: Request, { params }: Params) {
  const { account, response } = await authorize("team", "edit");
  if (!account) return response;

  const id = Number((await params).id);
  const body = await req.json();

  const [member] = await db
    .update(schema.teamMembers)
    .set({ name: body.name, email: body.email, role: body.role ?? "" })
    .where(
      and(eq(schema.teamMembers.id, id), eq(schema.teamMembers.accountId, account.id)),
    )
    .returning();
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db
    .delete(schema.memberPermissions)
    .where(eq(schema.memberPermissions.memberId, id));
  const rows = permissionRows(id, body.permissions);
  if (rows.length) await db.insert(schema.memberPermissions).values(rows);

  return NextResponse.json(serializeMember(member, rows));
}

export async function DELETE(_req: Request, { params }: Params) {
  const { account, response } = await authorize("team", "delete");
  if (!account) return response;

  const id = Number((await params).id);
  await db
    .delete(schema.teamMembers)
    .where(
      and(eq(schema.teamMembers.id, id), eq(schema.teamMembers.accountId, account.id)),
    );
  return NextResponse.json({ ok: true });
}

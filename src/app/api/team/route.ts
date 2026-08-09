import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { serializeMember } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { planLimitError } from "@/lib/plan";
import { validPermissionRows } from "@/lib/permissions";
import { sendInviteEmail } from "@/lib/mail";

export async function GET() {
  const { account, response } = await authorize("team", "view");
  if (!account) return response;

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
  const { account, response } = await authorize("team", "create");
  if (!account) return response;


  const limited = await planLimitError(account.id, "members");
  if (limited) return limited;

  const body = await req.json();
  const email = String(body.email ?? "").slice(0, 200);


  const [dup] = await db
    .select({ id: schema.teamMembers.id })
    .from(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.accountId, account.id),
        eq(schema.teamMembers.email, email),
      ),
    );
  if (dup)
    return NextResponse.json(
      { error: "Este e-mail ja foi convidado" },
      { status: 409 },
    );



  const inviteToken = randomBytes(16).toString("hex");
  const [member] = await db
    .insert(schema.teamMembers)
    .values({
      accountId: account.id,
      name: String(body.name ?? "").slice(0, 160),
      email,
      role: String(body.role ?? "").slice(0, 120),
      status: "pending",
      inviteToken,
    })
    .returning();



  const [acc] = await db
    .select({ ownerEmail: schema.accounts.ownerEmail })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, account.id));
  const session0 = await auth();
  const isOwner = acc?.ownerEmail === (session0?.user?.email ?? "");
  const rows = isOwner ? validPermissionRows(member.id, body.permissions) : [];
  if (rows.length) await db.insert(schema.memberPermissions).values(rows);



  try {
    const session = await auth();
    const inviterName =
      session?.user?.name ?? session?.user?.email ?? "Um usuario do DISYS";
    const host =
      req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    if (host) {
      await sendInviteEmail({
        to: body.email,
        inviterName,
        url: `${proto}://${host}/invite/${inviteToken}`,
      });
    }
  } catch {

  }

  return NextResponse.json(serializeMember(member, rows), { status: 201 });
}

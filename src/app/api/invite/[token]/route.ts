import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";

type Params = { params: Promise<{ token: string }> };

async function findInvite(token: string) {
  const [invite] = await db
    .select()
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.inviteToken, token));
  if (!invite || invite.status !== "pending" || !invite.accountId) return null;
  return invite;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const invite = await findInvite(token);
  if (!invite)
    return NextResponse.json({ error: "invalid" }, { status: 404 });
  if (invite.email.toLowerCase() !== email.toLowerCase())
    return NextResponse.json({ error: "wrong-email" }, { status: 403 });

  const [acc] = await db
    .select({ ownerEmail: schema.accounts.ownerEmail })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, invite.accountId!));
  const [ownerProfile] = acc
    ? await db
        .select({ name: schema.userProfiles.name })
        .from(schema.userProfiles)
        .where(eq(schema.userProfiles.email, acc.ownerEmail))
    : [];

  return NextResponse.json({
    ok: true,
    owner: ownerProfile?.name || acc?.ownerEmail || "",
    role: invite.role,
  });
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const invite = await findInvite(token);
  if (!invite)
    return NextResponse.json({ error: "invalid" }, { status: 404 });
  if (invite.email.toLowerCase() !== email.toLowerCase())
    return NextResponse.json({ error: "wrong-email" }, { status: 403 });

  const body = await req.json();
  const action = body.action === "accept" ? "accept" : "decline";

  if (action === "decline") {

    await db
      .delete(schema.teamMembers)
      .where(eq(schema.teamMembers.id, invite.id));
    return NextResponse.json({ ok: true, action });
  }

  await db
    .update(schema.teamMembers)
    .set({ status: "accepted", inviteToken: null })
    .where(eq(schema.teamMembers.id, invite.id));

  await db
    .insert(schema.userProfiles)
    .values({ email, activeAccountId: invite.accountId })
    .onConflictDoUpdate({
      target: schema.userProfiles.email,
      set: { activeAccountId: invite.accountId },
    });

  return NextResponse.json({ ok: true, action });
}

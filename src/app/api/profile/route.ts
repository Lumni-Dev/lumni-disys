import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";

async function currentEmail() {
  const session = await auth();
  return session?.user?.email ?? null;
}

export async function GET() {
  const email = await currentEmail();
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [row] = await db
    .select()
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.email, email));

  return NextResponse.json({ photo: row?.avatarBase64 || null });
}

export async function PUT(req: Request) {
  const email = await currentEmail();
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const photo = typeof body.photo === "string" ? body.photo : "";

  await db
    .insert(schema.userProfiles)
    .values({ email, avatarBase64: photo })
    .onConflictDoUpdate({
      target: schema.userProfiles.email,
      set: { avatarBase64: photo },
    });

  return NextResponse.json({ photo: photo || null });
}

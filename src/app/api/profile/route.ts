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

  return NextResponse.json({
    photo: row?.avatarBase64 || null,
    theme: row?.theme || "white",
    name: row?.name || "",
    phone: row?.phone || "",
    role: row?.role || "",
  });
}

export async function PUT(req: Request) {
  const email = await currentEmail();
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // Update parcial: só altera os campos enviados, sem zerar os demais.
  const set: {
    avatarBase64?: string;
    theme?: string;
    name?: string;
    phone?: string;
    role?: string;
  } = {};
  if (typeof body.photo === "string") {
    // O cliente redimensiona antes de enviar; o teto aqui e so protecao.
    if (body.photo.length > 400_000)
      return NextResponse.json(
        { error: "Imagem muito grande" },
        { status: 413 },
      );
    set.avatarBase64 = body.photo;
  }
  if (typeof body.theme === "string") set.theme = body.theme;
  if (typeof body.name === "string") set.name = body.name;
  if (typeof body.phone === "string") set.phone = body.phone;
  if (typeof body.role === "string") set.role = body.role;

  await db
    .insert(schema.userProfiles)
    .values({
      email,
      avatarBase64: set.avatarBase64 ?? "",
      theme: set.theme ?? "white",
      name: set.name ?? "",
      phone: set.phone ?? "",
      role: set.role ?? "",
    })
    .onConflictDoUpdate({
      target: schema.userProfiles.email,
      set,
    });

  const [row] = await db
    .select()
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.email, email));

  return NextResponse.json({
    photo: row?.avatarBase64 || null,
    theme: row?.theme || "white",
    name: row?.name || "",
    phone: row?.phone || "",
    role: row?.role || "",
  });
}

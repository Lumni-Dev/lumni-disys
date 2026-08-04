import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { serializeCompany } from "@/db/serializers";
import { authorize } from "@/lib/authz";
import { openingsByCompany } from "@/lib/company";

export async function GET() {
  const { account, response } = await authorize("companies", "view");
  if (!account) return response;

  const rows = await db
    .select()
    .from(schema.companies)
    .where(eq(schema.companies.accountId, account.id))
    .orderBy(asc(schema.companies.id));

  // Vagas = soma das vagas "Aberta" vinculadas (por companyId) a cada empresa.
  const openings = await openingsByCompany(account.id);
  return NextResponse.json(
    rows.map((r) => serializeCompany(r, openings.get(r.id) ?? 0)),
  );
}

export async function POST(req: Request) {
  const { account, response } = await authorize("companies", "create");
  if (!account) return response;

  const body = await req.json();
  // openings nao vem mais do formulario: e calculado a partir das vagas.
  // Uma empresa recem-criada ainda nao tem vagas vinculadas por ID -> 0.
  const [row] = await db
    .insert(schema.companies)
    .values({
      accountId: account.id,
      name: body.name,
      sector: body.sector ?? "",
      location: body.location ?? "",
      status: body.status ?? "Ativa",
    })
    .returning();
  return NextResponse.json(serializeCompany(row, 0), { status: 201 });
}

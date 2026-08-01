import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { currentAccount } from "@/lib/account";

const STAGES = [
  "Triagem",
  "Entrevista RH",
  "Teste técnico",
  "Entrevista final",
  "Proposta",
];

export async function GET() {
  const account = await currentAccount();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cards = await db
    .select()
    .from(schema.pipelineCards)
    .where(eq(schema.pipelineCards.accountId, account.id))
    .orderBy(asc(schema.pipelineCards.position), asc(schema.pipelineCards.id));

  const columns = STAGES.map((stage) => ({
    stage,
    cards: cards
      .filter((c) => c.stage === stage)
      .map((c) => ({ id: c.id, name: c.name, job: c.job, company: c.company })),
  }));

  return NextResponse.json(columns);
}

export async function POST(req: Request) {
  const account = await currentAccount();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const stage = body.stage ?? STAGES[0];

  const inStage = await db
    .select()
    .from(schema.pipelineCards)
    .where(
      and(
        eq(schema.pipelineCards.accountId, account.id),
        eq(schema.pipelineCards.stage, stage),
      ),
    );

  const [row] = await db
    .insert(schema.pipelineCards)
    .values({
      accountId: account.id,
      name: body.name,
      job: body.job ?? "",
      company: body.company ?? "",
      stage,
      position: inStage.length,
    })
    .returning();

  return NextResponse.json(
    { id: row.id, name: row.name, job: row.job, company: row.company, stage },
    { status: 201 },
  );
}

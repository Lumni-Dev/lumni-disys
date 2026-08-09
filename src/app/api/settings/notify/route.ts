import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { authorize } from "@/lib/authz";

// Le/atualiza o toggle de notificacao por e-mail (a cada mudanca de etapa)
// do workspace ativo.
export async function GET() {
  const { account, response } = await authorize("pipeline", "view");
  if (!account) return response;

  const [row] = await db
    .select({ notify: schema.accounts.notifyStageChange })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, account.id));

  return NextResponse.json({ notifyStageChange: row?.notify ?? false });
}

export async function PUT(req: Request) {
  const { account, response } = await authorize("pipeline", "edit");
  if (!account) return response;

  const body = await req.json();
  const notify = body.notifyStageChange === true;

  await db
    .update(schema.accounts)
    .set({ notifyStageChange: notify })
    .where(eq(schema.accounts.id, account.id));

  return NextResponse.json({ notifyStageChange: notify });
}

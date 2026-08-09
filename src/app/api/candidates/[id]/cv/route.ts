import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { authorize } from "@/lib/authz";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { account, response } = await authorize("candidates", "view");
  if (!account) return response;

  const id = Number((await params).id);
  const [row] = await db
    .select({
      cvName: schema.candidates.cvName,
      cvBase64: schema.candidates.cvBase64,
    })
    .from(schema.candidates)
    .where(
      and(
        eq(schema.candidates.id, id),
        eq(schema.candidates.accountId, account.id),
      ),
    );
  if (!row?.cvBase64)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const match = row.cvBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (!match)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const file = Buffer.from(match[2], "base64");
  const name = (row.cvName || "curriculo").replace(/["\r\n]/g, "");
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": match[1],
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}

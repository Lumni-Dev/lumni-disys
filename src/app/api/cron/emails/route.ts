import { NextResponse } from "next/server";
import { and, asc, eq, lt } from "drizzle-orm";
import { db, schema } from "@/db";
import { sendRawEmail } from "@/lib/mail";

const BATCH = 40;
const MAX_ATTEMPTS = 5;

// Worker da fila (outbox) de e-mails: processa um lote por execucao e deixa o
// restante para a proxima passada do cron. Isso evita picos no SMTP quando
// muitos candidatos mudam de etapa ao mesmo tempo. Protegido por CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pending = await db
    .select()
    .from(schema.emailOutbox)
    .where(
      and(
        eq(schema.emailOutbox.status, "pending"),
        lt(schema.emailOutbox.attempts, MAX_ATTEMPTS),
      ),
    )
    .orderBy(asc(schema.emailOutbox.id))
    .limit(BATCH);

  let sent = 0;
  let failed = 0;

  for (const row of pending) {
    try {
      const ok = await sendRawEmail({
        to: row.toEmail,
        subject: row.subject,
        html: row.html,
        text: row.bodyText,
      });
      // SMTP nao configurado: para o lote sem consumir tentativas.
      if (!ok) break;
      await db
        .update(schema.emailOutbox)
        .set({ status: "sent", attempts: row.attempts + 1 })
        .where(eq(schema.emailOutbox.id, row.id));
      sent += 1;
    } catch {
      const attempts = row.attempts + 1;
      await db
        .update(schema.emailOutbox)
        .set({
          attempts,
          status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
        })
        .where(eq(schema.emailOutbox.id, row.id));
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, processed: pending.length, sent, failed });
}

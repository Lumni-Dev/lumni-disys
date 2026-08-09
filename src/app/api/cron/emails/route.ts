import { NextResponse } from "next/server";
import { and, asc, eq, lt } from "drizzle-orm";
import { db, schema } from "@/db";
import { sendRawEmail } from "@/lib/mail";

const BATCH = 200;
const MAX_ATTEMPTS = 5;

// Rede de seguranca (diaria): reprocessa e-mails que ficaram pendentes (o envio
// em segundo plano via after() nao concluiu) ou que falharam antes do limite de
// tentativas. O caminho normal ja envia na hora; aqui so limpamos o que sobrou.
// Protegido por CRON_SECRET.
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

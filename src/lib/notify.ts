import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { sendRawEmail } from "@/lib/mail";

export type StageEmailKind = "stage" | "removed";

const MAX_ATTEMPTS = 5;

// Casca do e-mail no mesmo design do mail.ts (padrao DISYS, dark).
function shell(titleLine: string, bodyLine: string): string {
  return `
  <div style="margin:0;padding:32px 16px;background:#0a0a0b;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#101012;border:1px solid #26262a;border-radius:6px;overflow:hidden;">
      <div style="padding:24px;text-align:center;border-bottom:1px solid #1d1d20;">
        <span style="font-size:22px;letter-spacing:0.3em;color:#ffffff;">DISYS</span>
      </div>
      <div style="padding:24px;color:#d4d4d8;font-size:14px;line-height:1.6;">
        <p style="margin:0 0 12px;color:#ffffff;font-size:16px;font-weight:bold;">
          ${titleLine}
        </p>
        <p style="margin:0;">${bodyLine}</p>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #1d1d20;color:#7c7c85;font-size:11px;text-align:center;">
        DISYS · disys.lumni.dev.br
      </div>
    </div>
  </div>`;
}

export function stageEmail(opts: {
  name: string;
  jobTitle: string;
  stageLabel: string;
  kind: StageEmailKind;
}): { subject: string; html: string; text: string } {
  const first = (opts.name || "").trim().split(/\s+/)[0] || "Ola";
  const forJob = opts.jobTitle ? ` para a vaga "${opts.jobTitle}"` : "";

  if (opts.kind === "removed") {
    const subject = "Atualizacao da sua candidatura no DISYS";
    const title = "Atualizacao da sua candidatura";
    const body = `Ola ${first}, sua candidatura${forJob} foi encerrada. Isso pode acontecer por indisponibilidade da vaga ou por nao ter avancado para a proxima etapa do processo. Agradecemos muito o seu interesse e desejamos sucesso.`;
    return { subject, html: shell(title, body), text: `${title}. ${body}` };
  }

  const subject = `Sua candidatura mudou de etapa: ${opts.stageLabel}`;
  const title = "Sua candidatura mudou de etapa";
  const body = `Ola ${first}, sua candidatura${forJob} mudou para a etapa: <strong style="color:#ffffff;">${opts.stageLabel}</strong>. Em breve entraremos em contato com os proximos passos.`;
  const text = `Ola ${first}, sua candidatura${forJob} mudou para a etapa: ${opts.stageLabel}.`;
  return { subject, html: shell(title, body), text };
}

// Enfileira o e-mail (outbox) somente se o workspace tiver a notificacao ligada
// e o candidato tiver e-mail. Retorna o id da linha na fila (ou null quando nao
// enfileirou). O envio nao acontece aqui: a rota agenda flushOutboxRow com
// after() (fora da request) e o cron diario reprocessa o que sobrar/falhar.
export async function enqueueStageEmail(opts: {
  accountId: number;
  candidateId: number | null;
  stageLabel: string;
  kind: StageEmailKind;
}): Promise<number | null> {
  if (!opts.candidateId) return null;
  const [acc] = await db
    .select({ notify: schema.accounts.notifyStageChange })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, opts.accountId));
  if (!acc?.notify) return null;

  const [cand] = await db
    .select({
      name: schema.candidates.name,
      email: schema.candidates.email,
      role: schema.candidates.role,
    })
    .from(schema.candidates)
    .where(
      and(
        eq(schema.candidates.id, opts.candidateId),
        eq(schema.candidates.accountId, opts.accountId),
      ),
    );
  if (!cand?.email) return null;

  const { subject, html, text } = stageEmail({
    name: cand.name,
    jobTitle: cand.role,
    stageLabel: opts.stageLabel,
    kind: opts.kind,
  });
  const [row] = await db
    .insert(schema.emailOutbox)
    .values({ toEmail: cand.email, subject, html, bodyText: text })
    .returning({ id: schema.emailOutbox.id });
  return row?.id ?? null;
}

// Envia uma linha da fila em segundo plano (via after()), fora da request.
// Nao lanca: falha so incrementa attempts para o cron diario tentar de novo.
export async function flushOutboxRow(id: number): Promise<void> {
  const [row] = await db
    .select()
    .from(schema.emailOutbox)
    .where(eq(schema.emailOutbox.id, id));
  if (!row || row.status !== "pending") return;

  try {
    const ok = await sendRawEmail({
      to: row.toEmail,
      subject: row.subject,
      html: row.html,
      text: row.bodyText,
    });
    if (!ok) return;
    await db
      .update(schema.emailOutbox)
      .set({ status: "sent", attempts: row.attempts + 1 })
      .where(eq(schema.emailOutbox.id, id));
  } catch {
    const attempts = row.attempts + 1;
    await db
      .update(schema.emailOutbox)
      .set({
        attempts,
        status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
      })
      .where(eq(schema.emailOutbox.id, id));
  }
}

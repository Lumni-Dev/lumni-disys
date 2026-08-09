import nodemailer from "nodemailer";

function transporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user, pass },
  });
}

export async function sendInviteEmail(opts: {
  to: string;
  inviterName: string;
  url: string;
}): Promise<boolean> {
  const t = transporter();
  if (!t) return false;

  const { to, inviterName, url } = opts;
  const html = `
  <div style="margin:0;padding:32px 16px;background:#0a0a0b;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#101012;border:1px solid #26262a;border-radius:6px;overflow:hidden;">
      <div style="padding:24px;text-align:center;border-bottom:1px solid #1d1d20;">
        <span style="font-size:22px;letter-spacing:0.3em;color:#ffffff;">DISYS</span>
      </div>
      <div style="padding:24px;color:#d4d4d8;font-size:14px;line-height:1.6;">
        <p style="margin:0 0 12px;color:#ffffff;font-size:16px;font-weight:bold;">
          Voce foi convidado(a) para um workspace
        </p>
        <p style="margin:0 0 20px;">
          <strong style="color:#ffffff;">${inviterName}</strong> convidou voce para
          colaborar no workspace dele no DISYS, o sistema de recrutamento e
          selecao da Lumni.
        </p>
        <p style="margin:0 0 24px;">
          Para aceitar ou recusar, entre com este e-mail e abra o convite:
        </p>
        <p style="margin:0 0 24px;text-align:center;">
          <a href="${url}" style="display:inline-block;background:#ffffff;color:#0a0a0b;text-decoration:none;font-weight:bold;padding:10px 24px;border-radius:6px;">
            Ver convite
          </a>
        </p>
        <p style="margin:0;color:#7c7c85;font-size:12px;">
          Se voce nao esperava este convite, pode ignorar este e-mail.
        </p>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #1d1d20;color:#7c7c85;font-size:11px;text-align:center;">
        DISYS · disys.lumni.dev.br
      </div>
    </div>
  </div>`;

  await t.sendMail({
    from: `"DISYS" <${process.env.SMTP_USER}>`,
    to,
    subject: `${inviterName} convidou voce para um workspace no DISYS`,
    html,
    text: `${inviterName} convidou voce para colaborar em um workspace no DISYS. Abra o convite: ${url}`,
  });
  return true;
}

// E-mail de confirmacao dos direitos LGPD (exportar/excluir dados).
export async function sendDataRightsEmail(opts: {
  to: string;
  url: string;
  kind: "export" | "delete";
}): Promise<boolean> {
  const t = transporter();
  if (!t) return false;

  const { to, url, kind } = opts;
  const isDelete = kind === "delete";
  const action = isDelete ? "excluir" : "exportar";
  const cta = isDelete ? "Confirmar exclusao" : "Exportar meus dados";
  const html = `
  <div style="margin:0;padding:32px 16px;background:#0a0a0b;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#101012;border:1px solid #26262a;border-radius:6px;overflow:hidden;">
      <div style="padding:24px;text-align:center;border-bottom:1px solid #1d1d20;">
        <span style="font-size:22px;letter-spacing:0.3em;color:#ffffff;">DISYS</span>
      </div>
      <div style="padding:24px;color:#d4d4d8;font-size:14px;line-height:1.6;">
        <p style="margin:0 0 12px;color:#ffffff;font-size:16px;font-weight:bold;">
          Solicitacao dos seus dados
        </p>
        <p style="margin:0 0 24px;">
          Recebemos um pedido para ${action} os dados associados a este e-mail.
          Para confirmar, clique no botao abaixo. O link expira em 1 hora.
        </p>
        <p style="margin:0 0 24px;text-align:center;">
          <a href="${url}" style="display:inline-block;background:#ffffff;color:#0a0a0b;text-decoration:none;font-weight:bold;padding:10px 24px;border-radius:6px;">
            ${cta}
          </a>
        </p>
        <p style="margin:0;color:#7c7c85;font-size:12px;">
          Se voce nao fez esta solicitacao, ignore este e-mail.
        </p>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #1d1d20;color:#7c7c85;font-size:11px;text-align:center;">
        DISYS · disys.lumni.dev.br
      </div>
    </div>
  </div>`;

  await t.sendMail({
    from: `"DISYS" <${process.env.SMTP_USER}>`,
    to,
    subject: isDelete
      ? "Confirme a exclusao dos seus dados no DISYS"
      : "Confirme a exportacao dos seus dados no DISYS",
    html,
    text: `Para ${action} seus dados, acesse: ${url} (o link expira em 1 hora).`,
  });
  return true;
}

// E-mails com acesso de super-admin: visao somente leitura de qualquer
// workspace, sem aparecer na lista de colaboradores de ninguem. Configurado
// por variavel de ambiente (SUPERADMIN_EMAILS, separada por virgula) para
// ficar fora do Git e poder mudar sem alterar o codigo.
const SUPERADMINS = new Set(
  (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

/** O e-mail e super-admin do sistema? (comparacao sem diferenciar maiusculas) */
export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPERADMINS.has(email.toLowerCase());
}

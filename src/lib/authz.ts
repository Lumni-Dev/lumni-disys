import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { accountForEmail, type Account } from "@/lib/account";
import type { Action } from "@/lib/permissions";

type Authz =
  | { account: Account; response: null }
  | { account: null; response: NextResponse };

/**
 * Autorizacao por modulo/acao: o dono do workspace pode tudo; colaborador
 * precisa da permissao correspondente (definida na tela de Colaboradores).
 * Retorna a conta quando autorizado, ou a resposta de erro pronta (401/403).
 */
export async function authorize(
  module: string,
  action: Action,
): Promise<Authz> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email)
    return {
      account: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };

  const account = await accountForEmail(email);

  // Dono da conta: acesso total.
  const [own] = await db
    .select({ id: schema.accounts.id })
    .from(schema.accounts)
    .where(eq(schema.accounts.ownerEmail, email));
  if (own?.id === account.id) return { account, response: null };

  // Colaborador (convite aceito): precisa da permissao do modulo/acao.
  const [member] = await db
    .select({ id: schema.teamMembers.id })
    .from(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.email, email),
        eq(schema.teamMembers.accountId, account.id),
        eq(schema.teamMembers.status, "accepted"),
      ),
    );
  if (member) {
    const [perm] = await db
      .select({ id: schema.memberPermissions.id })
      .from(schema.memberPermissions)
      .where(
        and(
          eq(schema.memberPermissions.memberId, member.id),
          eq(schema.memberPermissions.module, module),
          eq(schema.memberPermissions.action, action),
        ),
      );
    if (perm) return { account, response: null };
  }

  return {
    account: null,
    response: NextResponse.json({ error: "Sem permissao" }, { status: 403 }),
  };
}

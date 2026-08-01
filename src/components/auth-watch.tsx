"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Fecha a brecha do voltar/avançar do navegador (bfcache).
 *
 * O proxy protege as rotas, mas só roda quando há um request de verdade. No
 * back/forward o navegador restaura a página autenticada direto do bfcache, sem
 * passar pelo servidor, então o dashboard antigo (com o nome do usuário)
 * reaparece mesmo depois do logout.
 */
export function AuthWatch() {
  const { status } = useSession();

  // Sessão caiu (logout aqui ou em outra aba): sai do sistema.
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace("/login");
    }
  }, [status]);

  // Página restaurada do bfcache: força um request real para o proxy
  // reavaliar a sessão e mandar para /login quando ela não existe mais.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

// Acesso do usuario logado: dono do workspace ou colaborador, e quais
// modulos ele pode ver (permissao "view"). Cacheado no modulo para o
// sidebar e a pagina de conta compartilharem a mesma requisicao.

export type Access = { token: string; owner: boolean; modules: string[] };

let cached: Promise<Access> | null = null;

export function fetchAccess(): Promise<Access> {
  cached ??= api.get<Access>("/api/account").catch((err) => {
    // Falhou (ex.: sessao expirada): permite tentar de novo depois.
    cached = null;
    throw err;
  });
  return cached;
}

/** Acesso do usuario atual, ou null enquanto carrega. */
export function useAccess(): Access | null {
  const [access, setAccess] = useState<Access | null>(null);
  useEffect(() => {
    let alive = true;
    fetchAccess()
      .then((a) => {
        if (alive) setAccess(a);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return access;
}

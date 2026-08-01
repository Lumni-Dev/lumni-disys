"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  STORAGE_KEY,
  isLocale,
  localeDir,
  type LocaleCode,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Landing } from "@/i18n/types";

// Store externo simples para o idioma: fonte da verdade e o localStorage,
// com useSyncExternalStore lendo dele (sem mismatch de hidratacao e sem
// setState dentro de effect).
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  // Sincroniza entre abas.
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): LocaleCode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

function getServerSnapshot(): LocaleCode {
  return DEFAULT_LOCALE;
}

function persistLocale(code: LocaleCode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // localStorage indisponivel (modo privado/etc.).
  }
  // O evento "storage" nao dispara na aba que escreveu: notifica na mao.
  listeners.forEach((l) => l());
}

interface I18nValue {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  dict: Landing;
  locales: typeof LOCALES;
}

const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n precisa estar dentro de <LanguageProvider>");
  return ctx;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDir(locale);
  }, [locale]);

  const setLocale = useCallback((code: LocaleCode) => persistLocale(code), []);

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, dict: getDictionary(locale), locales: LOCALES }}
    >
      {children}
    </I18nContext.Provider>
  );
}

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
  LOCALES,
  STORAGE_KEY,
  isLocale,
  localeDir,
  type LocaleCode,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getAdmin } from "@/i18n/dictionaries/admin";
import type { Admin, Landing } from "@/i18n/types";

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);

  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

const FALLBACK_LOCALE: LocaleCode = "en";

function detectBrowserLocale(): LocaleCode | null {
  if (typeof navigator === "undefined") return null;
  const langs =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];
  for (const lang of langs) {
    if (!lang) continue;
    const primary = lang.toLowerCase().split("-")[0];
    const match = LOCALES.find((loc) => loc.code === primary);
    if (match) return match.code;
  }
  return null;
}

function getSnapshot(): LocaleCode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isLocale(stored)) return stored;
  return detectBrowserLocale() ?? FALLBACK_LOCALE;
}

function getServerSnapshot(): LocaleCode {
  return FALLBACK_LOCALE;
}

function persistLocale(code: LocaleCode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {

  }

  listeners.forEach((l) => l());
}

interface I18nValue {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  dict: Landing;
  admin: Admin;
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
      value={{
        locale,
        setLocale,
        dict: getDictionary(locale),
        admin: getAdmin(locale),
        locales: LOCALES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

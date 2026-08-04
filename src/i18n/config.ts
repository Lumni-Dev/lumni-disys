export const LOCALES = [
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "nl", label: "Nederlands", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
  { code: "ko", label: "한국어", dir: "ltr" },
  { code: "zh", label: "中文", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

/** Chave usada no localStorage para lembrar o idioma escolhido. */
export const STORAGE_KEY = "disys.lang";

export function isLocale(value: unknown): value is LocaleCode {
  return (
    typeof value === "string" &&
    LOCALES.some((locale) => locale.code === value)
  );
}

export function localeDir(code: LocaleCode): "ltr" | "rtl" {
  return LOCALES.find((locale) => locale.code === code)?.dir ?? "ltr";
}

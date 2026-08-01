import type { LocaleCode } from "@/i18n/config";
import type { Landing } from "@/i18n/types";

import pt from "./pt";
import en from "./en";
import es from "./es";
import de from "./de";
import fr from "./fr";
import it from "./it";
import nl from "./nl";
import ru from "./ru";
import ja from "./ja";
import ko from "./ko";
import zh from "./zh";
import ar from "./ar";

export const DICTIONARIES: Record<LocaleCode, Landing> = {
  pt,
  en,
  es,
  de,
  fr,
  it,
  nl,
  ru,
  ja,
  ko,
  zh,
  ar,
};

export function getDictionary(locale: LocaleCode): Landing {
  return DICTIONARIES[locale] ?? DICTIONARIES.pt;
}

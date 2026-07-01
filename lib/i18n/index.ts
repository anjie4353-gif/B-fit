import type { AppLanguage } from "@/types";
import { en } from "./locales/en";
import { te } from "./locales/te";
import { hi } from "./locales/hi";
import { ta } from "./locales/ta";
import { kn } from "./locales/kn";
import { ml } from "./locales/ml";
import type { TranslationDict } from "./types";

const dictionaries: Record<AppLanguage, TranslationDict> = {
  en,
  te,
  hi,
  ta,
  kn,
  ml,
};

export function getDictionary(lang: AppLanguage): TranslationDict {
  return dictionaries[lang] ?? dictionaries.en;
}

export function tPath(
  dict: TranslationDict,
  path: string
): string {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}

export { SUPPORTED_LANGUAGES } from "./types";
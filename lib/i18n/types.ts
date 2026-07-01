import type { AppLanguage } from "@/types";
import type { en } from "./locales/en";

type DeepStringDict<T> = T extends string
  ? string
  : T extends Record<string, unknown>
    ? { [K in keyof T]: DeepStringDict<T[K]> }
    : string;

export type TranslationDict = DeepStringDict<typeof en>;

export const SUPPORTED_LANGUAGES: {
  code: AppLanguage;
  nativeName: string;
  englishName: string;
}[] = [
  { code: "en", nativeName: "English", englishName: "English" },
  { code: "te", nativeName: "తెలుగు", englishName: "Telugu" },
  { code: "hi", nativeName: "हिन्दी", englishName: "Hindi" },
  { code: "ta", nativeName: "தமிழ்", englishName: "Tamil" },
  { code: "kn", nativeName: "ಕನ್ನಡ", englishName: "Kannada" },
  { code: "ml", nativeName: "മലയാളം", englishName: "Malayalam" },
];
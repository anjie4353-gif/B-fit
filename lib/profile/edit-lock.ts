import { differenceInDays, parseISO } from "date-fns";

export const PROFILE_EDIT_LOCK_DAYS = 90;

export function daysSinceActivation(dateIso: string | undefined | null): number {
  if (!dateIso) return 0;
  try {
    return Math.max(0, differenceInDays(new Date(), parseISO(dateIso)));
  } catch {
    return 0;
  }
}

export function canEditProfile(registeredAt: string | undefined | null): boolean {
  return daysSinceActivation(registeredAt) >= PROFILE_EDIT_LOCK_DAYS;
}

/** Language is always changeable from Profile after first setup. */
export function canChangeLanguage(consentGiven: boolean | undefined): boolean {
  return Boolean(consentGiven);
}

export function daysUntilEditUnlock(registeredAt: string | undefined | null): number {
  const elapsed = daysSinceActivation(registeredAt);
  return Math.max(0, PROFILE_EDIT_LOCK_DAYS - elapsed);
}

export function getEditLockMessage(locale: string): string {
  const messages: Record<string, string> = {
    en: "Profile editing will be available after 90 days of account activation.",
    te: "ఖాతా సక్రియం అయిన 90 రోజుల తర్వాత ప్రొఫైల్ సవరణ అందుబాటులో ఉంటుంది.",
    hi: "खाता सक्रिय होने के 90 दिनों के बाद प्रोफ़ाइल संपादन उपलब्ध होगा।",
    ta: "கணக்கு செயல்படுத்தப்பட்ட 90 நாட்களுக்குப் பிறகு சுயவிவரத் திருத்தம் கிடைக்கும்.",
    kn: "ಖಾತೆ ಸಕ್ರಿಯಗೊಂಡ 90 ದಿನಗಳ ನಂತರ ಪ್ರೊಫೈಲ್ ಸಂಪಾದನೆ ಲಭ್ಯವಾಗುತ್ತದೆ.",
    ml: "അക്കൗണ്ട് സജീവമാക്കി 90 ദിവസത്തിന് ശേഷം പ്രൊഫൈൽ എഡിറ്റിംഗ് ലഭ്യമാകും.",
  };
  return messages[locale] ?? messages.en;
}
import { getRegionFromState, getRegionalFoodHint } from "@/lib/bharat-coach";
import type { UserProfile } from "@/types";

export const HERWELL_MEDICAL_DISCLAIMER =
  "This information is educational and does not replace professional medical advice.";

export const HERWELL_SYSTEM_PROMPT = `You are B-Fit Women's Coach, an evidence-based women's health and wellness assistant on the B-Fit app, designed specifically for Indian women.

MISSION:
Help women improve:
* Hormonal health
* Period health
* Lifestyle habits
* Nutrition
* PCOS/PCOD management support
* Sleep
* Fitness
* Stress reduction

You are NOT a doctor.

You must never:
* Diagnose conditions
* Prescribe medicines
* Replace healthcare professionals

Always include:
"This information is educational and does not replace professional medical advice."

REGIONAL FOOD ADAPTATION:
South India: Ragi, Millets, Idli, Sambar
North India: Dal, Roti, Paneer
West India: Bajra, Jowar
East India: Fish, Seasonal vegetables
Central India: Wheat roti, dal, seasonal sabzi

PERIOD SUPPORT (mild discomfort only):
Suggest: Hydration, gentle stretching, walking, heating pad, ginger tea.
Never recommend medication.

DAILY SCHEDULE REFERENCE:
6:00 AM — Wake, hydration, sunlight
7:30 AM — Balanced breakfast with protein
10:00 AM — Water reminder
1:00 PM — Balanced lunch
4:00 PM — Healthy snack
6:00 PM — Walk or exercise 30-45 min
8:00 PM — Light dinner
10:00 PM — Sleep preparation
10:30 PM — Sleep target 7-9 hours

WHATSAPP RESPONSE FORMAT:
Today's Wellness Score | Hydration Goal | Movement Goal | Nutrition Recommendation | Cycle Update | Sleep Goal | Motivation Message

Maximum 150 words per response. Be friendly, practical, empathetic, and Indian-context aware.`;

export const PREGNANCY_STATUS_LABELS = {
  not_pregnant: "Not pregnant",
  pregnant: "Currently pregnant",
  trying: "Trying to conceive",
  postpartum: "Postpartum",
  prefer_not_say: "Prefer not to say",
} as const;

export function buildFemaleUserContext(profile?: Partial<UserProfile>): string {
  if (!profile) return "";

  const parts: string[] = [];
  if (profile.age) parts.push(`Age: ${profile.age}`);
  if (profile.height) parts.push(`Height: ${profile.height}cm`);
  if (profile.weight) parts.push(`Weight: ${profile.weight}kg`);
  if (profile.activityLevel) parts.push(`Activity level: ${profile.activityLevel}`);

  const f = profile.femaleProfile;
  if (f) {
    parts.push(`City: ${f.city}`);
    parts.push(`State: ${f.state}`);
    const region = f.region ?? getRegionFromState(f.state);
    parts.push(`Region: ${region}`);
    parts.push(`Diet: ${f.dietType}`);
    parts.push(`Regional foods: ${getRegionalFoodHint(region)}`);
    parts.push(`PCOS/PCOD: ${f.pcosStatus ? "Yes" : "No"}`);
    if (f.medications) parts.push(`Medications: ${f.medications}`);
    parts.push(`Pregnancy status: ${f.pregnancyStatus}`);
  } else if (profile.pcod?.hasPcod) {
    parts.push("PCOS/PCOD: Yes");
    if (profile.pcod.medicationDetails)
      parts.push(`Medications: ${profile.pcod.medicationDetails}`);
  }

  if (profile.lastPeriodDate) parts.push(`Last period: ${profile.lastPeriodDate}`);
  if (profile.cycleLength)
    parts.push(`Cycle length: ${profile.cycleLength}${profile.cycleLength === "irregular" ? "" : " days"}`);

  return parts.length ? `\nUser profile:\n${parts.join("\n")}` : "";
}
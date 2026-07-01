import { BHARAT_MEN_SYSTEM_PROMPT } from "@/lib/bharat-coach";
import { HERWELL_SYSTEM_PROMPT } from "@/lib/herwell-coach";
import { DOCTOR_COACH_RULES } from "@/lib/coach/doctor-rules";

const MALE_EMERGENCY_PATTERNS = [
  /severe\s+bleeding/i,
  /fainting/i,
  /passed\s+out/i,
  /loss\s+of\s+consciousness/i,
  /unconscious/i,
  /severe\s+dizziness/i,
  /suicidal/i,
  /kill\s+myself/i,
  /want\s+to\s+die/i,
  /self[\s-]?harm/i,
  /chest\s+pain/i,
  /difficulty\s+breathing/i,
  /can'?t\s+breathe/i,
  /shortness\s+of\s+breath/i,
];

const FEMALE_EMERGENCY_PATTERNS = [
  /very\s+heavy\s+bleeding/i,
  /severe\s+bleeding/i,
  /heavy\s+bleeding/i,
  /severe\s+abdominal\s+pain/i,
  /severe\s+stomach\s+pain/i,
  /fainting/i,
  /passed\s+out/i,
  /pregnancy\s+complication/i,
  /miscarriage/i,
  /suicidal/i,
  /kill\s+myself/i,
  /want\s+to\s+die/i,
  /self[\s-]?harm/i,
];

export const EMERGENCY_RESPONSE_MALE =
  "This may require urgent medical attention. Please seek emergency medical care immediately. I'm pausing coaching until you confirm you're safe. Reply 'I'm safe' when ready.";

export const EMERGENCY_RESPONSE_FEMALE =
  "This may require urgent medical attention. Please contact a healthcare professional or emergency services immediately. I'm pausing coaching until you confirm you're safe. Reply 'I'm safe' when ready.";

export const EMERGENCY_RESPONSE = EMERGENCY_RESPONSE_FEMALE;

export function getEmergencyResponse(gender?: string): string {
  return gender === "male" ? EMERGENCY_RESPONSE_MALE : EMERGENCY_RESPONSE_FEMALE;
}

export function getSystemPrompt(gender?: string): string {
  const base = gender === "male" ? BHARAT_MEN_SYSTEM_PROMPT : HERWELL_SYSTEM_PROMPT;
  return `${base}\n\n${DOCTOR_COACH_RULES}`;
}

export const MEDICAL_DISCLAIMER =
  "This information is educational and does not replace professional medical advice.";

export const PCOD_AVOID_FOODS = [
  "refined sugar",
  "sugary beverages",
  "excess sweets",
  "white flour products",
  "highly processed foods",
];

export const PCOD_PREFER_FOODS = [
  "high protein meals",
  "fiber-rich foods",
  "millets",
  "seeds",
  "nuts",
  "vegetables",
  "low glycemic foods",
];

export function detectEmergency(message: string, gender?: string): boolean {
  const patterns =
    gender === "male" ? MALE_EMERGENCY_PATTERNS : FEMALE_EMERGENCY_PATTERNS;
  return patterns.some((pattern) => pattern.test(message));
}

export function isSafetyConfirmation(message: string): boolean {
  return /i'?m\s+safe|i\s+am\s+safe|feeling\s+better|i'?m\s+okay/i.test(
    message.trim()
  );
}

export function getPCODSafetyPrompt(hasPcod: boolean): string {
  if (!hasPcod) return "";

  return `
PCOS/PCOD RULES (STRICT):
If PCOS or PCOD is true, NEVER recommend: ${PCOD_AVOID_FOODS.join(", ")}.
PREFER: ${PCOD_PREFER_FOODS.join(", ")}.
For period discomfort: suggest hydration, gentle stretching, walking, heating pad, ginger tea. NEVER recommend medication.
`;
}
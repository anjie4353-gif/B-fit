import {
  buildMaleUserContext,
  BHARAT_MEDICAL_DISCLAIMER,
} from "@/lib/bharat-coach";
import {
  buildFemaleUserContext,
  HERWELL_MEDICAL_DISCLAIMER,
} from "@/lib/herwell-coach";
import {
  getSystemPrompt,
  getPCODSafetyPrompt,
} from "@/lib/safety";
import type { UserProfile } from "@/types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callGroq(
  messages: GroqMessage[],
  maxTokens = 220
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "I'm here to help. Could you rephrase that?";
}

function buildUserContext(profile?: Partial<UserProfile>): string {
  if (profile?.gender === "male") return buildMaleUserContext(profile);
  return buildFemaleUserContext(profile);
}

function getDisclaimer(gender?: string): string {
  return gender === "male" ? BHARAT_MEDICAL_DISCLAIMER : HERWELL_MEDICAL_DISCLAIMER;
}

function hasPcos(profile?: Partial<UserProfile>): boolean {
  return (
    profile?.femaleProfile?.pcosStatus ??
    profile?.pcod?.hasPcod ??
    false
  );
}

export async function generateDietPlan(
  profile: Partial<UserProfile>
): Promise<string> {
  const isMale = profile.gender === "male";
  const pcodRules = getPCODSafetyPrompt(hasPcos(profile));

  return callGroq([
    {
      role: "system",
      content: `${getSystemPrompt(profile.gender)}${isMale ? "" : pcodRules}${buildUserContext(profile)}`,
    },
    {
      role: "user",
      content: isMale
        ? "Create a 1-day Indian meal plan (breakfast, lunch, dinner, 1 snack) suited to my region, diet type, and fitness goal. Under 150 words."
        : "Create a 1-day Indian women's meal plan (breakfast, lunch, dinner, snack) with regional foods and protein at breakfast. PCOS-friendly if applicable. Under 150 words.",
    },
  ]);
}

export async function generatePeriodAdvice(
  profile: Partial<UserProfile>,
  phase?: string
): Promise<string> {
  const pcodRules = getPCODSafetyPrompt(hasPcos(profile));
  return callGroq([
    {
      role: "system",
      content: `${getSystemPrompt(profile.gender)}${pcodRules}${buildUserContext(profile)}`,
    },
    {
      role: "user",
      content: `Give period wellness advice for ${phase ?? "current"} phase. Include hydration, iron foods, gentle exercise, heating pad, ginger tea for mild discomfort. Never suggest medication. Under 150 words.`,
    },
  ]);
}

export async function generatePCODAdvice(
  profile: Partial<UserProfile>
): Promise<string> {
  const pcodRules = getPCODSafetyPrompt(true);
  return callGroq([
    {
      role: "system",
      content: `${getSystemPrompt(profile.gender)}${pcodRules}${buildUserContext(profile)}`,
    },
    {
      role: "user",
      content:
        "Share 5 practical PCOS/PCOD lifestyle tips for Indian women — nutrition (millets, low GI), movement, stress, sleep. Under 150 words.",
    },
  ]);
}

export async function generateMotivationMessage(
  profile?: Partial<UserProfile>
): Promise<string> {
  const isMale = profile?.gender === "male";
  return callGroq([
    {
      role: "system",
      content: `${getSystemPrompt(profile?.gender)}${buildUserContext(profile)}`,
    },
    {
      role: "user",
      content: isMale
        ? "Write uplifting morning motivation for an Indian man. One achievable win today. Under 80 words."
        : "Write uplifting morning motivation for an Indian woman. One achievable win today. Under 80 words.",
    },
  ]);
}

export async function generateDailyHealthSummary(
  profile: Partial<UserProfile>,
  logSummary: string
): Promise<string> {
  const isMale = profile.gender === "male";
  const pcodRules = getPCODSafetyPrompt(hasPcos(profile));

  return callGroq([
    {
      role: "system",
      content: `${getSystemPrompt(profile.gender)}${isMale ? "" : pcodRules}${buildUserContext(profile)}`,
    },
    {
      role: "user",
      content: isMale
        ? `Daily summary: Daily Plan, Nutrition Tip, Hydration, Steps, Sleep, Stress Tip, Motivation. Under 150 words.\n${logSummary}`
        : `Today's Wellness Score, Hydration Goal, Movement Goal, Nutrition Recommendation, Cycle Update, Sleep Goal, Motivation. Under 150 words.\n${logSummary}`,
    },
  ]);
}

export async function generateMenDailyPlan(
  profile: Partial<UserProfile>
): Promise<string> {
  return callGroq([
    {
      role: "system",
      content: `${getSystemPrompt("male")}${buildUserContext(profile)}`,
    },
    {
      role: "user",
      content:
        "Create my daily wellness plan: Daily Plan, Nutrition Tips, Hydration Goal, Step Goal, Sleep Goal, Stress Tip, Motivation. Indian context. Under 150 words.",
    },
  ]);
}

export async function generateWomenDailyPlan(
  profile: Partial<UserProfile>
): Promise<string> {
  const pcodRules = getPCODSafetyPrompt(hasPcos(profile));
  return callGroq([
    {
      role: "system",
      content: `${getSystemPrompt("female")}${pcodRules}${buildUserContext(profile)}`,
    },
    {
      role: "user",
      content:
        "Create my daily wellness plan: Today's Wellness Score, Hydration Goal, Movement Goal, Nutrition Recommendation, Cycle Update, Sleep Goal, Motivation Message. Indian regional foods. Under 150 words.",
    },
  ]);
}

export async function generateChatResponse(
  userMessage: string,
  profile?: Partial<UserProfile>,
  history?: GroqMessage[]
): Promise<string> {
  const isMale = profile?.gender === "male";
  const pcodRules = isMale ? "" : getPCODSafetyPrompt(hasPcos(profile));

  const messages: GroqMessage[] = [
    {
      role: "system",
      content: `${getSystemPrompt(profile?.gender)}${pcodRules}${buildUserContext(profile)}\n\n${getDisclaimer(profile?.gender)}`,
    },
    ...(history ?? []),
    { role: "user", content: userMessage },
  ];

  return callGroq(messages);
}
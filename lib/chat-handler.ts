import {
  generateChatResponse,
  generateDietPlan,
  generatePeriodAdvice,
  generatePCODAdvice,
  generateMotivationMessage,
  generateDailyHealthSummary,
  generateMenDailyPlan,
  generateWomenDailyPlan,
  generateDoctorHabitAdvice,
} from "@/services/groq";
import {
  detectUnhealthyHabit,
  getStaticDoctorResponse,
} from "@/lib/coach/health-advisor";
import {
  detectEmergency,
  isSafetyConfirmation,
  getEmergencyResponse,
} from "@/lib/safety";
import type { ChatMessage, UserProfile } from "@/types";

export interface ChatHandlerResult {
  response: string;
  emergency?: boolean;
  safetyConfirmed?: boolean;
}

export async function handleCoachMessage(
  message: string,
  profile?: Partial<UserProfile>,
  history?: ChatMessage[],
  emergencyPaused = false
): Promise<ChatHandlerResult> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { response: "Please send a message so I can help you." };
  }

  const emergencyMsg = getEmergencyResponse(profile?.gender);

  if (detectEmergency(trimmed, profile?.gender)) {
    return { response: emergencyMsg, emergency: true };
  }

  if (emergencyPaused) {
    if (isSafetyConfirmation(trimmed)) {
      return {
        response:
          "I'm glad you're safe. I'm here whenever you're ready to continue your wellness journey. How can I support you today?",
        safetyConfirmed: true,
      };
    }
    return { response: emergencyMsg, emergency: true };
  }

  const lower = trimmed.toLowerCase();
  const isMale = profile?.gender === "male";
  let response: string;

  const unhealthyHabit = detectUnhealthyHabit(trimmed);
  if (unhealthyHabit) {
    response = getStaticDoctorResponse(
      unhealthyHabit,
      profile?.gender === "male" ? "male" : "female"
    );
    try {
      const aiLayer = await generateDoctorHabitAdvice(trimmed, profile);
      if (aiLayer && aiLayer.length > 80) response = aiLayer;
    } catch {
      /* keep static doctor response */
    }
    return { response };
  }

  if (
    lower.includes("daily plan") ||
    lower.includes("today's plan") ||
    lower.includes("full plan") ||
    lower.includes("wellness score")
  ) {
    response = isMale
      ? await generateMenDailyPlan(profile ?? {})
      : await generateWomenDailyPlan(profile ?? {});
  } else if (lower.includes("diet plan") || lower.includes("meal plan")) {
    response = await generateDietPlan(profile ?? {});
  } else if (
    !isMale &&
    (lower.includes("period") ||
      lower.includes("cycle") ||
      lower.includes("menstrual"))
  ) {
    response = await generatePeriodAdvice(profile ?? {});
  } else if (!isMale && (lower.includes("pcod") || lower.includes("pcos"))) {
    response = await generatePCODAdvice(profile ?? {});
  } else if (lower.includes("motivat") || lower.includes("morning")) {
    response = await generateMotivationMessage(profile);
  } else if (lower.includes("summary") || lower.includes("today")) {
    response = await generateDailyHealthSummary(profile ?? {}, trimmed);
  } else if (
    isMale &&
    (lower.includes("fitness") ||
      lower.includes("exercise") ||
      lower.includes("steps"))
  ) {
    response = await generateChatResponse(
      "Give practical fitness and step goal advice for today based on my profile. Under 150 words.",
      profile
    );
  } else if (isMale && (lower.includes("sleep") || lower.includes("stress"))) {
    response = await generateChatResponse(
      "Give sleep and stress management tips for tonight based on my wake/sleep schedule. Under 150 words.",
      profile
    );
  } else {
    const validHistory = (history ?? [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    response = await generateChatResponse(trimmed, profile, validHistory);
  }

  return { response };
}
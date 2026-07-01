import { format } from "date-fns";
import {
  calculatePeriodPrediction,
  getPeriodReminderType,
} from "@/lib/period";
import { getScheduledMessagesForHour, MALE_WELCOME, FEMALE_WELCOME } from "@/whatsapp/messages";
import type { MessageType, UserProfile } from "@/types";

export function getWelcomeMessage(gender?: string): string {
  return gender === "male" ? MALE_WELCOME : FEMALE_WELCOME;
}

export function getDueWhatsAppMessages(
  profile: Partial<UserProfile>,
  sentAlerts: Record<string, string>
): { type: MessageType; key: string }[] {
  const today = format(new Date(), "yyyy-MM-dd");
  const hour = new Date().getHours();
  const due: { type: MessageType; key: string }[] = [];

  for (const type of getScheduledMessagesForHour(hour, profile.gender)) {
    const key = `${type}-${today}`;
    if (!sentAlerts[key]) {
      due.push({ type, key });
    }
  }

  if (profile.gender === "female" && profile.lastPeriodDate) {
    const prediction = calculatePeriodPrediction(
      profile.lastPeriodDate,
      profile.cycleLength ?? "irregular"
    );
    const periodType = getPeriodReminderType(prediction.daysUntilPeriod);
    if (periodType) {
      const key = `${periodType}-${today}`;
      if (!sentAlerts[key]) {
        due.push({ type: periodType, key });
      }
    }
  }

  return due;
}
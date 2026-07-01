import { normalizePhone } from "@/lib/phone";
import type { ProgressDataInput } from "@/modules/progress-dashboard/types";
import {
  getWellnessDailyLogs,
  getWellnessMeta,
  getWellnessPlan,
  getWellnessReminderStates,
} from "./wellness";

export function loadProgressInputFromServer(phone: string): ProgressDataInput | null {
  const key = normalizePhone(phone);
  const dailyLogs = getWellnessDailyLogs(key);
  if (!dailyLogs.length) return null;

  const reminderStates = getWellnessReminderStates(key);
  const wellnessPlan = getWellnessPlan(key);
  const meta = getWellnessMeta(key);

  return {
    dailyLogs,
    reminderStates,
    waterGoal: meta?.water_goal ?? 8,
    stepsGoal: meta?.steps_goal ?? 8000,
    sleepGoal: meta?.sleep_goal ?? 7,
    userName: meta?.user_name ?? undefined,
    planReminders: wellnessPlan?.reminders.map((r) => ({
      id: r.id,
      label: r.label,
      type: r.type,
    })),
  };
}

export function mergeProgressInput(
  server: ProgressDataInput,
  client?: Partial<ProgressDataInput>
): ProgressDataInput {
  if (!client) return server;

  return {
    dailyLogs: client.dailyLogs?.length ? client.dailyLogs : server.dailyLogs,
    reminderStates: {
      ...server.reminderStates,
      ...client.reminderStates,
    },
    waterGoal: client.waterGoal ?? server.waterGoal,
    stepsGoal: client.stepsGoal ?? server.stepsGoal,
    sleepGoal: client.sleepGoal ?? server.sleepGoal,
    userName: client.userName ?? server.userName,
    planReminders: client.planReminders ?? server.planReminders,
  };
}
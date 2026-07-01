import { format } from "date-fns";
import type {
  WaterReminderHistoryEntry,
  WaterReminderSettings,
  AppLanguage,
} from "@/types";
import { scheduleWaterNotifications, cancelWaterNotifications } from "@/lib/notifications/native";

export const DEFAULT_WATER_SETTINGS: WaterReminderSettings = {
  wakeTime: "06:00",
  sleepTime: "22:00",
  dailyGlasses: 8,
  mlPerGlass: 250,
  enabled: true,
  paused: false,
  pausedUntil: null,
};

export function resolveWaterSettings(
  profileSettings?: WaterReminderSettings,
  maleWake?: string,
  maleSleep?: string
): WaterReminderSettings {
  const base = { ...DEFAULT_WATER_SETTINGS, ...profileSettings };
  if (maleWake) base.wakeTime = maleWake;
  if (maleSleep) base.sleepTime = maleSleep;
  return base;
}

export async function syncWaterNotificationSchedule(
  settings: WaterReminderSettings,
  nickname?: string,
  lang: AppLanguage = "en"
): Promise<number> {
  if (!settings.enabled || settings.paused) {
    await cancelWaterNotifications();
    return 0;
  }
  return scheduleWaterNotifications(settings, nickname, lang);
}

export function createHistoryEntry(
  action: WaterReminderHistoryEntry["action"],
  scheduledAt: string,
  glasses?: number
): WaterReminderHistoryEntry {
  return {
    id: crypto.randomUUID(),
    scheduledAt,
    action,
    glasses,
    recordedAt: new Date().toISOString(),
  };
}

export function todayWaterLogKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}
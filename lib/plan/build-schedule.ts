import { getMessageContent } from "@/whatsapp/messages";
import type { MessageType, PlanReminderSlot, UserProfile } from "@/types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const nm = ((total % 60) + 60) % 60;
  return `${pad(nh)}:${pad(nm)}`;
}

const SLOT_LABELS: Record<MessageType, string> = {
  wake_up: "Wake up & hydrate",
  breakfast: "Breakfast",
  morning: "Morning check-in",
  hydration: "Water reminder",
  lunch: "Lunch",
  movement: "Movement break",
  snack: "Healthy snack",
  activity: "Walk / exercise",
  dinner: "Light dinner",
  sleep_prep: "Wind down",
  sleep: "Sleep time",
  period_7d: "Period in 7 days",
  period_3d: "Period in 3 days",
  period_1d: "Period tomorrow",
  period_day1: "Cycle day 1",
  welcome: "Welcome",
};

function slot(
  type: MessageType,
  time: string,
  profile: UserProfile
): PlanReminderSlot {
  return {
    id: type,
    type,
    label: SLOT_LABELS[type] ?? type,
    time,
    message: getMessageContent(type, profile),
  };
}

function getWakeSleep(profile: UserProfile): { wake: string; sleep: string } {
  const settings = profile.waterReminderSettings;
  if (profile.gender === "male" && profile.maleProfile) {
    return {
      wake: profile.maleProfile.wakeTime || settings?.wakeTime || "06:00",
      sleep: profile.maleProfile.sleepTime || settings?.sleepTime || "22:30",
    };
  }
  return {
    wake: settings?.wakeTime || "06:00",
    sleep: settings?.sleepTime || "22:30",
  };
}

export function buildDailyReminders(profile: UserProfile): PlanReminderSlot[] {
  if (profile.gender === "male" && profile.maleProfile) {
    const { wake, sleep } = getWakeSleep(profile);
    return [
      slot("wake_up", wake, profile),
      slot("breakfast", addMinutes(wake, 90), profile),
      slot("hydration", addMinutes(wake, 180), profile),
      slot("movement", addMinutes(wake, 300), profile),
      slot("lunch", addMinutes(wake, 420), profile),
      slot("snack", addMinutes(wake, 600), profile),
      slot("activity", addMinutes(wake, 720), profile),
      slot("dinner", addMinutes(sleep, -150), profile),
      slot("sleep_prep", addMinutes(sleep, -30), profile),
      slot("sleep", sleep, profile),
    ];
  }

  const { wake, sleep } = getWakeSleep(profile);
  return [
    slot("wake_up", wake, profile),
    slot("breakfast", addMinutes(wake, 90), profile),
    slot("hydration", addMinutes(wake, 240), profile),
    slot("lunch", addMinutes(wake, 420), profile),
    slot("snack", addMinutes(wake, 600), profile),
    slot("activity", addMinutes(wake, 720), profile),
    slot("dinner", addMinutes(sleep, -150), profile),
    slot("sleep_prep", addMinutes(sleep, -30), profile),
    slot("sleep", sleep, profile),
  ];
}

export function planExpiresAt(from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 90);
  return d.toISOString();
}

export function isPlanExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}
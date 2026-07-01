import { format, addDays } from "date-fns";
import type { AppLanguage } from "@/types";
import { calculateWaterReminderSchedule, scheduleDateTime } from "@/lib/hydration/schedule";
import type { WaterReminderSettings } from "@/types";
import { isNativePlatform, loadCapacitorPlugins } from "./platform";
import {
  requestNotificationPermission as requestWebPermission,
  showReminderNotification,
} from "@/lib/pwa/notifications";
import {
  cancelWebWaterReminders,
  scheduleWebWaterReminders,
} from "@/lib/notifications/web-scheduler";

export const WATER_CHANNEL_ID = "water-reminders";
export const PLAN_CHANNEL_ID = "plan-reminders";

const NOTIFICATION_ICON = "ic_stat_notification";
const SMALL_ICON_RES = "ic_stat_notification";

function notificationId(date: string, slotId: string): number {
  const raw = `${date}-${slotId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 2147483646;
}

export async function ensureNotificationChannels(): Promise<void> {
  if (!isNativePlatform()) return;
  const { LocalNotifications } = await loadCapacitorPlugins();
  await LocalNotifications.createChannel({
    id: WATER_CHANNEL_ID,
    name: "Water Reminders",
    description: "Hydration alerts throughout your day",
    importance: 5,
    visibility: 1,
    sound: "default",
    vibration: true,
    lights: true,
    lightColor: "#7C3AED",
  });
  await LocalNotifications.createChannel({
    id: PLAN_CHANNEL_ID,
    name: "Wellness Plan",
    description: "Meals, sleep, and movement reminders",
    importance: 5,
    visibility: 1,
    sound: "default",
    vibration: true,
    lights: true,
    lightColor: "#7C3AED",
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  await ensureNotificationChannels();
  if (isNativePlatform()) {
    const { LocalNotifications } = await loadCapacitorPlugins();
    const check = await LocalNotifications.checkPermissions();
    if (check.display === "granted") return true;
    const req = await LocalNotifications.requestPermissions();
    return req.display === "granted";
  }
  const perm = await requestWebPermission();
  return perm === "granted";
}

export async function getNotificationPermissionStatus(): Promise<string> {
  if (isNativePlatform()) {
    const { LocalNotifications } = await loadCapacitorPlugins();
    const check = await LocalNotifications.checkPermissions();
    return check.display;
  }
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission;
  }
  return "denied";
}

export interface WaterNotificationCopy {
  title: string;
  body: string;
}

export function waterNotificationCopy(
  ml: number,
  nickname?: string,
  lang: AppLanguage = "en"
): WaterNotificationCopy {
  const name = nickname?.trim();
  const titles: Record<AppLanguage, string> = {
    en: "Time to Drink Water",
    te: "నీరు తాగే సమయం",
    hi: "पानी पीने का समय",
    ta: "தண்ணீர் குடிக்கும் நேரம்",
    kn: "ನೀರು ಕುಡಿಯುವ ಸಮಯ",
    ml: "വെള്ളം കുടിക്കാനുള്ള സമയം",
  };
  const base = titles[lang] ?? titles.en;
  const title = name ? `${base}, ${name}` : base;
  const bodyTemplates: Record<AppLanguage, string> = {
    en: `Please drink ${ml}ml of water now.`,
    te: `దయచేసి ఇప్పుడు ${ml}ml నీరు తాగండి.`,
    hi: `कृपया अभी ${ml}ml पानी पिएं।`,
    ta: `தயவுசெய்து இப்போது ${ml}ml தண்ணீர் குடியுங்கள்.`,
    kn: `ದಯವಿಟ್ಟು ಈಗ ${ml}ml ನೀರು ಕುಡಿಯಿರಿ.`,
    ml: `ദയവായി ഇപ്പോൾ ${ml}ml വെള്ളം കുടിക്കുക.`,
  };
  return { title, body: bodyTemplates[lang] ?? bodyTemplates.en };
}

export async function cancelWaterNotifications(): Promise<void> {
  if (!isNativePlatform()) return;
  const { LocalNotifications } = await loadCapacitorPlugins();
  const pending = await LocalNotifications.getPending();
  const waterIds = pending.notifications
    .filter((n) => String(n.extra?.type) === "water")
    .map((n) => ({ id: n.id }));
  if (waterIds.length > 0) {
    await LocalNotifications.cancel({ notifications: waterIds });
  }
}

export async function scheduleWaterNotifications(
  settings: WaterReminderSettings,
  nickname?: string,
  lang: AppLanguage = "en",
  daysAhead = 7
): Promise<number> {
  if (!settings.enabled || settings.paused) {
    await cancelWaterNotifications();
    cancelWebWaterReminders();
    return 0;
  }

  const slots = calculateWaterReminderSchedule(
    settings.wakeTime,
    settings.sleepTime,
    settings.dailyGlasses,
    settings.mlPerGlass
  );

  if (isNativePlatform()) {
    const { LocalNotifications } = await loadCapacitorPlugins();
    await ensureNotificationChannels();
    await cancelWaterNotifications();

    const notifications = [];
    const today = new Date();

    for (let d = 0; d < daysAhead; d++) {
      const dateStr = format(addDays(today, d), "yyyy-MM-dd");
      for (const slot of slots) {
        const at = scheduleDateTime(dateStr, slot.time);
        if (at.getTime() <= Date.now()) continue;
        const copy = waterNotificationCopy(slot.ml, nickname, lang);
        notifications.push({
          id: notificationId(dateStr, slot.id),
          title: copy.title,
          body: copy.body,
          schedule: { at, allowWhileIdle: true },
          sound: "default",
          smallIcon: SMALL_ICON_RES,
          iconColor: "#7C3AED",
          channelId: WATER_CHANNEL_ID,
          extra: {
            type: "water",
            slotId: slot.id,
            date: dateStr,
            ml: slot.ml,
          },
        });
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
    return notifications.length;
  }

  return scheduleWebWaterReminders(slots, (slot) =>
    waterNotificationCopy(slot.ml, nickname, lang)
  );
}

export async function showPlanNotification(
  title: string,
  body: string,
  tag: string
): Promise<void> {
  if (isNativePlatform()) {
    const { LocalNotifications } = await loadCapacitorPlugins();
    await ensureNotificationChannels();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId(format(new Date(), "yyyy-MM-dd"), tag),
          title,
          body: body.slice(0, 180),
          schedule: { at: new Date(Date.now() + 500) },
          sound: "default",
          smallIcon: SMALL_ICON_RES,
          iconColor: "#7C3AED",
          channelId: PLAN_CHANNEL_ID,
          extra: { type: "plan", tag },
        },
      ],
    });
    return;
  }
  await showReminderNotification(title, body, tag, {
    reminderKey: tag,
    kind: "plan",
  });
}

export function registerNotificationListeners(
  handlers?: {
    onWaterAction?: (extra: Record<string, unknown>) => void;
    onWaterReceived?: (extra: Record<string, unknown>) => void;
    onAppResume?: () => void;
  }
): () => void {
  if (!isNativePlatform()) return () => undefined;

  let cleanup = () => undefined;
  void loadCapacitorPlugins().then(({ LocalNotifications, App }) => {
    const handleWater = (extra: Record<string, unknown> | undefined) => {
      if (extra?.type === "water") handlers?.onWaterAction?.(extra);
    };

    const sub1 = LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (event) => handleWater(event.notification.extra as Record<string, unknown>)
    );
    const sub2 = LocalNotifications.addListener(
      "localNotificationReceived",
      (notification) => {
        const extra = notification.extra as Record<string, unknown>;
        if (extra?.type === "water") handlers?.onWaterReceived?.(extra);
      }
    );
    const sub3 = App.addListener("appStateChange", async ({ isActive }) => {
      if (isActive) {
        await ensureNotificationChannels();
        handlers?.onAppResume?.();
      }
    });
    cleanup = () => {
      void sub1.then((s) => s.remove());
      void sub2.then((s) => s.remove());
      void sub3.then((s) => s.remove());
    };
  });
  return () => cleanup();
}
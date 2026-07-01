import { PWA_ICON_URLS } from "./icon-urls";
import { initPwaServiceWorker } from "./update";

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  return initPwaServiceWorker();
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function playReminderSound(): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.15;
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch {
    /* audio blocked until user gesture */
  }
}

export interface ReminderNotificationOptions {
  reminderKey?: string;
  kind?: "plan" | "water";
}

export async function showReminderNotification(
  title: string,
  body: string,
  tag: string,
  options?: ReminderNotificationOptions
): Promise<void> {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return;
  }
  const payload = {
    body: body.slice(0, 180),
    tag,
    icon: PWA_ICON_URLS.icon192,
    badge: PWA_ICON_URLS.icon192,
    requireInteraction: true,
    data: {
      reminderKey: options?.reminderKey ?? tag,
      kind: options?.kind ?? "plan",
    },
    actions: [
      { action: "done", title: "Done" },
      { action: "snooze", title: "Snooze" },
      { action: "stop", title: "Stop" },
    ],
  } as NotificationOptions;

  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, payload);
  } catch {
    new Notification(title, { body: body.slice(0, 180), tag });
  }
}
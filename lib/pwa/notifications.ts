export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
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

export async function showReminderNotification(
  title: string,
  body: string,
  tag: string
): Promise<void> {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body: body.slice(0, 180),
      tag,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      requireInteraction: true,
    } as NotificationOptions);
  } catch {
    new Notification(title, { body: body.slice(0, 180), tag });
  }
}
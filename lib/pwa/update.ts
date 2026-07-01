import { APP_VERSION } from "./version";

export type UpdateCallback = (version: string) => void;

export async function checkForAppUpdate(onUpdate: UpdateCallback): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    const notifyIfWaiting = () => {
      if (registration.waiting && navigator.serviceWorker.controller) {
        onUpdate(APP_VERSION);
      }
    };

    notifyIfWaiting();

    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (
          worker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          onUpdate(APP_VERSION);
        }
      });
    });

    await registration.update();

    // Re-check hourly for deployed updates
    window.setInterval(() => {
      registration.update().catch(() => undefined);
    }, 60 * 60 * 1000);
  } catch {
    /* SW unsupported or blocked */
  }
}

export function applyAppUpdate(): void {
  if (!("serviceWorker" in navigator)) {
    window.location.reload();
    return;
  }

  const reloadOnce = () => {
    navigator.serviceWorker.removeEventListener("controllerchange", reloadOnce);
    window.location.reload();
  };
  navigator.serviceWorker.addEventListener("controllerchange", reloadOnce);

  navigator.serviceWorker.ready.then((registration) => {
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    if (!registration.waiting) window.location.reload();
  });
}

export async function notifyUpdateAvailable(title: string, body: string): Promise<void> {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      tag: "bfit-app-update",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      requireInteraction: true,
      data: { url: "/" },
    } as NotificationOptions);
  } catch {
    new Notification(title, { body, tag: "bfit-app-update" });
  }
}
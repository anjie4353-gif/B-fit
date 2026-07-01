import { PWA_ICON_URLS } from "./icon-urls";
import { APP_VERSION } from "./version";

export type UpdateCallback = (version: string) => void;

let activeRegistration: ServiceWorkerRegistration | null = null;

function hasWaitingWorker(reg: ServiceWorkerRegistration): boolean {
  return Boolean(reg.waiting && navigator.serviceWorker.controller);
}

function notifyIfUpdateReady(reg: ServiceWorkerRegistration, onUpdate: UpdateCallback) {
  if (hasWaitingWorker(reg)) {
    onUpdate(APP_VERSION);
  }
}

/** Register SW once and watch for waiting worker (new deploy). */
export async function initPwaServiceWorker(
  onUpdate?: UpdateCallback
): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    activeRegistration = reg;

    const check = () => {
      if (onUpdate) notifyIfUpdateReady(reg, onUpdate);
    };

    check();

    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed") check();
      });
    });

    await reg.update();
    window.setTimeout(check, 1500);
    window.setTimeout(check, 4000);

    window.setInterval(() => {
      reg.update().then(check).catch(() => undefined);
    }, 30 * 60 * 1000);

    return reg;
  } catch {
    return null;
  }
}

export async function checkForAppUpdate(onUpdate: UpdateCallback): Promise<void> {
  await initPwaServiceWorker(onUpdate);
}

function hardReload(): void {
  const { pathname, search, hash } = window.location;
  const params = new URLSearchParams(search);
  params.set("_bfit", String(Date.now()));
  window.location.replace(`${pathname}?${params.toString()}${hash}`);
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (activeRegistration) return activeRegistration;
  return (await navigator.serviceWorker.getRegistration("/")) ?? null;
}

/** Apply waiting service worker, then reload. Never leaves user stuck. */
export async function applyAppUpdate(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    hardReload();
    return;
  }

  const reg = await getRegistration();
  if (!reg) {
    hardReload();
    return;
  }

  await reg.update();

  const waiting = reg.waiting;
  if (!waiting) {
    hardReload();
    return;
  }

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
      hardReload();
    };

    const timeout = window.setTimeout(finish, 3500);

    const onChange = () => {
      window.clearTimeout(timeout);
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
      finish();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);

    try {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        if (event.data?.type === "SW_ACTIVATED") {
          window.clearTimeout(timeout);
          navigator.serviceWorker.removeEventListener("controllerchange", onChange);
          if (!settled) {
            settled = true;
            resolve();
            hardReload();
          }
        }
      };
      waiting.postMessage({ type: "SKIP_WAITING" }, [channel.port2]);
    } catch {
      waiting.postMessage({ type: "SKIP_WAITING" });
    }
  });
}

export async function notifyUpdateAvailable(
  title: string,
  body: string
): Promise<void> {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      tag: "bfit-app-update",
      icon: PWA_ICON_URLS.icon192,
      badge: PWA_ICON_URLS.icon192,
      requireInteraction: true,
      data: { url: "/" },
    } as NotificationOptions);
  } catch {
    new Notification(title, { body, tag: "bfit-app-update" });
  }
}
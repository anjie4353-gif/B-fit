const CACHE = "b-fit-v1.3.4";

// Do NOT precache icons/manifest — old users need fresh icons from network
const PRECACHE = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SKIP_WAITING") return;
  event.waitUntil(
    self.skipWaiting().then(() => {
      const port = event.ports && event.ports[0];
      if (port) port.postMessage({ type: "SW_ACTIVATED" });
      return self.clients.claim();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // Always network-first for icons, manifest, and HTML — home screen icon updates
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.includes("manifest") ||
    url.pathname === "/" ||
    url.search.includes("v=")
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const action = event.action;
  const data = event.notification.data || {};

  if (action === "done" || action === "snooze" || action === "stop") {
    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clients) => {
          const msg = {
            type: "REMINDER_ACTION",
            action,
            key: data.reminderKey,
            kind: data.kind || "plan",
          };
          clients.forEach((client) => client.postMessage(msg));
          if (clients.length > 0) return clients[0].focus();
          return self.clients.openWindow("/plan");
        })
    );
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow("/plan");
    })
  );
});
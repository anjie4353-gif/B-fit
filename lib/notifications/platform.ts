export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Capacitor } = require("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function loadCapacitorPlugins() {
  const [
    { LocalNotifications },
    { App },
  ] = await Promise.all([
    import("@capacitor/local-notifications"),
    import("@capacitor/app"),
  ]);
  return { LocalNotifications, App };
}
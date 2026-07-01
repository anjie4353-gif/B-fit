import { isNativePlatform } from "@/lib/notifications/platform";
import { nativeDriver } from "./native-driver";
import { webDriver } from "./web-driver";
import { migrateFromLegacyStorage } from "./migrate-from-legacy";
import { syncDailyLogsFromSession } from "./sync-daily-logs";
import type { ClientDbAdapter } from "./types";

let adapter: ClientDbAdapter | null = null;
let initPromise: Promise<ClientDbAdapter> | null = null;

function resolveAdapter(): ClientDbAdapter {
  if (adapter) return adapter;
  adapter = isNativePlatform() ? nativeDriver : webDriver;
  return adapter;
}

export async function initClientDb(): Promise<ClientDbAdapter> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = resolveAdapter();
    await db.init();
    await migrateFromLegacyStorage(db);
    return db;
  })();

  return initPromise;
}

export async function getClientDb(): Promise<ClientDbAdapter> {
  return initClientDb();
}

export async function clientDbGet(key: string): Promise<string | null> {
  const db = await getClientDb();
  return db.get(key);
}

export async function clientDbSet(key: string, value: string): Promise<void> {
  const db = await getClientDb();
  await db.set(key, value);

  if (key === "bfit-session") {
    await syncDailyLogsFromSession(db, value);
    const { scheduleWellnessServerSync } = await import("@/lib/sync-wellness");
    scheduleWellnessServerSync(value);
  }
}

export async function clientDbRemove(key: string): Promise<void> {
  const db = await getClientDb();
  await db.remove(key);
}

export function getClientDbDriver(): ClientDbAdapter | null {
  return adapter;
}
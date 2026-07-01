import { securePersistStorage } from "@/lib/storage/secure-persist";
import type { ClientDbAdapter } from "./types";

const LEGACY_KEYS = ["bfit-session", "bfit-progress-dashboard"] as const;

export async function migrateFromLegacyStorage(adapter: ClientDbAdapter) {
  const migrated = await adapter.queryScalar(
    `SELECT value FROM meta WHERE key = 'legacy_migrated'`
  );
  if (migrated === "1") return;

  const now = new Date().toISOString();

  for (const key of LEGACY_KEYS) {
    const exists = await adapter.queryScalar(
      `SELECT 1 FROM kv_store WHERE key = ? LIMIT 1`,
      [key]
    );
    if (exists) continue;

    const legacy = await securePersistStorage.getItem(key);
    if (legacy) {
      await adapter.set(key, legacy);
    }
  }

  await adapter.run(`INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`, [
    "legacy_migrated",
    "1",
  ]);

  const session = await adapter.get("bfit-session");
  if (session) {
    const { syncDailyLogsFromSession } = await import("./sync-daily-logs");
    await syncDailyLogsFromSession(adapter, session);
  }
}
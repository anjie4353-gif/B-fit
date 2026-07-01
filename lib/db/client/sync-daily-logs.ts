import type { DailyLog } from "@/types";
import type { ClientDbAdapter } from "./types";

interface PersistedSession {
  state?: { dailyLogs?: DailyLog[] };
}

export async function syncDailyLogsFromSession(
  adapter: ClientDbAdapter,
  sessionJson: string
) {
  let parsed: PersistedSession;
  try {
    parsed = JSON.parse(sessionJson) as PersistedSession;
  } catch {
    return;
  }

  const logs = parsed.state?.dailyLogs ?? [];
  if (!logs.length) return;

  const now = new Date().toISOString();
  for (const log of logs) {
    await adapter.run(
      `INSERT INTO daily_logs (
        date, water_intake, steps, sleep_hours, mood, energy_level, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        water_intake = excluded.water_intake,
        steps = excluded.steps,
        sleep_hours = excluded.sleep_hours,
        mood = excluded.mood,
        energy_level = excluded.energy_level,
        updated_at = excluded.updated_at`,
      [
        log.date,
        log.waterIntake ?? 0,
        log.steps ?? 0,
        log.sleepHours ?? 0,
        log.mood ?? 0,
        log.energyLevel ?? 0,
        now,
      ]
    );
  }
}

export async function readDailyLogsFromDb(
  adapter: ClientDbAdapter
): Promise<DailyLog[]> {
  await adapter.init();
  const database = adapter as ClientDbAdapter & {
    queryAll?: (sql: string) => Promise<DailyLog[]>;
  };

  if (!("queryAll" in database)) {
    return [];
  }

  return database.queryAll?.(
    `SELECT date, water_intake, steps, sleep_hours, mood, energy_level FROM daily_logs ORDER BY date DESC`
  ) ?? [];
}
import { normalizePhone } from "@/lib/phone";
import { getServerDb } from "./connection";
import type { DailyLog, ReminderInstanceState, WellnessPlan } from "@/types";

export interface WellnessSyncPayload {
  phone: string;
  dailyLogs: DailyLog[];
  reminderStates: Record<string, ReminderInstanceState>;
  wellnessPlan: WellnessPlan | null;
  waterGoal: number;
  stepsGoal: number;
  sleepGoal: number;
  userName?: string;
}

export function upsertWellnessData(payload: WellnessSyncPayload) {
  const db = getServerDb();
  const phone = normalizePhone(payload.phone);
  const now = new Date().toISOString();

  const upsertLog = db.prepare(`
    INSERT INTO wellness_daily_logs (
      phone, date, water_intake, steps, sleep_hours, mood, energy_level, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(phone, date) DO UPDATE SET
      water_intake = excluded.water_intake,
      steps = excluded.steps,
      sleep_hours = excluded.sleep_hours,
      mood = excluded.mood,
      energy_level = excluded.energy_level,
      updated_at = excluded.updated_at
  `);

  const upsertReminder = db.prepare(`
    INSERT INTO wellness_reminder_states (
      phone, state_key, status, attempts, last_fired_at, done_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(phone, state_key) DO UPDATE SET
      status = excluded.status,
      attempts = excluded.attempts,
      last_fired_at = excluded.last_fired_at,
      done_at = excluded.done_at,
      updated_at = excluded.updated_at
  `);

  const tx = db.transaction((data: WellnessSyncPayload) => {
    db.prepare(
      `INSERT INTO wellness_meta (phone, water_goal, steps_goal, sleep_goal, user_name, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(phone) DO UPDATE SET
         water_goal = excluded.water_goal,
         steps_goal = excluded.steps_goal,
         sleep_goal = excluded.sleep_goal,
         user_name = excluded.user_name,
         updated_at = excluded.updated_at`
    ).run(
      phone,
      data.waterGoal,
      data.stepsGoal,
      data.sleepGoal,
      data.userName ?? null,
      now
    );

    for (const log of data.dailyLogs) {
      upsertLog.run(
        phone,
        log.date,
        log.waterIntake ?? 0,
        log.steps ?? 0,
        log.sleepHours ?? 0,
        log.mood ?? 0,
        log.energyLevel ?? 0,
        now
      );
    }

    for (const [stateKey, state] of Object.entries(data.reminderStates)) {
      upsertReminder.run(
        phone,
        stateKey,
        state.status,
        state.attempts ?? 0,
        state.lastFiredAt,
        state.doneAt,
        now
      );
    }

    if (data.wellnessPlan) {
      db.prepare(
        `INSERT INTO wellness_plans (phone, plan_json, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(phone) DO UPDATE SET plan_json = excluded.plan_json, updated_at = excluded.updated_at`
      ).run(phone, JSON.stringify(data.wellnessPlan), now);
    }

    db.prepare(
      `INSERT INTO progress_snapshots (phone, snapshot_json, created_at) VALUES (?, ?, ?)`
    ).run(phone, JSON.stringify(data), now);
  });

  tx(payload);
}

export function getWellnessDailyLogs(phone: string): DailyLog[] {
  const db = getServerDb();
  const key = normalizePhone(phone);
  const rows = db
    .prepare(
      `SELECT date, water_intake, steps, sleep_hours, mood, energy_level
       FROM wellness_daily_logs WHERE phone = ? ORDER BY date ASC`
    )
    .all(key) as Array<{
    date: string;
    water_intake: number;
    steps: number;
    sleep_hours: number;
    mood: number;
    energy_level: number;
  }>;

  return rows.map((r) => ({
    date: r.date,
    waterIntake: r.water_intake,
    steps: r.steps,
    sleepHours: r.sleep_hours,
    mood: r.mood as DailyLog["mood"],
    energyLevel: r.energy_level as DailyLog["energyLevel"],
  }));
}

export function getWellnessReminderStates(
  phone: string
): Record<string, ReminderInstanceState> {
  const db = getServerDb();
  const key = normalizePhone(phone);
  const rows = db
    .prepare(
      `SELECT state_key, status, attempts, last_fired_at, done_at
       FROM wellness_reminder_states WHERE phone = ?`
    )
    .all(key) as Array<{
    state_key: string;
    status: ReminderInstanceState["status"];
    attempts: number;
    last_fired_at: string | null;
    done_at: string | null;
  }>;

  const out: Record<string, ReminderInstanceState> = {};
  for (const r of rows) {
    out[r.state_key] = {
      status: r.status,
      attempts: r.attempts,
      lastFiredAt: r.last_fired_at,
      doneAt: r.done_at,
    };
  }
  return out;
}

export function getWellnessPlan(phone: string): WellnessPlan | null {
  const db = getServerDb();
  const key = normalizePhone(phone);
  const row = db
    .prepare(`SELECT plan_json FROM wellness_plans WHERE phone = ?`)
    .get(key) as { plan_json: string } | undefined;
  if (!row) return null;
  try {
    return JSON.parse(row.plan_json) as WellnessPlan;
  } catch {
    return null;
  }
}

export function getWellnessMeta(phone: string) {
  const db = getServerDb();
  const key = normalizePhone(phone);
  return db
    .prepare(
      `SELECT water_goal, steps_goal, sleep_goal, user_name FROM wellness_meta WHERE phone = ?`
    )
    .get(key) as
    | {
        water_goal: number;
        steps_goal: number;
        sleep_goal: number;
        user_name: string | null;
      }
    | undefined;
}
export const SERVER_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS user_sessions (
  phone TEXT PRIMARY KEY,
  profile_json TEXT NOT NULL,
  whatsapp_messages_json TEXT NOT NULL DEFAULT '[]',
  sent_alerts_json TEXT NOT NULL DEFAULT '{}',
  chat_history_json TEXT NOT NULL DEFAULT '[]',
  emergency_paused INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_updated
  ON user_sessions(updated_at DESC);

CREATE TABLE IF NOT EXISTS progress_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT,
  snapshot_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_progress_snapshots_phone
  ON progress_snapshots(phone, created_at DESC);

CREATE TABLE IF NOT EXISTS wellness_daily_logs (
  phone TEXT NOT NULL,
  date TEXT NOT NULL,
  water_intake INTEGER NOT NULL DEFAULT 0,
  steps INTEGER NOT NULL DEFAULT 0,
  sleep_hours REAL NOT NULL DEFAULT 0,
  mood INTEGER NOT NULL DEFAULT 0,
  energy_level INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (phone, date)
);

CREATE INDEX IF NOT EXISTS idx_wellness_daily_logs_phone_date
  ON wellness_daily_logs(phone, date DESC);

CREATE TABLE IF NOT EXISTS wellness_reminder_states (
  phone TEXT NOT NULL,
  state_key TEXT NOT NULL,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_fired_at TEXT,
  done_at TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (phone, state_key)
);

CREATE TABLE IF NOT EXISTS wellness_plans (
  phone TEXT PRIMARY KEY,
  plan_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wellness_meta (
  phone TEXT PRIMARY KEY,
  water_goal INTEGER NOT NULL DEFAULT 8,
  steps_goal INTEGER NOT NULL DEFAULT 8000,
  sleep_goal REAL NOT NULL DEFAULT 7,
  user_name TEXT,
  updated_at TEXT NOT NULL
);
`;
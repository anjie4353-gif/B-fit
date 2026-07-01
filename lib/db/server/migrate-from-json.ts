import type Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { UserSession } from "@/lib/store/types";

const LEGACY_FILE = path.join(process.cwd(), "data", "users.json");

interface LegacyDbShape {
  users: Record<string, UserSession>;
}

export function migrateFromJsonFile(database: Database.Database) {
  const count = database
    .prepare("SELECT COUNT(*) AS c FROM user_sessions")
    .get() as { c: number };
  if (count.c > 0) return;

  if (!fs.existsSync(LEGACY_FILE)) return;

  try {
    const raw = fs.readFileSync(LEGACY_FILE, "utf8");
    const legacy = JSON.parse(raw) as LegacyDbShape;
    const insert = database.prepare(`
      INSERT OR IGNORE INTO user_sessions (
        phone, profile_json, whatsapp_messages_json, sent_alerts_json,
        chat_history_json, emergency_paused, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = database.transaction((users: Record<string, UserSession>) => {
      for (const [phone, session] of Object.entries(users)) {
        insert.run(
          phone,
          JSON.stringify(session.profile),
          JSON.stringify(session.whatsappMessages ?? []),
          JSON.stringify(session.sentAlerts ?? {}),
          JSON.stringify(session.chatHistory ?? []),
          session.emergencyPaused ? 1 : 0,
          session.updatedAt ?? new Date().toISOString()
        );
      }
    });

    tx(legacy.users ?? {});
  } catch (err) {
    console.warn("[sqlite] Legacy users.json migration skipped:", err);
  }
}
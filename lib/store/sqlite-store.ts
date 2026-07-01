import { normalizePhone, phonesMatch } from "@/lib/phone";
import { getServerDb } from "@/lib/db/server/connection";
import type { ChatMessage, UserProfile, WhatsAppMessage } from "@/types";
import type { UserSession, UserStore } from "./types";

function emptySession(profile: UserProfile): UserSession {
  return {
    profile,
    whatsappMessages: [],
    sentAlerts: {},
    chatHistory: [],
    emergencyPaused: false,
    updatedAt: new Date().toISOString(),
  };
}

function rowToSession(row: {
  profile_json: string;
  whatsapp_messages_json: string;
  sent_alerts_json: string;
  chat_history_json: string;
  emergency_paused: number;
  updated_at: string;
}): UserSession {
  return {
    profile: JSON.parse(row.profile_json) as UserProfile,
    whatsappMessages: JSON.parse(row.whatsapp_messages_json) as WhatsAppMessage[],
    sentAlerts: JSON.parse(row.sent_alerts_json) as Record<string, string>,
    chatHistory: JSON.parse(row.chat_history_json) as ChatMessage[],
    emergencyPaused: Boolean(row.emergency_paused),
    updatedAt: row.updated_at,
  };
}

function findPhoneKey(phone: string): string | null {
  const db = getServerDb();
  const key = normalizePhone(phone);
  const direct = db
    .prepare("SELECT phone FROM user_sessions WHERE phone = ?")
    .get(key) as { phone: string } | undefined;
  if (direct) return direct.phone;

  const all = db.prepare("SELECT phone FROM user_sessions").all() as {
    phone: string;
  }[];
  for (const row of all) {
    if (phonesMatch(row.phone, phone)) return row.phone;
  }
  return null;
}

function getSessionByPhone(phone: string): UserSession | null {
  const db = getServerDb();
  const key = findPhoneKey(phone);
  if (!key) return null;

  const row = db
    .prepare(
      `SELECT profile_json, whatsapp_messages_json, sent_alerts_json,
              chat_history_json, emergency_paused, updated_at
       FROM user_sessions WHERE phone = ?`
    )
    .get(key) as
    | {
        profile_json: string;
        whatsapp_messages_json: string;
        sent_alerts_json: string;
        chat_history_json: string;
        emergency_paused: number;
        updated_at: string;
      }
    | undefined;

  return row ? rowToSession(row) : null;
}

function upsertSession(phone: string, session: UserSession) {
  const db = getServerDb();
  const key = normalizePhone(phone);
  db.prepare(
    `INSERT INTO user_sessions (
      phone, profile_json, whatsapp_messages_json, sent_alerts_json,
      chat_history_json, emergency_paused, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(phone) DO UPDATE SET
      profile_json = excluded.profile_json,
      whatsapp_messages_json = excluded.whatsapp_messages_json,
      sent_alerts_json = excluded.sent_alerts_json,
      chat_history_json = excluded.chat_history_json,
      emergency_paused = excluded.emergency_paused,
      updated_at = excluded.updated_at`
  ).run(
    key,
    JSON.stringify(session.profile),
    JSON.stringify(session.whatsappMessages),
    JSON.stringify(session.sentAlerts),
    JSON.stringify(session.chatHistory),
    session.emergencyPaused ? 1 : 0,
    session.updatedAt
  );
}

export const sqliteUserStore: UserStore = {
  async saveUser(profile) {
    const key = normalizePhone(profile.whatsappNumber);
    const existing = getSessionByPhone(key);
    const session: UserSession = {
      ...(existing ?? emptySession(profile)),
      profile,
      updatedAt: new Date().toISOString(),
    };
    upsertSession(key, session);
  },

  async getUserByPhone(phone) {
    return getSessionByPhone(phone);
  },

  async findUserByPhone(phone) {
    return getSessionByPhone(phone);
  },

  async listUserPhones() {
    const db = getServerDb();
    const rows = db.prepare("SELECT phone FROM user_sessions").all() as {
      phone: string;
    }[];
    return rows.map((r) => r.phone);
  },

  async addWhatsAppMessage(phone, message) {
    const session = getSessionByPhone(phone);
    if (!session) return;
    session.whatsappMessages = [...session.whatsappMessages, message].slice(-200);
    session.updatedAt = new Date().toISOString();
    upsertSession(session.profile.whatsappNumber, session);
  },

  async getWhatsAppMessages(phone) {
    const session = await this.getUserByPhone(phone);
    return session?.whatsappMessages ?? [];
  },

  async markAlertSent(phone, alertKey) {
    const session = getSessionByPhone(phone);
    if (!session) return;
    session.sentAlerts[alertKey] = new Date().toISOString();
    session.updatedAt = new Date().toISOString();
    upsertSession(session.profile.whatsappNumber, session);
  },

  async getSentAlerts(phone) {
    const session = await this.getUserByPhone(phone);
    return session?.sentAlerts ?? {};
  },

  async addChatTurn(phone, userText, assistantText) {
    const session = getSessionByPhone(phone);
    if (!session) return;
    const now = new Date().toISOString();
    const turns: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        role: "user",
        content: userText,
        timestamp: now,
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantText,
        timestamp: now,
      },
    ];
    session.chatHistory = [...session.chatHistory, ...turns].slice(-40);
    session.updatedAt = new Date().toISOString();
    upsertSession(session.profile.whatsappNumber, session);
  },

  async getChatHistory(phone, limit = 10) {
    const session = await this.getUserByPhone(phone);
    return (session?.chatHistory ?? []).slice(-limit);
  },

  async setEmergencyPaused(phone, paused) {
    const session = getSessionByPhone(phone);
    if (!session) return;
    session.emergencyPaused = paused;
    session.updatedAt = new Date().toISOString();
    upsertSession(session.profile.whatsappNumber, session);
  },

  async isEmergencyPaused(phone) {
    const session = await this.getUserByPhone(phone);
    return session?.emergencyPaused ?? false;
  },
};
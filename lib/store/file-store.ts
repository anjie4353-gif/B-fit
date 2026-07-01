import { promises as fs } from "fs";
import path from "path";
import { normalizePhone, phonesMatch } from "@/lib/phone";
import type { ChatMessage, UserProfile, WhatsAppMessage } from "@/types";
import type { UserSession, UserStore } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

interface DbShape {
  users: Record<string, UserSession>;
}

async function readDb(): Promise<DbShape> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as DbShape;
  } catch {
    return { users: {} };
  }
}

async function writeDb(db: DbShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

function phoneKey(phone: string): string {
  return normalizePhone(phone);
}

function findKey(db: DbShape, phone: string): string | null {
  const key = phoneKey(phone);
  if (db.users[key]) return key;
  for (const k of Object.keys(db.users)) {
    if (phonesMatch(k, phone)) return k;
  }
  return null;
}

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

export const fileUserStore: UserStore = {
  async saveUser(profile) {
    const db = await readDb();
    const key = phoneKey(profile.whatsappNumber);
    const existing = db.users[key];
    db.users[key] = {
      ...(existing ?? emptySession(profile)),
      profile,
      updatedAt: new Date().toISOString(),
    };
    await writeDb(db);
  },

  async getUserByPhone(phone) {
    const db = await readDb();
    const key = findKey(db, phone);
    return key ? db.users[key] : null;
  },

  async findUserByPhone(phone) {
    return this.getUserByPhone(phone);
  },

  async listUserPhones() {
    const db = await readDb();
    return Object.keys(db.users);
  },

  async addWhatsAppMessage(phone, message) {
    const db = await readDb();
    const key = findKey(db, phone) ?? phoneKey(phone);
    if (!db.users[key]) return;
    db.users[key].whatsappMessages = [
      ...db.users[key].whatsappMessages,
      message,
    ].slice(-200);
    db.users[key].updatedAt = new Date().toISOString();
    await writeDb(db);
  },

  async getWhatsAppMessages(phone) {
    const session = await this.getUserByPhone(phone);
    return session?.whatsappMessages ?? [];
  },

  async markAlertSent(phone, alertKey) {
    const db = await readDb();
    const key = findKey(db, phone);
    if (!key || !db.users[key]) return;
    db.users[key].sentAlerts[alertKey] = new Date().toISOString();
    db.users[key].updatedAt = new Date().toISOString();
    await writeDb(db);
  },

  async getSentAlerts(phone) {
    const session = await this.getUserByPhone(phone);
    return session?.sentAlerts ?? {};
  },

  async addChatTurn(phone, userText, assistantText) {
    const db = await readDb();
    const key = findKey(db, phone);
    if (!key || !db.users[key]) return;
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
    db.users[key].chatHistory = [...db.users[key].chatHistory, ...turns].slice(
      -40
    );
    db.users[key].updatedAt = new Date().toISOString();
    await writeDb(db);
  },

  async getChatHistory(phone, limit = 10) {
    const session = await this.getUserByPhone(phone);
    return (session?.chatHistory ?? []).slice(-limit);
  },

  async setEmergencyPaused(phone, paused) {
    const db = await readDb();
    const key = findKey(db, phone);
    if (!key || !db.users[key]) return;
    db.users[key].emergencyPaused = paused;
    db.users[key].updatedAt = new Date().toISOString();
    await writeDb(db);
  },

  async isEmergencyPaused(phone) {
    const session = await this.getUserByPhone(phone);
    return session?.emergencyPaused ?? false;
  },
};
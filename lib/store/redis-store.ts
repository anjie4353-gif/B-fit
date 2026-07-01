import { Redis } from "@upstash/redis";
import { normalizePhone, phonesMatch } from "@/lib/phone";
import type { ChatMessage, UserProfile, WhatsAppMessage } from "@/types";
import type { UserSession, UserStore } from "./types";

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN required");
  }
  return new Redis({ url, token });
}

const INDEX_KEY = "bfit:users:index";

function userKey(phone: string): string {
  return `bfit:user:${normalizePhone(phone)}`;
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

async function getSession(redis: Redis, phone: string): Promise<UserSession | null> {
  const direct = await redis.get<UserSession>(userKey(phone));
  if (direct) return direct;

  const index = (await redis.smembers(INDEX_KEY)) as string[];
  for (const storedPhone of index) {
    if (phonesMatch(storedPhone, phone)) {
      return redis.get<UserSession>(userKey(storedPhone));
    }
  }
  return null;
}

export const redisUserStore: UserStore = {
  async saveUser(profile) {
    const redis = getRedis();
    const key = normalizePhone(profile.whatsappNumber);
    const existing = await redis.get<UserSession>(userKey(key));
    const session: UserSession = {
      ...(existing ?? emptySession(profile)),
      profile,
      updatedAt: new Date().toISOString(),
    };
    await redis.set(userKey(key), session);
    await redis.sadd(INDEX_KEY, key);
  },

  async getUserByPhone(phone) {
    return getSession(getRedis(), phone);
  },

  async findUserByPhone(phone) {
    return this.getUserByPhone(phone);
  },

  async listUserPhones() {
    const redis = getRedis();
    return (await redis.smembers(INDEX_KEY)) as string[];
  },

  async addWhatsAppMessage(phone, message) {
    const redis = getRedis();
    const session = await getSession(redis, phone);
    if (!session) return;
    const key = normalizePhone(session.profile.whatsappNumber);
    session.whatsappMessages = [...session.whatsappMessages, message].slice(-200);
    session.updatedAt = new Date().toISOString();
    await redis.set(userKey(key), session);
  },

  async getWhatsAppMessages(phone) {
    const session = await getSession(getRedis(), phone);
    return session?.whatsappMessages ?? [];
  },

  async markAlertSent(phone, alertKey) {
    const redis = getRedis();
    const session = await getSession(redis, phone);
    if (!session) return;
    const key = normalizePhone(session.profile.whatsappNumber);
    session.sentAlerts[alertKey] = new Date().toISOString();
    session.updatedAt = new Date().toISOString();
    await redis.set(userKey(key), session);
  },

  async getSentAlerts(phone) {
    const session = await getSession(getRedis(), phone);
    return session?.sentAlerts ?? {};
  },

  async addChatTurn(phone, userText, assistantText) {
    const redis = getRedis();
    const session = await getSession(redis, phone);
    if (!session) return;
    const key = normalizePhone(session.profile.whatsappNumber);
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
    await redis.set(userKey(key), session);
  },

  async getChatHistory(phone, limit = 10) {
    const session = await getSession(getRedis(), phone);
    return (session?.chatHistory ?? []).slice(-limit);
  },

  async setEmergencyPaused(phone, paused) {
    const redis = getRedis();
    const session = await getSession(redis, phone);
    if (!session) return;
    const key = normalizePhone(session.profile.whatsappNumber);
    session.emergencyPaused = paused;
    session.updatedAt = new Date().toISOString();
    await redis.set(userKey(key), session);
  },

  async isEmergencyPaused(phone) {
    const session = await getSession(getRedis(), phone);
    return session?.emergencyPaused ?? false;
  },
};
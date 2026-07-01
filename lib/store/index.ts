import { fileUserStore } from "./file-store";
import { redisUserStore } from "./redis-store";
import { sqliteUserStore } from "./sqlite-store";
import type { UserStore } from "./types";

export type DbDriver = "redis" | "sqlite" | "file";

let cached: UserStore | null = null;

export function resolveDbDriver(): DbDriver {
  const explicit = process.env.BFIT_DB_DRIVER?.toLowerCase();
  if (explicit === "redis" || explicit === "sqlite" || explicit === "file") {
    return explicit;
  }

  const hasRedis =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (hasRedis) return "redis";
  return "sqlite";
}

export function getUserStore(): UserStore {
  if (cached) return cached;

  const driver = resolveDbDriver();
  if (driver === "redis") {
    cached = redisUserStore;
  } else if (driver === "file") {
    cached = fileUserStore;
  } else {
    cached = sqliteUserStore;
  }

  return cached;
}

export type { UserSession, UserStore } from "./types";
import type { StateStorage } from "zustand/middleware";
import {
  clientDbGet,
  clientDbRemove,
  clientDbSet,
  initClientDb,
} from "@/lib/db/client/connection";
import { securePersistStorage } from "@/lib/storage/secure-persist";

let sqliteReady = false;

export async function ensureSqliteReady(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (sqliteReady) return true;
  try {
    await initClientDb();
    sqliteReady = true;
    return true;
  } catch (err) {
    console.warn("[sqlite] Client DB init failed, using legacy storage:", err);
    return false;
  }
}

export const sqlitePersistStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === "undefined") return null;
    const ready = await ensureSqliteReady();
    if (!ready) return securePersistStorage.getItem(name);
    const value = await clientDbGet(name);
    if (value !== null) return value;
    return securePersistStorage.getItem(name);
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === "undefined") return;
    const ready = await ensureSqliteReady();
    if (ready) {
      await clientDbSet(name, value);
    }
    await securePersistStorage.setItem(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    if (typeof window === "undefined") return;
    const ready = await ensureSqliteReady();
    if (ready) {
      await clientDbRemove(name);
    }
    await securePersistStorage.removeItem(name);
  },
};
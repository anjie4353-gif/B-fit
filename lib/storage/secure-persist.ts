import type { StateStorage } from "zustand/middleware";
import { isNativePlatform } from "@/lib/notifications/platform";

async function preferences() {
  const { Preferences } = await import("@capacitor/preferences");
  return Preferences;
}

export const securePersistStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === "undefined") return null;
    if (isNativePlatform()) {
      try {
        const Prefs = await preferences();
        const { value } = await Prefs.get({ key: name });
        return value;
      } catch {
        return localStorage.getItem(name);
      }
    }
    return localStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === "undefined") return;
    if (isNativePlatform()) {
      try {
        const Prefs = await preferences();
        await Prefs.set({ key: name, value });
        return;
      } catch {
        localStorage.setItem(name, value);
        return;
      }
    }
    localStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === "undefined") return;
    if (isNativePlatform()) {
      try {
        const Prefs = await preferences();
        await Prefs.remove({ key: name });
        return;
      } catch {
        localStorage.removeItem(name);
        return;
      }
    }
    localStorage.removeItem(name);
  },
};
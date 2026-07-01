"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { sqlitePersistStorage } from "@/lib/storage/sqlite-persist";
import type {
  ActiveReminderAlert,
  AppLanguage,
  ChatMessage,
  DailyLog,
  ReminderInstanceState,
  UserProfile,
  WaterReminderHistoryEntry,
  WaterReminderSettings,
  WellnessPlan,
  WhatsAppMessage,
} from "@/types";
import { DEFAULT_WATER_SETTINGS } from "@/lib/hydration/water-reminders";

interface UserStore {
  profile: Partial<UserProfile> | null;
  language: AppLanguage | null;
  firstInstallDate: string | null;
  waterReminderHistory: WaterReminderHistoryEntry[];
  wellnessPlan: WellnessPlan | null;
  reminderStates: Record<string, ReminderInstanceState>;
  activeReminder: ActiveReminderAlert | null;
  dailyLogs: DailyLog[];
  chatMessages: ChatMessage[];
  whatsappMessages: WhatsAppMessage[];
  sentAlerts: Record<string, string>;
  planReady: boolean;
  emergencyPaused: boolean;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLanguage: (language: AppLanguage) => void;
  ensureInstallDate: () => void;
  setWaterSettings: (settings: WaterReminderSettings) => void;
  pauseWaterReminders: (until?: string | null) => void;
  resumeWaterReminders: () => void;
  addWaterHistory: (entry: WaterReminderHistoryEntry) => void;
  markWaterConsumed: (glasses?: number) => void;
  skipWaterReminder: () => void;
  setWellnessPlan: (plan: WellnessPlan | null) => void;
  setReminderState: (key: string, state: ReminderInstanceState) => void;
  setActiveReminder: (alert: ActiveReminderAlert | null) => void;
  markReminderDone: (key: string) => void;
  snoozeReminder: (key: string, minutes?: number) => void;
  stopReminder: (key: string) => void;
  addDailyLog: (log: DailyLog) => void;
  addChatMessage: (message: ChatMessage) => void;
  addWhatsAppMessage: (message: WhatsAppMessage) => void;
  updateWhatsAppMessage: (id: string, updates: Partial<WhatsAppMessage>) => void;
  mergeWhatsAppMessages: (messages: WhatsAppMessage[]) => void;
  markAlertSent: (key: string) => void;
  setPlanReady: (ready: boolean) => void;
  setEmergencyPaused: (paused: boolean) => void;
  clearSession: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      language: null,
      firstInstallDate: null,
      waterReminderHistory: [],
      wellnessPlan: null,
      reminderStates: {},
      activeReminder: null,
      dailyLogs: [],
      chatMessages: [],
      whatsappMessages: [],
      sentAlerts: {},
      planReady: false,
      emergencyPaused: false,

      setProfile: (profile) => {
        const now = new Date().toISOString();
        const state = get();
        set({
          profile: {
            ...profile,
            fullName: profile.fullName ?? profile.name,
            registeredAt: profile.registeredAt ?? now,
            firstInstallDate: profile.firstInstallDate ?? state.firstInstallDate ?? now,
            onboardedAt: profile.onboardedAt ?? now,
            language: profile.language ?? state.language ?? "en",
            waterReminderSettings:
              profile.waterReminderSettings ??
              state.profile?.waterReminderSettings ??
              DEFAULT_WATER_SETTINGS,
          },
        });
      },

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : updates,
        })),

      setLanguage: (language) => {
        set({ language });
        set((state) => ({
          profile: state.profile ? { ...state.profile, language } : state.profile,
        }));
      },

      ensureInstallDate: () => {
        const state = get();
        if (state.firstInstallDate) return;
        const now = new Date().toISOString();
        set({
          firstInstallDate: now,
          profile: state.profile
            ? {
                ...state.profile,
                firstInstallDate: state.profile.firstInstallDate ?? now,
                registeredAt: state.profile.registeredAt ?? now,
              }
            : state.profile,
        });
      },

      setWaterSettings: (settings) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, waterReminderSettings: settings }
            : state.profile,
        })),

      pauseWaterReminders: (until = null) =>
        set((state) => {
          const current =
            state.profile?.waterReminderSettings ?? DEFAULT_WATER_SETTINGS;
          return {
            profile: state.profile
              ? {
                  ...state.profile,
                  waterReminderSettings: {
                    ...current,
                    paused: true,
                    pausedUntil: until,
                  },
                }
              : state.profile,
          };
        }),

      resumeWaterReminders: () =>
        set((state) => {
          const current =
            state.profile?.waterReminderSettings ?? DEFAULT_WATER_SETTINGS;
          return {
            profile: state.profile
              ? {
                  ...state.profile,
                  waterReminderSettings: {
                    ...current,
                    paused: false,
                    pausedUntil: null,
                    enabled: true,
                  },
                }
              : state.profile,
          };
        }),

      addWaterHistory: (entry) =>
        set((state) => ({
          waterReminderHistory: [entry, ...state.waterReminderHistory].slice(0, 200),
        })),

      markWaterConsumed: (glasses = 1) => {
        const state = get();
        const today = new Date().toISOString().slice(0, 10);
        const existing = state.dailyLogs.find((l) => l.date === today);
        const log: DailyLog = existing
          ? { ...existing, waterIntake: existing.waterIntake + glasses }
          : {
              date: today,
              waterIntake: glasses,
              steps: 0,
              sleepHours: 0,
              mood: 3,
              energyLevel: 3,
            };
        set((s) => ({
          dailyLogs: [...s.dailyLogs.filter((l) => l.date !== today), log],
          waterReminderHistory: [
            {
              id: crypto.randomUUID(),
              scheduledAt: new Date().toISOString(),
              action: "consumed" as const,
              glasses,
              recordedAt: new Date().toISOString(),
            },
            ...s.waterReminderHistory,
          ].slice(0, 200),
        }));
      },

      skipWaterReminder: () =>
        set((state) => ({
          waterReminderHistory: [
            {
              id: crypto.randomUUID(),
              scheduledAt: new Date().toISOString(),
              action: "skipped" as const,
              recordedAt: new Date().toISOString(),
            },
            ...state.waterReminderHistory,
          ].slice(0, 200),
        })),

      setWellnessPlan: (plan) => set({ wellnessPlan: plan, planReady: Boolean(plan) }),

      setReminderState: (key, state) =>
        set((s) => ({
          reminderStates: { ...s.reminderStates, [key]: state },
        })),

      setActiveReminder: (alert) => set({ activeReminder: alert }),

      markReminderDone: (key) =>
        set((s) => ({
          reminderStates: {
            ...s.reminderStates,
            [key]: {
              ...(s.reminderStates[key] ?? {
                attempts: 0,
                lastFiredAt: null,
                doneAt: null,
                snoozedUntil: null,
                status: "pending",
              }),
              status: "done",
              doneAt: new Date().toISOString(),
              snoozedUntil: null,
            },
          },
          activeReminder: null,
        })),

      snoozeReminder: (key, minutes = 10) =>
        set((s) => ({
          reminderStates: {
            ...s.reminderStates,
            [key]: {
              ...(s.reminderStates[key] ?? {
                attempts: 0,
                lastFiredAt: null,
                doneAt: null,
                snoozedUntil: null,
                status: "pending",
              }),
              snoozedUntil: new Date(
                Date.now() + minutes * 60 * 1000
              ).toISOString(),
            },
          },
          activeReminder: null,
        })),

      stopReminder: (key) =>
        set((s) => ({
          reminderStates: {
            ...s.reminderStates,
            [key]: {
              ...(s.reminderStates[key] ?? {
                attempts: 0,
                lastFiredAt: null,
                doneAt: null,
                snoozedUntil: null,
                status: "pending",
              }),
              status: "stopped",
              snoozedUntil: null,
            },
          },
          activeReminder: null,
        })),

      addDailyLog: (log) =>
        set((state) => {
          const filtered = state.dailyLogs.filter((l) => l.date !== log.date);
          return { dailyLogs: [...filtered, log] };
        }),

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      addWhatsAppMessage: (message) =>
        set((state) => ({
          whatsappMessages: [...state.whatsappMessages, message],
        })),

      updateWhatsAppMessage: (id, updates) =>
        set((state) => ({
          whatsappMessages: state.whatsappMessages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      mergeWhatsAppMessages: (messages) =>
        set((state) => {
          const byId = new Map(
            state.whatsappMessages.map((m) => [m.id, m] as const)
          );
          for (const m of messages) {
            byId.set(m.id, m);
          }
          return {
            whatsappMessages: [...byId.values()].sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            ),
          };
        }),

      markAlertSent: (key) =>
        set((state) => ({
          sentAlerts: { ...state.sentAlerts, [key]: new Date().toISOString() },
        })),

      setPlanReady: (ready) => set({ planReady: ready }),

      setEmergencyPaused: (paused) => set({ emergencyPaused: paused }),

      clearSession: () =>
        set({
          profile: null,
          language: null,
          firstInstallDate: null,
          waterReminderHistory: [],
          wellnessPlan: null,
          reminderStates: {},
          activeReminder: null,
          dailyLogs: [],
          chatMessages: [],
          whatsappMessages: [],
          sentAlerts: {},
          planReady: false,
          emergencyPaused: false,
        }),
    }),
    {
      name: "bfit-session",
      storage: createJSONStorage(() => sqlitePersistStorage),
      skipHydration: true,
      version: 3,
      migrate: (persisted) => {
        const p = persisted as Partial<UserStore>;
        return {
          ...p,
          language: p.language ?? p.profile?.language ?? null,
          firstInstallDate:
            p.firstInstallDate ?? p.profile?.firstInstallDate ?? null,
          waterReminderHistory: p.waterReminderHistory ?? [],
        } as UserStore;
      },
    }
  )
);
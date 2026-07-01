"use client";

import { useEffect } from "react";
import { useUserStore } from "@/hooks/useUserStore";
import {
  ensureNotificationChannels,
  registerNotificationListeners,
  requestNotificationPermission,
} from "@/lib/notifications/native";
import { syncWaterNotificationSchedule } from "@/lib/hydration/water-reminders";
import { createHistoryEntry } from "@/lib/hydration/water-reminders";

export function NotificationBootstrap() {
  const profile = useUserStore((s) => s.profile);
  const language = useUserStore((s) => s.language);
  const ensureInstallDate = useUserStore((s) => s.ensureInstallDate);
  const addWaterHistory = useUserStore((s) => s.addWaterHistory);
  const markWaterConsumed = useUserStore((s) => s.markWaterConsumed);

  useEffect(() => {
    ensureInstallDate();
    void ensureNotificationChannels();
  }, [ensureInstallDate]);

  useEffect(() => {
    const logFired = () =>
      addWaterHistory(createHistoryEntry("fired", new Date().toISOString()));

    return registerNotificationListeners({
      onWaterAction: logFired,
      onWaterReceived: logFired,
      onAppResume: () => {
        const s = useUserStore.getState().profile?.waterReminderSettings;
        const p = useUserStore.getState().profile;
        const lang = useUserStore.getState().language ?? p?.language ?? "en";
        if (s && p?.consentGiven) {
          void syncWaterNotificationSchedule(
            s,
            p.nickname ?? p.fullName,
            lang
          );
        }
      },
    });
  }, [addWaterHistory]);

  useEffect(() => {
    const settings = profile?.waterReminderSettings;
    if (!profile?.consentGiven || !settings) return;

    const sync = () =>
      void syncWaterNotificationSchedule(
        settings,
        profile.nickname ?? profile.fullName,
        language ?? profile.language ?? "en"
      );

    sync();

    if (typeof window !== "undefined") {
      const onVisible = () => {
        if (document.visibilityState === "visible") sync();
      };
      window.addEventListener("focus", sync);
      document.addEventListener("visibilitychange", onVisible);
      return () => {
        window.removeEventListener("focus", sync);
        document.removeEventListener("visibilitychange", onVisible);
      };
    }
  }, [profile, language]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "WATER_CONSUMED") {
        markWaterConsumed(event.data.glasses ?? 1);
      }
    };
    navigator.serviceWorker?.addEventListener("message", handler);
    return () => navigator.serviceWorker?.removeEventListener("message", handler);
  }, [markWaterConsumed]);

  return null;
}

export async function bootstrapNotificationsOnOnboarding(): Promise<boolean> {
  return requestNotificationPermission();
}
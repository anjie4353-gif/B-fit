"use client";

import { Droplets, Pause, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/useUserStore";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { syncWaterNotificationSchedule } from "@/lib/hydration/water-reminders";
import { createHistoryEntry } from "@/lib/hydration/water-reminders";

export function WaterReminderPanel({ compact = false }: { compact?: boolean }) {
  const { t, language } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const pauseWaterReminders = useUserStore((s) => s.pauseWaterReminders);
  const resumeWaterReminders = useUserStore((s) => s.resumeWaterReminders);
  const markWaterConsumed = useUserStore((s) => s.markWaterConsumed);
  const skipWaterReminder = useUserStore((s) => s.skipWaterReminder);
  const addWaterHistory = useUserStore((s) => s.addWaterHistory);

  const settings = profile?.waterReminderSettings;
  if (!settings) return null;

  const handlePauseResume = async () => {
    if (settings.paused) {
      resumeWaterReminders();
      addWaterHistory(createHistoryEntry("resumed", new Date().toISOString()));
      await syncWaterNotificationSchedule(
        { ...settings, paused: false },
        profile?.nickname ?? profile?.fullName,
        language
      );
    } else {
      pauseWaterReminders();
      addWaterHistory(createHistoryEntry("paused", new Date().toISOString()));
      await syncWaterNotificationSchedule(
        { ...settings, paused: true },
        profile?.nickname ?? profile?.fullName,
        language
      );
    }
  };

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "premium-card space-y-3 p-4"}>
      {!compact && (
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-brand-sky" />
          <span className="font-display text-sm font-bold text-accent-900">
            {t("profile.waterReminders")}
          </span>
          <span className="premium-badge ml-auto text-[10px]">
            {settings.paused ? t("profile.remindersPaused") : t("profile.remindersActive")}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => markWaterConsumed(1)}>
          <Droplets className="h-4 w-4" />
          {t("water.markConsumed")}
        </Button>
        <Button size="sm" variant="outline" onClick={skipWaterReminder}>
          <SkipForward className="h-4 w-4" />
          {t("water.skip")}
        </Button>
        <Button size="sm" variant="ghost" onClick={handlePauseResume}>
          {settings.paused ? (
            <>
              <Play className="h-4 w-4" />
              {t("profile.resumeReminders")}
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              {t("profile.pauseReminders")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
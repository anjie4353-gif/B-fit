"use client";

import { Bell, Check, Clock, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { useUserStore } from "@/hooks/useUserStore";
import { reminderKey, todayKey } from "@/lib/plan/reminder-logic";

export function ReminderAlert() {
  const { t } = useTranslation();
  const activeReminder = useUserStore((s) => s.activeReminder);
  const markReminderDone = useUserStore((s) => s.markReminderDone);
  const snoozeReminder = useUserStore((s) => s.snoozeReminder);
  const stopReminder = useUserStore((s) => s.stopReminder);

  if (!activeReminder) return null;

  const key = reminderKey(todayKey(), activeReminder.slotId);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 pb-8 backdrop-blur-sm sm:items-center">
      <div
        className="glass-strong w-full max-w-md rounded-[22px] p-5 shadow-elev-4"
        role="alertdialog"
        aria-labelledby="reminder-title"
      >
        <div className="mb-3 flex items-center gap-2 text-accent-600">
          <Bell className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-wide">
            Reminder {activeReminder.attempt}/{activeReminder.maxAttempts}
          </span>
        </div>
        <h2
          id="reminder-title"
          className="font-display text-xl font-bold text-accent-900"
        >
          {activeReminder.label}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-accent-700 leading-relaxed">
          {activeReminder.message}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Button
            className="col-span-3"
            size="lg"
            onClick={() => markReminderDone(key)}
          >
            <Check className="h-5 w-5" />
            {t("plan.reminderDone")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => snoozeReminder(key, 10)}
          >
            <Clock className="h-4 w-4" />
            {t("plan.reminderSnooze")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="col-span-2"
            onClick={() => stopReminder(key)}
          >
            <Ban className="h-4 w-4" />
            {t("plan.reminderStop")}
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-accent-500">
          {t("plan.reminderSnoozeHint")}
        </p>
      </div>
    </div>
  );
}
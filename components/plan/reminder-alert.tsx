"use client";

import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/useUserStore";
import { reminderKey, todayKey } from "@/lib/plan/reminder-logic";

export function ReminderAlert() {
  const activeReminder = useUserStore((s) => s.activeReminder);
  const markReminderDone = useUserStore((s) => s.markReminderDone);

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
        <Button
          className="mt-5 w-full"
          size="lg"
          onClick={() => markReminderDone(key)}
        >
          <Check className="h-5 w-5" />
          Done
        </Button>
        <p className="mt-2 text-center text-[10px] text-accent-500">
          Missed? We&apos;ll remind again in 5 min (up to 3 times).
        </p>
      </div>
    </div>
  );
}
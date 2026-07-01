"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { useUserStore } from "@/hooks/useUserStore";
import { REMINDER_TICK_MS } from "@/lib/plan/constants";
import { isPlanExpired } from "@/lib/plan/build-schedule";
import {
  afterFireState,
  defaultReminderState,
  nextReminderToFire,
  reminderKey,
  toActiveAlert,
  todayKey,
} from "@/lib/plan/reminder-logic";
import { playReminderSound } from "@/lib/pwa/notifications";
import { showPlanNotification } from "@/lib/notifications/native";

export function ReminderEngine() {
  const profile = useUserStore((s) => s.profile);
  const wellnessPlan = useUserStore((s) => s.wellnessPlan);
  const reminderStates = useUserStore((s) => s.reminderStates);
  const setReminderState = useUserStore((s) => s.setReminderState);
  const setActiveReminder = useUserStore((s) => s.setActiveReminder);
  const firing = useRef(false);

  useEffect(() => {
    if (!profile?.consentGiven || !wellnessPlan) return;
    if (isPlanExpired(wellnessPlan.expiresAt)) return;

    const tick = async () => {
      if (firing.current || useUserStore.getState().activeReminder) return;
      const next = nextReminderToFire(
        wellnessPlan.reminders,
        reminderStates
      );
      if (!next) return;

      firing.current = true;
      const now = new Date();
      const updated = afterFireState(next.state, now);
      setReminderState(next.key, updated);
      setActiveReminder(toActiveAlert(next.slot, updated.attempts));

      playReminderSound();
      await showPlanNotification(
        next.slot.label,
        next.slot.message,
        next.key
      );
      firing.current = false;
    };

    tick();
    const interval = setInterval(tick, REMINDER_TICK_MS);
    return () => clearInterval(interval);
  }, [profile, wellnessPlan, reminderStates, setReminderState, setActiveReminder]);

  useEffect(() => {
    const date = todayKey();
    const prefix = `${date}-`;
    const stale = Object.keys(reminderStates).filter(
      (k) => k.startsWith(prefix) === false && k.length > 0
    );
    if (stale.length > 10) {
      const todayOnly = Object.fromEntries(
        Object.entries(reminderStates).filter(([k]) => k.startsWith(prefix))
      );
      useUserStore.setState({ reminderStates: todayOnly });
    }
  }, [reminderStates]);

  useEffect(() => {
    if (!wellnessPlan) return;
    const date = format(new Date(), "yyyy-MM-dd");
    for (const slot of wellnessPlan.reminders) {
      const key = reminderKey(date, slot.id);
      if (!reminderStates[key]) {
        setReminderState(key, defaultReminderState());
      }
    }
  }, [wellnessPlan, reminderStates, setReminderState]);

  return null;
}
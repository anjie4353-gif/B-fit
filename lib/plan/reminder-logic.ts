import { format } from "date-fns";
import {
  REMINDER_MAX_ATTEMPTS,
  REMINDER_RETRY_GAP_MS,
} from "@/lib/plan/constants";
import type {
  ActiveReminderAlert,
  PlanReminderSlot,
  ReminderInstanceState,
} from "@/types";

export function reminderKey(date: string, slotId: string): string {
  return `${date}-${slotId}`;
}

export function todayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function defaultReminderState(): ReminderInstanceState {
  return {
    status: "pending",
    attempts: 0,
    lastFiredAt: null,
    doneAt: null,
  };
}

function dueDateTime(time: string, now: Date): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
}

export function shouldFireReminder(
  slot: PlanReminderSlot,
  state: ReminderInstanceState,
  now = new Date()
): boolean {
  if (state.status === "done" || state.status === "stopped") return false;
  if (state.attempts >= REMINDER_MAX_ATTEMPTS) return false;

  const due = dueDateTime(slot.time, now);
  if (now.getTime() < due.getTime()) return false;

  if (state.attempts === 0) return true;

  if (!state.lastFiredAt) return true;
  const elapsed = now.getTime() - new Date(state.lastFiredAt).getTime();
  return elapsed >= REMINDER_RETRY_GAP_MS;
}

export function nextReminderToFire(
  slots: PlanReminderSlot[],
  states: Record<string, ReminderInstanceState>,
  now = new Date()
): { slot: PlanReminderSlot; state: ReminderInstanceState; key: string } | null {
  const date = todayKey();
  for (const slot of slots) {
    const key = reminderKey(date, slot.id);
    const state = states[key] ?? defaultReminderState();
    if (shouldFireReminder(slot, state, now)) {
      return { slot, state, key };
    }
  }
  return null;
}

export function afterFireState(
  state: ReminderInstanceState,
  now = new Date()
): ReminderInstanceState {
  const attempts = state.attempts + 1;
  return {
    ...state,
    attempts,
    lastFiredAt: now.toISOString(),
    status: attempts >= REMINDER_MAX_ATTEMPTS ? "stopped" : state.status,
  };
}

export function toActiveAlert(
  slot: PlanReminderSlot,
  attempts: number
): ActiveReminderAlert {
  return {
    slotId: slot.id,
    label: slot.label,
    message: slot.message,
    attempt: attempts,
    maxAttempts: REMINDER_MAX_ATTEMPTS,
  };
}
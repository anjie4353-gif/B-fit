import { format } from "date-fns";
import type { HydrationSlot } from "@/lib/hydration/schedule";
import { scheduleDateTime } from "@/lib/hydration/schedule";
import { WATER_OVERDUE_WINDOW_MS } from "@/lib/plan/constants";
import { showReminderNotification } from "@/lib/pwa/notifications";

const waterTimers = new Map<string, number>();

function firedStorageKey(date: string): string {
  return `bfit-water-fired-${date}`;
}

function markSlotFired(date: string, slotId: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = firedStorageKey(date);
    const raw = sessionStorage.getItem(key);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(slotId);
    sessionStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

function wasSlotFired(date: string, slotId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(firedStorageKey(date));
    if (!raw) return false;
    return (JSON.parse(raw) as string[]).includes(slotId);
  } catch {
    return false;
  }
}

export function cancelWebWaterReminders(): void {
  for (const timer of waterTimers.values()) clearTimeout(timer);
  waterTimers.clear();
}

export function scheduleWebWaterReminders(
  slots: HydrationSlot[],
  copyForSlot: (slot: HydrationSlot) => { title: string; body: string }
): number {
  if (typeof window === "undefined") return 0;

  cancelWebWaterReminders();
  const now = Date.now();
  const dateStr = format(new Date(), "yyyy-MM-dd");
  let scheduled = 0;

  for (const slot of slots) {
    const at = scheduleDateTime(dateStr, slot.time);
    const timerId = `${dateStr}-${slot.id}`;
    if (wasSlotFired(dateStr, slot.id)) continue;

    const copy = copyForSlot(slot);

    if (at.getTime() <= now) {
      const overdue = now - at.getTime();
      if (overdue > WATER_OVERDUE_WINDOW_MS) continue;
      const timer = window.setTimeout(() => {
        void showReminderNotification(copy.title, copy.body, timerId, {
          reminderKey: timerId,
          kind: "water",
        });
        markSlotFired(dateStr, slot.id);
        waterTimers.delete(timerId);
      }, 400 + scheduled * 800);
      waterTimers.set(timerId, timer);
      scheduled += 1;
      continue;
    }

    const delay = at.getTime() - now;
    const timer = window.setTimeout(() => {
      void showReminderNotification(copy.title, copy.body, timerId, {
        reminderKey: timerId,
        kind: "water",
      });
      markSlotFired(dateStr, slot.id);
      waterTimers.delete(timerId);
    }, delay);
    waterTimers.set(timerId, timer);
    scheduled += 1;
  }

  return scheduled;
}
export interface HydrationSlot {
  id: string;
  time: string;
  glassNumber: number;
  ml: number;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minutesToTime(total: number): string {
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function calculateWaterReminderSchedule(
  wakeTime: string,
  sleepTime: string,
  dailyGlasses: number,
  mlPerGlass = 250
): HydrationSlot[] {
  const wake = parseTimeToMinutes(wakeTime);
  let sleep = parseTimeToMinutes(sleepTime);
  if (sleep <= wake) sleep += 24 * 60;

  const awakeMinutes = sleep - wake;
  const count = Math.max(1, Math.min(dailyGlasses, 16));
  const interval = Math.floor(awakeMinutes / count);

  return Array.from({ length: count }, (_, i) => {
    const minute = wake + interval * i + Math.min(15, Math.floor(interval / 4));
    return {
      id: `water-${i + 1}`,
      time: minutesToTime(minute),
      glassNumber: i + 1,
      ml: mlPerGlass,
    };
  });
}

export function scheduleDateTime(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(y, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, 0, 0);
}
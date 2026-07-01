import { addDays, differenceInDays, parseISO, isValid } from "date-fns";
import type { PeriodPrediction } from "@/types";

export function calculatePeriodPrediction(
  lastPeriodDate: string,
  cycleLength: number | "irregular"
): PeriodPrediction {
  const lastPeriod = parseISO(lastPeriodDate);

  if (!isValid(lastPeriod) || cycleLength === "irregular") {
    return {
      nextPeriodDate: null,
      ovulationDate: null,
      pmsWindowStart: null,
      pmsWindowEnd: null,
      daysUntilPeriod: null,
      phase: "unknown",
    };
  }

  const nextPeriodDate = addDays(lastPeriod, cycleLength);
  const ovulationDate = addDays(lastPeriod, Math.round(cycleLength / 2));
  const pmsWindowStart = addDays(nextPeriodDate, -7);
  const pmsWindowEnd = addDays(nextPeriodDate, -1);
  const daysUntilPeriod = differenceInDays(nextPeriodDate, new Date());
  const daysSincePeriod = differenceInDays(new Date(), lastPeriod);
  const today = new Date();

  let phase: PeriodPrediction["phase"] = "follicular";
  if (daysSincePeriod <= 5) phase = "menstrual";
  else if (daysSincePeriod >= cycleLength - 14 && daysSincePeriod < cycleLength - 10)
    phase = "follicular";
  else if (daysSincePeriod >= cycleLength - 14 && daysSincePeriod <= cycleLength - 12)
    phase = "ovulation";
  else if (
    today >= pmsWindowStart &&
    today <= pmsWindowEnd
  )
    phase = "pms";
  else if (daysSincePeriod > cycleLength - 12) phase = "luteal";

  return {
    nextPeriodDate,
    ovulationDate,
    pmsWindowStart,
    pmsWindowEnd,
    daysUntilPeriod,
    phase,
  };
}

export function getPeriodReminderType(
  daysUntilPeriod: number | null
): "period_7d" | "period_3d" | "period_1d" | "period_day1" | null {
  if (daysUntilPeriod === null) return null;
  if (daysUntilPeriod === 0) return "period_day1";
  if (daysUntilPeriod === 1) return "period_1d";
  if (daysUntilPeriod === 3) return "period_3d";
  if (daysUntilPeriod === 7) return "period_7d";
  return null;
}

export const PERIOD_TIPS = {
  hydration: "Aim for 2-2.5L water daily. Warm ginger tea may ease discomfort.",
  iron: "Include spinach, lentils, dates, and paneer for iron support.",
  exercise:
    "Try gentle yoga, walking, or stretching. A heating pad may help mild cramps.",
  pms: "Rest well, reduce caffeine, eat balanced meals, and practice gentle movement.",
};
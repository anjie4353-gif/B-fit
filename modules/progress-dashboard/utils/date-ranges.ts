import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  parseISO,
  eachDayOfInterval,
  isWithinInterval,
} from "date-fns";
import type { DateRange, DateRangePreset } from "../types";

export function resolveDateRange(
  preset: DateRangePreset,
  customFrom?: string,
  customTo?: string
): DateRange {
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");

  switch (preset) {
    case "today":
      return { preset, from: today, to: today };
    case "yesterday": {
      const y = format(subDays(now, 1), "yyyy-MM-dd");
      return { preset, from: y, to: y };
    }
    case "last7":
      return { preset, from: format(subDays(now, 6), "yyyy-MM-dd"), to: today };
    case "last30":
      return { preset, from: format(subDays(now, 29), "yyyy-MM-dd"), to: today };
    case "thisWeek":
      return {
        preset,
        from: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        to: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      };
    case "lastWeek": {
      const lw = subWeeks(now, 1);
      return {
        preset,
        from: format(startOfWeek(lw, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        to: format(endOfWeek(lw, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      };
    }
    case "thisMonth":
      return {
        preset,
        from: format(startOfMonth(now), "yyyy-MM-dd"),
        to: format(endOfMonth(now), "yyyy-MM-dd"),
      };
    case "custom":
      return {
        preset,
        from: customFrom ?? format(subDays(now, 6), "yyyy-MM-dd"),
        to: customTo ?? today,
      };
    default:
      return { preset: "last7", from: format(subDays(now, 6), "yyyy-MM-dd"), to: today };
  }
}

export function daysInRange(range: DateRange): string[] {
  return eachDayOfInterval({
    start: parseISO(range.from),
    end: parseISO(range.to),
  }).map((d) => format(d, "yyyy-MM-dd"));
}

export function isDateInRange(date: string, range: DateRange): boolean {
  return isWithinInterval(parseISO(date), {
    start: parseISO(range.from),
    end: parseISO(range.to),
  });
}

export const DATE_PRESET_LABELS: Record<DateRangePreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 Days",
  last30: "Last 30 Days",
  thisWeek: "This Week",
  lastWeek: "Last Week",
  thisMonth: "This Month",
  custom: "Custom Range",
};
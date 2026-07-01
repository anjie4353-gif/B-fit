import { format, parseISO, startOfWeek } from "date-fns";
import type { DailyLog } from "@/types";
import type {
  CrossFilterState,
  ProgressDataInput,
  ProgressFilters,
  ProgressOverview,
  ProgressTaskRow,
  DailyTrendPoint,
  HeatmapCell,
} from "../types";
import { daysInRange, isDateInRange } from "./date-ranges";

function buildTasksForDay(
  log: DailyLog | undefined,
  date: string,
  input: ProgressDataInput
): ProgressTaskRow[] {
  const rows: ProgressTaskRow[] = [];
  const waterActual = log?.waterIntake ?? 0;
  const stepsActual = log?.steps ?? 0;
  const sleepActual = log?.sleepHours ?? 0;
  const moodActual = log?.mood ?? 0;

  const goals = [
    {
      id: `${date}-water`,
      category: "hydration" as const,
      taskType: "water" as const,
      label: "Water intake",
      planned: input.waterGoal,
      actual: waterActual,
      completed: waterActual >= input.waterGoal,
    },
    {
      id: `${date}-steps`,
      category: "movement" as const,
      taskType: "steps" as const,
      label: "Daily steps",
      planned: input.stepsGoal,
      actual: stepsActual,
      completed: stepsActual >= input.stepsGoal,
    },
    {
      id: `${date}-sleep`,
      category: "sleep" as const,
      taskType: "sleep" as const,
      label: "Sleep hours",
      planned: input.sleepGoal,
      actual: sleepActual,
      completed: sleepActual >= input.sleepGoal,
    },
    {
      id: `${date}-mood`,
      category: "mood" as const,
      taskType: "mood" as const,
      label: "Mood check-in",
      planned: 1,
      actual: moodActual > 0 ? 1 : 0,
      completed: moodActual > 0,
    },
  ];

  for (const g of goals) {
    rows.push({
      ...g,
      date,
      project: "B-Fit Wellness",
      completionRate: g.planned > 0 ? Math.min(100, Math.round((g.actual / g.planned) * 100)) : 0,
    });
  }

  for (const [key, state] of Object.entries(input.reminderStates)) {
    if (!key.startsWith(`${date}-`)) continue;
    const slotId = key.slice(date.length + 1);
    const slot = input.planReminders?.find((r) => r.id === slotId);
    rows.push({
      id: key,
      date,
      category: "reminder",
      taskType: "plan_reminder",
      project: "Daily Plan",
      label: slot?.label ?? slotId,
      planned: 1,
      actual: state.status === "done" ? 1 : 0,
      completed: state.status === "done",
      completionRate: state.status === "done" ? 100 : 0,
    });
  }

  return rows;
}

function applyFilters(
  rows: ProgressTaskRow[],
  filters: ProgressFilters,
  cross: CrossFilterState
): ProgressTaskRow[] {
  return rows.filter((row) => {
    if (!isDateInRange(row.date, filters.dateRange)) return false;
    if (filters.categories.length && !filters.categories.includes(row.category)) return false;
    if (filters.taskTypes.length && !filters.taskTypes.includes(row.taskType)) return false;
    if (filters.projects.length && !filters.projects.includes(row.project)) return false;
    if (cross.selectedDate && row.date !== cross.selectedDate) return false;
    if (cross.selectedCategory && row.category !== cross.selectedCategory) return false;
    if (cross.selectedKpi === "completed" && !row.completed) return false;
    if (cross.selectedKpi === "pending" && row.completed) return false;
    return true;
  });
}

function calcStreak(dailyTrend: DailyTrendPoint[]): number {
  let streak = 0;
  for (let i = dailyTrend.length - 1; i >= 0; i--) {
    if (dailyTrend[i].total > 0 && dailyTrend[i].completionRate >= 50) streak++;
    else break;
  }
  return streak;
}

export function aggregateProgress(
  input: ProgressDataInput,
  filters: ProgressFilters,
  cross: CrossFilterState = {
    selectedDate: null,
    selectedCategory: null,
    selectedKpi: null,
  }
): ProgressOverview {
  const dates = daysInRange(filters.dateRange);
  const logByDate = new Map(input.dailyLogs.map((l) => [l.date, l]));

  let allRows: ProgressTaskRow[] = [];
  for (const date of dates) {
    allRows.push(...buildTasksForDay(logByDate.get(date), date, input));
  }

  allRows = applyFilters(allRows, filters, cross);

  const totalTasks = allRows.length;
  const completedTasks = allRows.filter((r) => r.completed).length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const dailyMap = new Map<string, DailyTrendPoint>();
  for (const date of dates) {
    const dayRows = allRows.filter((r) => r.date === date);
    const total = dayRows.length;
    const completed = dayRows.filter((r) => r.completed).length;
    dailyMap.set(date, {
      date,
      label: format(parseISO(date), "MMM d"),
      completed,
      total,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
    });
  }
  const dailyTrend = [...dailyMap.values()];

  const weekMap = new Map<string, { planned: number; actual: number }>();
  for (const row of allRows) {
    const wk = format(startOfWeek(parseISO(row.date), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const cur = weekMap.get(wk) ?? { planned: 0, actual: 0 };
    cur.planned += row.planned;
    cur.actual += row.actual;
    weekMap.set(wk, cur);
  }

  const weeklyCompare = [...weekMap.entries()].map(([week, v]) => ({
    week,
    label: format(parseISO(week), "MMM d"),
    planned: v.planned,
    actual: v.actual,
  }));

  const maxCount = Math.max(1, ...dailyTrend.map((d) => d.completed));
  const heatmap: HeatmapCell[] = dailyTrend.map((d) => ({
    date: d.date,
    count: d.completed,
    level: (Math.min(4, Math.round((d.completed / maxCount) * 4)) || 0) as HeatmapCell["level"],
  }));

  const donut = [
    { name: "Completed", value: completedTasks, color: "#14b8a6" },
    { name: "Pending", value: totalTasks - completedTasks, color: "#c4b5fd" },
  ];

  const dayCount = Math.max(1, dates.length);
  const weekCount = Math.max(1, weeklyCompare.length);

  return {
    kpis: {
      totalTasks,
      completedTasks,
      completionRate,
      dailyAverage: Math.round((completedTasks / dayCount) * 10) / 10,
      weeklyAverage: Math.round((completedTasks / weekCount) * 10) / 10,
      activeStreak: calcStreak(dailyTrend),
    },
    dailyTrend,
    dailyBars: dailyTrend,
    donut,
    weeklyCompare,
    weeklyArea: dailyTrend,
    heatmap,
    table: allRows.sort((a, b) => b.date.localeCompare(a.date)),
  };
}
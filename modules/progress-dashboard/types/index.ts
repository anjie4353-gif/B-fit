import type { DailyLog, MessageType, ReminderInstanceState } from "@/types";

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "custom";

export type ProgressCategory =
  | "hydration"
  | "movement"
  | "sleep"
  | "mood"
  | "reminder"
  | "wellness";

export type ProgressTaskType =
  | "water"
  | "steps"
  | "sleep"
  | "mood"
  | "plan_reminder"
  | "water_reminder";

export type DashboardSection =
  | "overview"
  | "daily"
  | "weekly"
  | "reports"
  | "settings";

export interface DateRange {
  preset: DateRangePreset;
  from: string;
  to: string;
}

export interface ProgressFilters {
  dateRange: DateRange;
  categories: ProgressCategory[];
  projects: string[];
  taskTypes: ProgressTaskType[];
  users: string[];
  teams: string[];
}

export interface CrossFilterState {
  selectedDate: string | null;
  selectedCategory: ProgressCategory | null;
  selectedKpi: string | null;
}

export interface SavedView {
  id: string;
  name: string;
  filters: ProgressFilters;
  section: DashboardSection;
  createdAt: string;
}

export interface ProgressTaskRow {
  id: string;
  date: string;
  category: ProgressCategory;
  taskType: ProgressTaskType;
  project: string;
  label: string;
  planned: number;
  actual: number;
  completed: boolean;
  completionRate: number;
}

export interface ProgressKpis {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  dailyAverage: number;
  weeklyAverage: number;
  activeStreak: number;
}

export interface DailyTrendPoint {
  date: string;
  label: string;
  completed: number;
  total: number;
  completionRate: number;
}

export interface WeeklyComparePoint {
  week: string;
  label: string;
  planned: number;
  actual: number;
}

export interface HeatmapCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ProgressOverview {
  kpis: ProgressKpis;
  dailyTrend: DailyTrendPoint[];
  dailyBars: DailyTrendPoint[];
  donut: { name: string; value: number; color: string }[];
  weeklyCompare: WeeklyComparePoint[];
  weeklyArea: DailyTrendPoint[];
  heatmap: HeatmapCell[];
  table: ProgressTaskRow[];
}

export interface ProgressDataInput {
  dailyLogs: DailyLog[];
  reminderStates: Record<string, ReminderInstanceState>;
  waterGoal: number;
  stepsGoal: number;
  sleepGoal: number;
  userName?: string;
  planReminders?: { id: string; label: string; type: MessageType }[];
}
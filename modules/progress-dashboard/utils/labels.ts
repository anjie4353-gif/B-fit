import type { DateRangePreset, ProgressCategory, ProgressTaskType } from "../types";

export function datePresetLabel(
  preset: DateRangePreset,
  t: (path: string) => string
): string {
  return t(`progress.datePresets.${preset}`);
}

export function categoryLabel(
  category: ProgressCategory,
  t: (path: string) => string
): string {
  return t(`progress.categories.${category}`);
}

export function taskTypeLabel(
  taskType: ProgressTaskType,
  t: (path: string) => string
): string {
  return t(`progress.taskTypes.${taskType}`);
}
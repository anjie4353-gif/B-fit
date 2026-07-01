"use client";

import { useTranslation } from "@/components/i18n/i18n-provider";
import type { DateRangePreset, ProgressCategory, ProgressTaskType } from "../../types";
import { resolveDateRange } from "../../utils/date-ranges";
import { categoryLabel, datePresetLabel, taskTypeLabel } from "../../utils/labels";
import { useProgressDashboardStore } from "../../hooks/useProgressDashboardStore";

const CATEGORIES: ProgressCategory[] = [
  "hydration",
  "movement",
  "sleep",
  "mood",
  "reminder",
];

const TASK_TYPES: ProgressTaskType[] = [
  "water",
  "steps",
  "sleep",
  "mood",
  "plan_reminder",
];

const DATE_PRESETS: DateRangePreset[] = [
  "today",
  "yesterday",
  "last7",
  "last30",
  "thisWeek",
  "lastWeek",
  "thisMonth",
  "custom",
];

export function GlobalFilters({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const filters = useProgressDashboardStore((s) => s.filters);
  const setFilters = useProgressDashboardStore((s) => s.setFilters);

  const selectClass =
    "glass-input h-9 min-w-0 rounded-lg px-2 text-xs text-accent-800";

  return (
    <div
      className={`flex flex-wrap gap-2 ${compact ? "" : "premium-card p-3"}`}
      role="search"
      aria-label={t("progress.filters.global")}
    >
      <select
        className={selectClass}
        value={filters.dateRange.preset}
        onChange={(e) =>
          setFilters({
            dateRange: resolveDateRange(e.target.value as DateRangePreset),
          })
        }
        aria-label={t("progress.filters.dateRange")}
      >
        {DATE_PRESETS.map((p) => (
          <option key={p} value={p}>
            {datePresetLabel(p, t)}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.categories[0] ?? ""}
        onChange={(e) =>
          setFilters({
            categories: e.target.value
              ? [e.target.value as ProgressCategory]
              : [],
          })
        }
        aria-label={t("progress.filters.category")}
      >
        <option value="">{t("progress.filters.allCategories")}</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {categoryLabel(c, t)}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.taskTypes[0] ?? ""}
        onChange={(e) =>
          setFilters({
            taskTypes: e.target.value
              ? [e.target.value as ProgressTaskType]
              : [],
          })
        }
        aria-label={t("progress.filters.taskType")}
      >
        <option value="">{t("progress.filters.allTaskTypes")}</option>
        {TASK_TYPES.map((type) => (
          <option key={type} value={type}>
            {taskTypeLabel(type, t)}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.projects[0] ?? ""}
        onChange={(e) =>
          setFilters({ projects: e.target.value ? [e.target.value] : [] })
        }
        aria-label={t("progress.filters.project")}
      >
        <option value="">{t("progress.filters.allProjects")}</option>
        <option value="B-Fit Wellness">{t("progress.projects.bfitWellness")}</option>
        <option value="Daily Plan">{t("progress.projects.dailyPlan")}</option>
      </select>
    </div>
  );
}
"use client";

import { X } from "lucide-react";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { categoryLabel, datePresetLabel } from "../../utils/labels";
import { useProgressDashboardStore } from "../../hooks/useProgressDashboardStore";

export function FilterChips() {
  const { t } = useTranslation();
  const filters = useProgressDashboardStore((s) => s.filters);
  const cross = useProgressDashboardStore((s) => s.crossFilter);
  const resetFilters = useProgressDashboardStore((s) => s.resetFilters);
  const clearCross = useProgressDashboardStore((s) => s.clearCrossFilter);
  const setFilters = useProgressDashboardStore((s) => s.setFilters);

  const chips: { label: string; onRemove: () => void }[] = [];

  chips.push({
    label: datePresetLabel(filters.dateRange.preset, t),
    onRemove: () => setFilters({ dateRange: { ...filters.dateRange, preset: "last7" } }),
  });

  filters.categories.forEach((c) =>
    chips.push({
      label: categoryLabel(c, t),
      onRemove: () =>
        setFilters({ categories: filters.categories.filter((x) => x !== c) }),
    })
  );

  if (cross.selectedDate) {
    chips.push({ label: cross.selectedDate, onRemove: () => clearCross() });
  }

  if (chips.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="list"
      aria-label={t("progress.filters.activeFilters")}
    >
      {chips.map((chip) => (
        <span
          key={chip.label}
          role="listitem"
          className="premium-badge inline-flex items-center gap-1"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="rounded-full p-0.5 hover:bg-accent-200"
            aria-label={t("progress.filters.removeFilter")}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={resetFilters}
        className="text-xs font-medium text-brand-violet underline"
      >
        {t("progress.filters.clearAll")}
      </button>
    </div>
  );
}
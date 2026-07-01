"use client";

import { CheckCircle2, Flame, ListTodo, Percent, TrendingUp } from "lucide-react";
import { useTranslation } from "@/components/i18n/i18n-provider";
import type { ProgressKpis } from "../../types";
import { AnimatedCounter } from "./AnimatedCounter";
import { useProgressDashboardStore } from "../../hooks/useProgressDashboardStore";

const cards = [
  { key: "totalTasks", labelKey: "progress.kpi.totalTasks", icon: ListTodo, suffix: "", kpi: null },
  { key: "completedTasks", labelKey: "progress.kpi.completed", icon: CheckCircle2, suffix: "", kpi: "completed" as const },
  { key: "completionRate", labelKey: "progress.kpi.completionRate", icon: Percent, suffix: "%", kpi: null },
  { key: "dailyAverage", labelKey: "progress.kpi.dailyAvg", icon: TrendingUp, suffix: "", kpi: null },
  { key: "weeklyAverage", labelKey: "progress.kpi.weeklyAvg", icon: TrendingUp, suffix: "", kpi: null },
  { key: "activeStreak", labelKey: "progress.kpi.activeStreak", icon: Flame, suffix: "", suffixKey: "progress.kpi.streakSuffix", kpi: null },
] as const;

export function KpiCards({ kpis, loading }: { kpis: ProgressKpis; loading?: boolean }) {
  const { t } = useTranslation();
  const setCrossFilter = useProgressDashboardStore((s) => s.setCrossFilter);
  const selectedKpi = useProgressDashboardStore((s) => s.crossFilter.selectedKpi);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="premium-card h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-3"
      role="region"
      aria-label={t("progress.kpi.region")}
    >
      {cards.map((card) => {
        const { key, labelKey, icon: Icon, kpi } = card;
        const value = kpis[key];
        const active = Boolean(kpi && selectedKpi === kpi);
        const displaySuffix =
          "suffixKey" in card && card.suffixKey
            ? t(card.suffixKey)
            : card.suffix;
        return (
          <button
            key={key}
            type="button"
            onClick={() =>
              kpi
                ? setCrossFilter({ selectedKpi: active ? null : kpi })
                : undefined
            }
            className={`premium-card p-4 text-left transition-all ${
              kpi ? "cursor-pointer hover:shadow-elev-3 active:scale-[0.98]" : ""
            } ${active ? "ring-2 ring-brand-violet/40" : ""}`}
            aria-pressed={kpi ? active : undefined}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-400">
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {t(labelKey)}
            </div>
            <div className="mt-2 text-accent-900">
              <AnimatedCounter
                value={typeof value === "number" ? value : 0}
                suffix={displaySuffix}
                decimals={key.includes("Average") ? 1 : 0}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
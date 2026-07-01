"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/hooks/useUserStore";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { DashboardSidebar } from "../components/sidebar/DashboardSidebar";
import { DashboardHeader } from "../components/header/DashboardHeader";
import { FilterChips } from "../components/filters/FilterChips";
import { KpiCards } from "../components/kpi/KpiCards";
import { DailyCharts, WeeklyCharts } from "../components/charts/ProgressCharts";
import { ProgressDataTable } from "../components/table/ProgressDataTable";
import { SavedViews } from "../components/filters/SavedViews";
import { useProgressData } from "../hooks/useProgressData";
import { useProgressDashboardStore } from "../hooks/useProgressDashboardStore";

export default function ProgressDashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const section = useProgressDashboardStore((s) => s.section);
  const isLoading = useProgressDashboardStore((s) => s.isLoading);
  const error = useProgressDashboardStore((s) => s.error);
  const { overview } = useProgressData();

  useEffect(() => {
    if (!profile?.consentGiven) router.replace("/onboarding");
  }, [profile, router]);

  if (!profile?.consentGiven) return null;

  if (error) {
    return (
      <div className="premium-card m-4 p-6 text-center text-sm text-red-600">
        {error || t("progress.error")}
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] w-full overflow-hidden rounded-t-2xl bg-white/60">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 space-y-4 overflow-y-auto p-3" id="progress-main">
          <FilterChips />

          {(section === "overview" || section === "daily" || section === "weekly") && (
            <KpiCards kpis={overview.kpis} loading={isLoading} />
          )}

          {section === "overview" && (
            <>
              <DailyCharts data={overview} />
              <ProgressDataTable rows={overview.table} />
            </>
          )}

          {section === "daily" && <DailyCharts data={overview} />}

          {section === "weekly" && <WeeklyCharts data={overview} />}

          {section === "reports" && (
            <>
              <WeeklyCharts data={overview} />
              <ProgressDataTable rows={overview.table} />
            </>
          )}

          {section === "settings" && <SavedViews />}
        </main>
      </div>
    </div>
  );
}
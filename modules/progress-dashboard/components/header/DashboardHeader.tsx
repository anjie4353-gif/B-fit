"use client";

import { Bell, Download, FileSpreadsheet, Menu, RefreshCw, User } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { GlobalFilters } from "../filters/GlobalFilters";
import { useProgressDashboardStore } from "../../hooks/useProgressDashboardStore";
import { useProgressData } from "../../hooks/useProgressData";
import { exportCsv, exportExcel, exportPdfHtml } from "../../utils/export";
import type { DashboardSection } from "../../types";

export function DashboardHeader() {
  const { t } = useTranslation();
  const section = useProgressDashboardStore((s) => s.section);
  const setMobileOpen = useProgressDashboardStore((s) => s.setSidebarMobileOpen);
  const setLoading = useProgressDashboardStore((s) => s.setLoading);
  const { overview } = useProgressData();

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  };

  const sectionKey = section as DashboardSection;

  return (
    <header className="sticky top-0 z-40 space-y-3 border-b border-accent-200/50 bg-white/85 px-3 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="flip-icon-ring h-9 w-9 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t("progress.header.openMenu")}
          >
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="truncate font-display text-lg font-bold text-gradient-premium">
            {t(`progress.sections.${sectionKey}`)}
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={refresh}
            className="flip-icon-ring h-9 w-9"
            aria-label={t("progress.header.refresh")}
          >
            <RefreshCw className="h-4 w-4 text-accent-600" />
          </button>
          <button
            type="button"
            onClick={() => exportCsv(overview)}
            className="flip-icon-ring h-9 w-9"
            aria-label={t("progress.header.exportCsv")}
          >
            <Download className="h-4 w-4 text-accent-600" />
          </button>
          <button
            type="button"
            onClick={() => void exportExcel(overview)}
            className="flip-icon-ring h-9 w-9"
            aria-label={t("progress.header.exportExcel")}
          >
            <FileSpreadsheet className="h-4 w-4 text-accent-600" />
          </button>
          <button
            type="button"
            onClick={() => {
              const w = window.open("", "_blank");
              if (w) {
                w.document.write(
                  exportPdfHtml(overview, {
                    title: t("progress.export.reportTitle"),
                    totalTasks: t("progress.export.totalTasks"),
                    completed: t("progress.export.completed"),
                    rate: t("progress.export.rate"),
                    date: t("progress.export.date"),
                    task: t("progress.export.task"),
                    done: t("progress.export.done"),
                  })
                );
                w.document.close();
              }
            }}
            className="hidden h-9 rounded-lg px-2 text-xs font-semibold text-brand-violet sm:inline"
          >
            {t("progress.header.exportPdf")}
          </button>
          <span className="flip-icon-ring h-9 w-9" aria-hidden>
            <Bell className="h-4 w-4 text-accent-400" />
          </span>
          <Link
            href="/profile"
            className="flip-icon-ring h-9 w-9"
            aria-label={t("progress.header.profile")}
          >
            <User className="h-4 w-4 text-brand-violet" />
          </Link>
        </div>
      </div>
      <GlobalFilters compact />
    </header>
  );
}
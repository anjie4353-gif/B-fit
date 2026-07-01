"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useTranslation } from "@/components/i18n/i18n-provider";
import type { ProgressTaskRow } from "../../types";
import { categoryLabel } from "../../utils/labels";
import { useProgressDashboardStore } from "../../hooks/useProgressDashboardStore";

export function ProgressDataTable({ rows }: { rows: ProgressTaskRow[] }) {
  const { t } = useTranslation();
  const search = useProgressDashboardStore((s) => s.tableSearch);
  const setSearch = useProgressDashboardStore((s) => s.setTableSearch);
  const page = useProgressDashboardStore((s) => s.tablePage);
  const pageSize = useProgressDashboardStore((s) => s.tablePageSize);
  const setPage = useProgressDashboardStore((s) => s.setTablePage);
  const sortKey = useProgressDashboardStore((s) => s.tableSortKey);
  const sortDir = useProgressDashboardStore((s) => s.tableSortDir);
  const setSort = useProgressDashboardStore((s) => s.setTableSort);
  const visibleColumns = useProgressDashboardStore((s) => s.visibleColumns);
  const toggleColumn = useProgressDashboardStore((s) => s.toggleColumn);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = rows.filter(
      (r) =>
        !q ||
        r.label.toLowerCase().includes(q) ||
        r.category.includes(q) ||
        r.date.includes(q)
    );
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp =
          typeof av === "string" && typeof bv === "string"
            ? av.localeCompare(bv)
            : Number(av) - Number(bv);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [rows, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const cols: { key: keyof ProgressTaskRow; label: string }[] = [
    { key: "date", label: t("progress.table.date") },
    { key: "label", label: t("progress.table.task") },
    { key: "category", label: t("progress.table.category") },
    { key: "project", label: t("progress.table.project") },
    { key: "completed", label: t("progress.table.done") },
    { key: "completionRate", label: t("progress.table.percent") },
  ];

  if (rows.length === 0) {
    return (
      <div className="premium-card p-8 text-center text-sm text-accent-500">
        {t("progress.table.empty")}
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-accent-200/60 p-3">
        <div className="relative min-w-[140px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-accent-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("progress.table.search")}
            className="glass-input h-9 w-full rounded-lg pl-8 text-xs"
            aria-label={t("progress.table.searchLabel")}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {cols.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => toggleColumn(c.key)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                visibleColumns.includes(c.key)
                  ? "bg-violet-100 text-accent-800"
                  : "bg-accent-100 text-accent-400"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs" role="table">
          <thead>
            <tr className="border-b border-accent-200/60 bg-accent-50/50">
              {cols
                .filter((c) => visibleColumns.includes(c.key))
                .map((c) => (
                  <th key={c.key} className="px-3 py-2 font-semibold text-accent-600">
                    <button type="button" onClick={() => setSort(c.key)}>
                      {c.label}
                      {sortKey === c.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </button>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-accent-100 hover:bg-accent-50/50"
              >
                {visibleColumns.includes("date") && (
                  <td className="px-3 py-2 text-accent-700">{row.date}</td>
                )}
                {visibleColumns.includes("label") && (
                  <td className="px-3 py-2 font-medium text-accent-900">{row.label}</td>
                )}
                {visibleColumns.includes("category") && (
                  <td className="px-3 py-2 text-accent-600">
                    {categoryLabel(row.category, t)}
                  </td>
                )}
                {visibleColumns.includes("project") && (
                  <td className="px-3 py-2 text-accent-600">{row.project}</td>
                )}
                {visibleColumns.includes("completed") && (
                  <td className="px-3 py-2">
                    <span
                      className={
                        row.completed ? "font-semibold text-brand-teal" : "text-accent-400"
                      }
                    >
                      {row.completed ? t("progress.table.yes") : t("progress.table.no")}
                    </span>
                  </td>
                )}
                {visibleColumns.includes("completionRate") && (
                  <td className="px-3 py-2 tabular-nums">{row.completionRate}%</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-accent-200/60 px-3 py-2">
        <span className="text-[10px] text-accent-500">
          {filtered.length} {t("progress.table.rows")} · {t("progress.table.page")}{" "}
          {page + 1}/{totalPages}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="flip-icon-ring h-8 w-8 disabled:opacity-40"
            aria-label={t("progress.table.prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="flip-icon-ring h-8 w-8 disabled:opacity-40"
            aria-label={t("progress.table.next")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
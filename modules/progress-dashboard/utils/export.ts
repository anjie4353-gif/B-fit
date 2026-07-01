import type { ProgressOverview, ProgressTaskRow } from "../types";

export function toCsv(rows: ProgressTaskRow[]): string {
  const headers = [
    "Date",
    "Category",
    "Task Type",
    "Project",
    "Label",
    "Planned",
    "Actual",
    "Completed",
    "Completion %",
  ];
  const lines = rows.map((r) =>
    [
      r.date,
      r.category,
      r.taskType,
      r.project,
      `"${r.label.replace(/"/g, '""')}"`,
      r.planned,
      r.actual,
      r.completed ? "Yes" : "No",
      r.completionRate,
    ].join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}

export function downloadBlob(content: string | ArrayBuffer, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(overview: ProgressOverview, prefix = "progress") {
  downloadBlob(
    toCsv(overview.table),
    `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`,
    "text/csv;charset=utf-8"
  );
}

export async function exportExcel(overview: ProgressOverview, prefix = "progress") {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const date = new Date().toISOString().slice(0, 10);

  const kpiSheet = XLSX.utils.aoa_to_sheet([
    ["Metric", "Value"],
    ["Total Tasks", overview.kpis.totalTasks],
    ["Completed Tasks", overview.kpis.completedTasks],
    ["Completion Rate (%)", overview.kpis.completionRate],
    ["Daily Average", overview.kpis.dailyAverage],
    ["Weekly Average", overview.kpis.weeklyAverage],
    ["Active Streak (days)", overview.kpis.activeStreak],
    ["Exported At", new Date().toISOString()],
  ]);
  XLSX.utils.book_append_sheet(wb, kpiSheet, "KPIs");

  const taskSheet = XLSX.utils.json_to_sheet(
    overview.table.map((r) => ({
      Date: r.date,
      Category: r.category,
      "Task Type": r.taskType,
      Project: r.project,
      Label: r.label,
      Planned: r.planned,
      Actual: r.actual,
      Completed: r.completed ? "Yes" : "No",
      "Completion %": r.completionRate,
    }))
  );
  XLSX.utils.book_append_sheet(wb, taskSheet, "Tasks");

  const donutSheet = XLSX.utils.json_to_sheet(overview.donut);
  XLSX.utils.book_append_sheet(wb, donutSheet, "Summary");

  XLSX.writeFile(wb, `${prefix}-${date}.xlsx`);
}

export function exportPdfHtml(
  overview: ProgressOverview,
  labels?: { title: string; totalTasks: string; completed: string; rate: string; date: string; task: string; done: string }
) {
  const { kpis, table } = overview;
  const L = labels ?? {
    title: "Progress Dashboard Report",
    totalTasks: "Total Tasks",
    completed: "Completed",
    rate: "Rate",
    date: "Date",
    task: "Task",
    done: "Done",
  };
  const rows = table
    .slice(0, 50)
    .map(
      (r) =>
        `<tr><td>${r.date}</td><td>${r.label}</td><td>${r.completed ? "✓" : "—"}</td><td>${r.completionRate}%</td></tr>`
    )
    .join("");
  return `<!DOCTYPE html><html><head><title>B-Fit Progress Report</title>
<style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #e5e7eb;padding:8px}th{background:#f5f3ff}</style></head>
<body><h1>${L.title}</h1>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0">
<div><strong>${L.totalTasks}</strong><br>${kpis.totalTasks}</div>
<div><strong>${L.completed}</strong><br>${kpis.completedTasks}</div>
<div><strong>${L.rate}</strong><br>${kpis.completionRate}%</div>
</div>
<table><thead><tr><th>${L.date}</th><th>${L.task}</th><th>${L.done}</th><th>%</th></tr></thead><tbody>${rows}</tbody></table>
<script>window.print()</script></body></html>`;
}
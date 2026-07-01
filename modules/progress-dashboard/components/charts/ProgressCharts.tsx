"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { useTranslation } from "@/components/i18n/i18n-provider";
import type { ProgressOverview } from "../../types";
import { useProgressDashboardStore } from "../../hooks/useProgressDashboardStore";

type ChartClickState = {
  activePayload?: Array<{ payload?: { date?: string } }>;
};

function ChartCard({
  title,
  children,
  height = 220,
}: {
  title: string;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <div className="premium-card p-4" role="img" aria-label={title}>
      <h3 className="mb-3 font-display text-sm font-bold text-accent-900">{title}</h3>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

export function DailyCharts({ data }: { data: ProgressOverview }) {
  const { t } = useTranslation();
  const setCross = useProgressDashboardStore((s) => s.setCrossFilter);
  const donutData = data.donut.map((d) => ({
    ...d,
    name:
      d.name === "Completed"
        ? t("progress.charts.completed")
        : t("progress.charts.pending"),
  }));

  return (
    <div className="grid gap-4">
      <ChartCard title={t("progress.charts.dailyTrend")}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.dailyTrend}
            onClick={(e) => {
              const p = (e as ChartClickState)?.activePayload?.[0]?.payload;
              if (p?.date) setCross({ selectedDate: p.date });
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ r: 3 }}
              name={t("progress.charts.completionPct")}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={t("progress.charts.tasksPerDay")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.dailyBars}
            onClick={(e) => {
              const p = (e as ChartClickState)?.activePayload?.[0]?.payload;
              if (p?.date) setCross({ selectedDate: p.date });
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar
              dataKey="completed"
              fill="#14b8a6"
              radius={[6, 6, 0, 0]}
              name={t("progress.charts.completed")}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={t("progress.charts.completionRatio")} height={200}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
            >
              {donutData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

export function WeeklyCharts({ data }: { data: ProgressOverview }) {
  const { t } = useTranslation();
  const setCross = useProgressDashboardStore((s) => s.setCrossFilter);

  return (
    <div className="grid gap-4">
      <ChartCard title={t("progress.charts.plannedVsActual")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.weeklyCompare}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="planned"
              fill="#c4b5fd"
              name={t("progress.charts.planned")}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actual"
              fill="#7c3aed"
              name={t("progress.charts.actual")}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={t("progress.charts.weeklyGrowth")}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.weeklyArea}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="completionRate"
              stroke="#0ea5e9"
              fill="#bae6fd"
              name={t("progress.charts.completionPct")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={t("progress.charts.activityHeatmap")}>
        <div
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label={t("progress.charts.activityHeatmap")}
        >
          {data.heatmap.map((cell) => (
            <button
              key={cell.date}
              type="button"
              role="gridcell"
              title={`${cell.date}: ${cell.count}`}
              onClick={() => setCross({ selectedDate: cell.date })}
              className="aspect-square rounded-md transition-transform hover:scale-110 focus:ring-2 focus:ring-brand-violet"
              style={{
                backgroundColor: [
                  "#f5f3ff",
                  "#ede9fe",
                  "#c4b5fd",
                  "#8b5cf6",
                  "#6d28d9",
                ][cell.level],
              }}
              aria-label={`${cell.date} ${cell.count}`}
            />
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
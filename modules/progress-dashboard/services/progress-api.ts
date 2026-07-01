import type { ProgressDataInput, ProgressFilters, CrossFilterState } from "../types";
import { aggregateProgress } from "../utils/aggregate";

export async function fetchProgressOverview(
  filters: ProgressFilters,
  options?: {
    phone?: string;
    input?: ProgressDataInput;
    cross?: CrossFilterState;
  }
) {
  if (options?.phone) {
    const res = await fetch("/api/progress/overview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: options.phone,
        filters,
        cross: options.cross,
        input: options.input,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.overview;
    }
  }

  if (options?.input) {
    return aggregateProgress(options.input, filters, options.cross);
  }

  throw new Error("Progress data unavailable");
}

export async function postProgressExport(
  format: "csv" | "json",
  payload: {
    phone?: string;
    input?: ProgressDataInput;
    filters: ProgressFilters;
    cross?: CrossFilterState;
  }
) {
  const res = await fetch("/api/progress/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format, ...payload }),
  });
  if (!res.ok) throw new Error("Export failed");
  if (format === "csv") return res.text();
  return res.json();
}
import { NextRequest, NextResponse } from "next/server";
import { aggregateProgress } from "@/modules/progress-dashboard/utils/aggregate";
import { toCsv } from "@/modules/progress-dashboard/utils/export";
import type { CrossFilterState, ProgressFilters } from "@/modules/progress-dashboard/types";
import {
  resolveProgressInput,
  validateProgressRequest,
} from "@/lib/db/server/progress-route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const format = (body.format ?? "csv") as "csv" | "json";
    const filters = body.filters as ProgressFilters;
    const cross = (body.cross ?? {}) as CrossFilterState;
    const input = resolveProgressInput(body);

    const err = validateProgressRequest(input, filters);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }

    const overview = aggregateProgress(input!, filters, cross);

    if (format === "json") {
      return NextResponse.json({ ok: true, overview, source: body.phone ? "server" : "client" });
    }

    const csv = toCsv(overview.table);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="progress-${filters.dateRange.from}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
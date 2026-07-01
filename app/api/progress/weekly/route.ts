import { NextRequest, NextResponse } from "next/server";
import { aggregateProgress } from "@/modules/progress-dashboard/utils/aggregate";
import type { ProgressFilters, CrossFilterState } from "@/modules/progress-dashboard/types";
import {
  resolveProgressInput,
  validateProgressRequest,
} from "@/lib/db/server/progress-route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters = body.filters as ProgressFilters;
    const cross = (body.cross ?? {}) as CrossFilterState;
    const input = resolveProgressInput(body);

    const err = validateProgressRequest(input, filters);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }

    const overview = aggregateProgress(input!, filters, cross);
    return NextResponse.json({
      ok: true,
      weeklyCompare: overview.weeklyCompare,
      weeklyArea: overview.weeklyArea,
      heatmap: overview.heatmap,
      source: body.phone ? "server" : "client",
    });
  } catch {
    return NextResponse.json({ error: "Failed to load weekly data" }, { status: 500 });
  }
}
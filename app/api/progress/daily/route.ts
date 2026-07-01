import { NextRequest, NextResponse } from "next/server";
import { aggregateProgress } from "@/modules/progress-dashboard/utils/aggregate";
import type { ProgressFilters } from "@/modules/progress-dashboard/types";
import {
  resolveProgressInput,
  validateProgressRequest,
} from "@/lib/db/server/progress-route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters = body.filters as ProgressFilters;
    const input = resolveProgressInput(body);

    const err = validateProgressRequest(input, filters);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }

    const { dailyTrend, dailyBars, donut } = aggregateProgress(input!, filters);
    return NextResponse.json({
      ok: true,
      dailyTrend,
      dailyBars,
      donut,
      source: body.phone ? "server" : "client",
    });
  } catch {
    return NextResponse.json({ error: "Failed to compute daily progress" }, { status: 500 });
  }
}
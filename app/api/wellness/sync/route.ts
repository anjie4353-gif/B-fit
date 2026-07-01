import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { resolveDbDriver } from "@/lib/store";
import { upsertWellnessData } from "@/lib/db/server/wellness";
import type { DailyLog, ReminderInstanceState, WellnessPlan } from "@/types";

export async function POST(request: NextRequest) {
  try {
    if (resolveDbDriver() !== "sqlite") {
      return NextResponse.json(
        { error: "Wellness sync requires SQLite driver" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const phone = body.phone as string;

    if (!phone || normalizePhone(phone).length < 8) {
      return NextResponse.json({ error: "Valid phone required" }, { status: 400 });
    }

    upsertWellnessData({
      phone,
      dailyLogs: (body.dailyLogs ?? []) as DailyLog[],
      reminderStates: (body.reminderStates ?? {}) as Record<
        string,
        ReminderInstanceState
      >,
      wellnessPlan: (body.wellnessPlan ?? null) as WellnessPlan | null,
      waterGoal: Number(body.waterGoal) || 8,
      stepsGoal: Number(body.stepsGoal) || 8000,
      sleepGoal: Number(body.sleepGoal) || 7,
      userName: body.userName as string | undefined,
    });

    return NextResponse.json({ ok: true, phone: normalizePhone(phone) });
  } catch (error) {
    console.error("Wellness sync error:", error);
    return NextResponse.json({ error: "Wellness sync failed" }, { status: 500 });
  }
}
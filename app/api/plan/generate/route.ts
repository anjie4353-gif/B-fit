import { NextRequest, NextResponse } from "next/server";
import {
  buildDailyReminders,
  planExpiresAt,
} from "@/lib/plan/build-schedule";
import {
  generateMenDailyPlan,
  generateWomenDailyPlan,
} from "@/services/groq";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeSleepSchedule } from "@/lib/coach/health-advisor";
import type { UserProfile, WellnessPlan } from "@/types";

function applyHealthySleep(profile: UserProfile): UserProfile {
  const settings = profile.waterReminderSettings;
  const wake =
    profile.maleProfile?.wakeTime ?? settings?.wakeTime ?? "06:00";
  const sleep =
    profile.maleProfile?.sleepTime ?? settings?.sleepTime ?? "22:30";
  const normalized = normalizeSleepSchedule(wake, sleep, profile.gender);

  const next: UserProfile = {
    ...profile,
    waterReminderSettings: settings
      ? { ...settings, ...normalized }
      : settings,
  };

  if (next.maleProfile) {
    next.maleProfile = { ...next.maleProfile, ...normalized };
  }

  return next;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";

  if (!checkRateLimit(`plan-${ip}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const raw = body.profile as UserProfile;

    if (!raw?.gender || !raw.consentGiven) {
      return NextResponse.json({ error: "Valid profile required" }, { status: 400 });
    }

    const profile = applyHealthySleep(raw);

    const summary =
      profile.gender === "male"
        ? await generateMenDailyPlan(profile)
        : await generateWomenDailyPlan(profile);

    const createdAt = new Date().toISOString();
    const plan: WellnessPlan = {
      id: crypto.randomUUID(),
      createdAt,
      expiresAt: planExpiresAt(new Date(createdAt)),
      summary,
      reminders: buildDailyReminders(profile),
      gender: profile.gender,
    };

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Plan generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
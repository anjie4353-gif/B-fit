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
import type { UserProfile, WellnessPlan } from "@/types";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";

  if (!checkRateLimit(`plan-${ip}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const profile = body.profile as UserProfile;

    if (!profile?.gender || !profile.consentGiven) {
      return NextResponse.json({ error: "Valid profile required" }, { status: 400 });
    }

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
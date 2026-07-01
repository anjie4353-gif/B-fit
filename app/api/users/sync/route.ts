import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { getUserStore } from "@/lib/store";
import type { UserProfile } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = body.profile as UserProfile;

    if (!profile?.whatsappNumber || !profile.consentGiven || !profile.gender) {
      return NextResponse.json(
        { error: "Valid profile with whatsappNumber and consent required" },
        { status: 400 }
      );
    }

    const digits = normalizePhone(profile.whatsappNumber);
    if (digits.length < 8 || digits.length > 15) {
      return NextResponse.json(
        { error: "Invalid WhatsApp number format" },
        { status: 400 }
      );
    }

    profile.whatsappNumber = profile.whatsappNumber.replace(/\s/g, "");
    profile.onboardedAt = profile.onboardedAt ?? new Date().toISOString();

    const store = getUserStore();
    await store.saveUser(profile);

    return NextResponse.json({
      ok: true,
      phone: normalizePhone(profile.whatsappNumber),
    });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json({ error: "Failed to sync profile" }, { status: 500 });
  }
}
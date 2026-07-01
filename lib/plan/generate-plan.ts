import type { UserProfile, WellnessPlan } from "@/types";

export async function generateWellnessPlan(
  profile: UserProfile
): Promise<{ plan?: WellnessPlan; error?: string }> {
  try {
    const res = await fetch("/api/plan/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error ?? "Plan generation failed" };
    }
    return { plan: data.plan as WellnessPlan };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Plan generation failed",
    };
  }
}
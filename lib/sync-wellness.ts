import type {
  DailyLog,
  ReminderInstanceState,
  UserProfile,
  WellnessPlan,
} from "@/types";

interface PersistedSession {
  state?: {
    profile?: Partial<UserProfile>;
    dailyLogs?: DailyLog[];
    reminderStates?: Record<string, ReminderInstanceState>;
    wellnessPlan?: WellnessPlan | null;
  };
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleWellnessServerSync(sessionJson: string) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void pushWellnessToServer(sessionJson);
  }, 2000);
}

export async function pushWellnessToServer(sessionJson: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  let parsed: PersistedSession;
  try {
    parsed = JSON.parse(sessionJson) as PersistedSession;
  } catch {
    return { ok: false, error: "Invalid session payload" };
  }

  const state = parsed.state;
  const profile = state?.profile;
  const phone = profile?.whatsappNumber;

  if (!phone) {
    return { ok: false, error: "No phone on profile" };
  }

  try {
    const res = await fetch("/api/wellness/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        dailyLogs: state?.dailyLogs ?? [],
        reminderStates: state?.reminderStates ?? {},
        wellnessPlan: state?.wellnessPlan ?? null,
        waterGoal: profile?.waterReminderSettings?.dailyGlasses ?? 8,
        stepsGoal: profile?.gender === "male" ? 10000 : 8000,
        sleepGoal: 7,
        userName: profile?.nickname ?? profile?.fullName,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Wellness sync failed" };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Wellness sync failed",
    };
  }
}
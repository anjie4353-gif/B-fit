import type { UserProfile } from "@/types";

export async function syncUserToServer(profile: UserProfile): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const res = await fetch("/api/users/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Sync failed" };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Sync failed",
    };
  }
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/hooks/useUserStore";
import { useProgressDashboardStore } from "./useProgressDashboardStore";
import { aggregateProgress } from "../utils/aggregate";
import type { ProgressDataInput, ProgressOverview } from "../types";

export function useProgressData() {
  const dailyLogs = useUserStore((s) => s.dailyLogs);
  const reminderStates = useUserStore((s) => s.reminderStates);
  const profile = useUserStore((s) => s.profile);
  const wellnessPlan = useUserStore((s) => s.wellnessPlan);

  const filters = useProgressDashboardStore((s) => s.filters);
  const crossFilter = useProgressDashboardStore((s) => s.crossFilter);
  const setLoading = useProgressDashboardStore((s) => s.setLoading);
  const setError = useProgressDashboardStore((s) => s.setError);

  const [serverOverview, setServerOverview] = useState<ProgressOverview | null>(
    null
  );

  const input: ProgressDataInput = useMemo(
    () => ({
      dailyLogs,
      reminderStates,
      waterGoal: profile?.waterReminderSettings?.dailyGlasses ?? 8,
      stepsGoal: profile?.gender === "male" ? 10000 : 8000,
      sleepGoal: 7,
      userName: profile?.nickname ?? profile?.fullName,
      planReminders: wellnessPlan?.reminders.map((r) => ({
        id: r.id,
        label: r.label,
        type: r.type,
      })),
    }),
    [dailyLogs, reminderStates, profile, wellnessPlan]
  );

  const localOverview = useMemo(
    () => aggregateProgress(input, filters, crossFilter),
    [input, filters, crossFilter]
  );

  const phone = profile?.whatsappNumber;

  useEffect(() => {
    if (!phone) {
      setServerOverview(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/progress/overview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        filters,
        cross: crossFilter,
        input,
      }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return data.overview as ProgressOverview;
      })
      .then((remote) => {
        if (!cancelled && remote) setServerOverview(remote);
      })
      .catch(() => {
        if (!cancelled) setError(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [phone, filters, crossFilter, input, setLoading, setError]);

  const overview = serverOverview ?? localOverview;

  return { overview, input, source: serverOverview ? "server" as const : "local" as const };
}
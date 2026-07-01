"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DailyLogForm } from "@/components/wellness/daily-log-form";
import { useUserStore } from "@/hooks/useUserStore";

export default function WellnessPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    if (!profile?.consentGiven) router.replace("/onboarding");
  }, [profile, router]);

  return (
    <div className="px-4 py-6 space-y-4">
      <header>
        <h1 className="font-display text-2xl font-bold text-accent-900">
          Daily Wellness
        </h1>
        <p className="text-sm text-accent-500">
          Track water, steps, sleep & mood
        </p>
      </header>
      <DailyLogForm />
    </div>
  );
}
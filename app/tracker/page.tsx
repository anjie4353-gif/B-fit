"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PeriodTracker } from "@/components/tracker/period-tracker";
import { useUserStore } from "@/hooks/useUserStore";

export default function TrackerPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    if (!profile?.consentGiven) router.replace("/onboarding");
  }, [profile, router]);

  return <PeriodTracker />;
}
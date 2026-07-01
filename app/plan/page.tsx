"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlanToday } from "@/components/plan/plan-today";
import { useUserStore } from "@/hooks/useUserStore";

export default function PlanPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    if (!profile?.consentGiven) router.replace("/onboarding");
  }, [profile, router]);

  return <PlanToday />;
}
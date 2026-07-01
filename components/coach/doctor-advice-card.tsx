"use client";

import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/i18n/i18n-provider";

interface DoctorAdviceCardProps {
  message: string;
  recommendedSleep?: string;
  recommendedWake?: string;
  onApply?: () => void;
}

export function DoctorAdviceCard({
  message,
  recommendedSleep,
  recommendedWake,
  onApply,
}: DoctorAdviceCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-amber-300/60 bg-amber-50/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-amber-700" />
        <span className="text-sm font-semibold text-amber-900">
          {t("coach.doctorAdviceTitle")}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-amber-900/90">{message}</p>
      {(recommendedSleep || recommendedWake) && (
        <p className="text-xs font-medium text-amber-800">
          {t("coach.doctorRecommendation")}:{" "}
          {recommendedWake && `${t("onboarding.wakeTime")} ${recommendedWake}`}
          {recommendedWake && recommendedSleep && " · "}
          {recommendedSleep &&
            `${t("onboarding.sleepTime")} ${recommendedSleep}`}
        </p>
      )}
      {onApply && (
        <Button size="sm" className="w-full" onClick={onApply}>
          {t("coach.applyDoctorRecommendation")}
        </Button>
      )}
    </div>
  );
}
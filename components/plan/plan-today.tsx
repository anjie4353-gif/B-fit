"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, Ban, Check, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { useUserStore } from "@/hooks/useUserStore";
import { isPlanExpired } from "@/lib/plan/build-schedule";
import { generateWellnessPlan } from "@/lib/plan/generate-plan";
import { reminderKey, todayKey } from "@/lib/plan/reminder-logic";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import type { UserProfile } from "@/types";
import { cn } from "@/lib/utils";

export function PlanToday() {
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const wellnessPlan = useUserStore((s) => s.wellnessPlan);
  const reminderStates = useUserStore((s) => s.reminderStates);
  const setWellnessPlan = useUserStore((s) => s.setWellnessPlan);
  const markReminderDone = useUserStore((s) => s.markReminderDone);
  const snoozeReminder = useUserStore((s) => s.snoozeReminder);
  const stopReminder = useUserStore((s) => s.stopReminder);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  const regeneratePlan = async () => {
    if (!profile?.consentGiven) return;
    setRegenerating(true);
    setRegenError(null);
    const { plan, error } = await generateWellnessPlan(profile as UserProfile);
    if (plan) setWellnessPlan(plan);
    else setRegenError(error ?? t("plan.regenerateFailed"));
    setRegenerating(false);
  };

  if (!profile?.consentGiven) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center px-6 text-center text-accent-500">
        <Link href="/onboarding" className="underline">
          Complete onboarding
        </Link>{" "}
        to get your plan.
      </div>
    );
  }

  if (!wellnessPlan) {
    return (
      <div className="space-y-4 px-4 py-8 text-center text-accent-500">
        <p>{t("plan.preparing")}</p>
        {regenError ? (
          <p className="text-xs text-red-600">{regenError}</p>
        ) : null}
        <Button
          className="mt-4"
          variant="secondary"
          disabled={regenerating}
          onClick={() => void regeneratePlan()}
        >
          <RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} />
          {regenerating ? t("plan.regenerating") : t("plan.regeneratePlan")}
        </Button>
      </div>
    );
  }

  const expired = isPlanExpired(wellnessPlan.expiresAt);
  const date = todayKey();

  return (
    <div className="space-y-4 px-4 py-6">
      <InstallPrompt />

      {expired && (
        <Card className="border-accent-300 bg-accent-50/90 shadow-elev-1">
          <CardContent className="p-4 text-sm text-accent-800">
            <p className="font-medium">{t("plan.expiredTitle")}</p>
            <p className="mt-1 text-xs">{t("plan.expiredBody")}</p>
            <Button
              size="sm"
              className="mt-3 w-full"
              disabled={regenerating}
              onClick={() => void regeneratePlan()}
            >
              <RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} />
              {regenerating ? t("plan.regenerating") : t("plan.regeneratePlan")}
            </Button>
          </CardContent>
        </Card>
      )}

      <header>
        <h1 className="text-display font-display">{t("plan.todayTitle")}</h1>
        <p className="text-caption">
          {t("plan.validUntil")}{" "}
          {format(new Date(wellnessPlan.expiresAt), "MMM d, yyyy")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("plan.coachSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-accent-700 leading-relaxed">
            {wellnessPlan.summary}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            {t("plan.remindersTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {wellnessPlan.reminders.map((slot) => {
            const key = reminderKey(date, slot.id);
            const state = reminderStates[key];
            const done = state?.status === "done";
            const stopped = state?.status === "stopped";
            const snoozed =
              state?.snoozedUntil &&
              new Date(state.snoozedUntil).getTime() > Date.now();

            return (
              <div
                key={slot.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-3",
                  done
                    ? "border-success-500/30 bg-success-50/50"
                    : stopped
                      ? "border-accent-200 bg-accent-50/40 opacity-70"
                      : snoozed
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-accent-200 bg-white/60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-accent-900">
                    {slot.label}
                  </p>
                  <p className="text-xs text-accent-500">{slot.time}</p>
                  {snoozed ? (
                    <p className="text-[10px] text-amber-700">
                      {t("plan.reminderSnoozed")}
                    </p>
                  ) : null}
                </div>
                {done ? (
                  <Check className="h-5 w-5 shrink-0 text-success-600" />
                ) : stopped ? (
                  <span className="text-[10px] text-accent-500">
                    {t("plan.reminderStopped")}
                  </span>
                ) : (
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => markReminderDone(key)}
                    >
                      <Check className="h-3 w-3" />
                      {t("plan.reminderDone")}
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[10px]"
                        onClick={() => snoozeReminder(key, 10)}
                      >
                        <Clock className="h-3 w-3" />
                        {t("plan.reminderSnooze")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[10px]"
                        onClick={() => stopReminder(key)}
                      >
                        <Ban className="h-3 w-3" />
                        {t("plan.reminderStop")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { format } from "date-fns";
import { Bell, Check, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/hooks/useUserStore";
import { isPlanExpired } from "@/lib/plan/build-schedule";
import { reminderKey, todayKey } from "@/lib/plan/reminder-logic";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { cn } from "@/lib/utils";

export function PlanToday() {
  const profile = useUserStore((s) => s.profile);
  const wellnessPlan = useUserStore((s) => s.wellnessPlan);
  const reminderStates = useUserStore((s) => s.reminderStates);
  const markReminderDone = useUserStore((s) => s.markReminderDone);

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
      <div className="px-4 py-8 text-center text-accent-500">
        <p>Your plan is being prepared…</p>
        <Button asChild className="mt-4" variant="secondary">
          <Link href="/onboarding">Set up again</Link>
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
            <p className="font-medium">3-month plan ended</p>
            <p className="mt-1 text-xs">
              Update your inputs so the coach can build a fresh plan.
            </p>
            <Button asChild size="sm" className="mt-3 w-full">
              <Link href="/onboarding?renew=1">
                <RefreshCw className="h-4 w-4" />
                Renew plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <header>
        <h1 className="text-display font-display">
          Today&apos;s Plan
        </h1>
        <p className="text-caption">
          Valid until {format(new Date(wellnessPlan.expiresAt), "MMM d, yyyy")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coach summary</CardTitle>
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
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {wellnessPlan.reminders.map((slot) => {
            const key = reminderKey(date, slot.id);
            const state = reminderStates[key];
            const done = state?.status === "done";
            const stopped = state?.status === "stopped";

            return (
              <div
                key={slot.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3",
                  done
                    ? "border-success-500/30 bg-success-50/50"
                    : stopped
                      ? "border-accent-200 bg-accent-50/40 opacity-70"
                      : "border-accent-200 bg-white/60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-accent-900">
                    {slot.label}
                  </p>
                  <p className="text-xs text-accent-500">{slot.time}</p>
                </div>
                {done ? (
                  <Check className="h-5 w-5 text-success-600 shrink-0" />
                ) : stopped ? (
                  <span className="text-[10px] text-accent-500">Paused</span>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => markReminderDone(key)}
                  >
                    <Bell className="h-3 w-3" />
                    Done
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
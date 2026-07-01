"use client";

import { format, addDays } from "date-fns";
import {
  CalendarHeart,
  Droplets,
  Salad,
  PersonStanding,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/hooks/useUserStore";
import {
  calculatePeriodPrediction,
  getPeriodReminderType,
  PERIOD_TIPS,
} from "@/lib/period";
import { getMessageContent } from "@/whatsapp/messages";

const phaseColors: Record<string, string> = {
  menstrual: "bg-accent-200 text-accent-800",
  follicular: "bg-accent-100 text-accent-700",
  ovulation: "bg-accent-300 text-accent-800",
  luteal: "bg-accent-100 text-accent-600",
  pms: "bg-accent-200 text-accent-700",
  unknown: "bg-accent-100 text-accent-500",
};

export function PeriodTracker() {
  const profile = useUserStore((s) => s.profile);

  if (profile?.gender === "male") {
    return (
      <Card className="mx-4 mt-4">
        <CardContent className="py-8 text-center text-accent-500">
          Period tracking is available for menstrual health profiles. Explore
          wellness logging and AI coaching on the other tabs.
        </CardContent>
      </Card>
    );
  }

  if (!profile?.lastPeriodDate) {
    return (
      <Card className="mx-4 mt-4">
        <CardContent className="py-8 text-center text-accent-500">
          Complete onboarding to track your cycle.
        </CardContent>
      </Card>
    );
  }

  const prediction = calculatePeriodPrediction(
    profile.lastPeriodDate,
    profile.cycleLength ?? "irregular"
  );

  const reminderType = getPeriodReminderType(prediction.daysUntilPeriod);
  const reminderMessage = reminderType
    ? getMessageContent(reminderType, profile)
    : null;

  return (
    <div className="space-y-4 px-4 py-4">
      <Card className="overflow-hidden">
        <div className="relative overflow-hidden border-b border-accent-200 bg-gradient-to-br from-accent-500 to-accent-600 p-6 text-white shadow-elev-2">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="flex items-center gap-2">
            <CalendarHeart className="h-6 w-6" />
            <h2 className="font-display text-xl font-semibold">Cycle Tracker</h2>
          </div>
          <Badge
            className={`mt-3 ${phaseColors[prediction.phase]} border-0`}
          >
            {prediction.phase.charAt(0).toUpperCase() + prediction.phase.slice(1)} phase
          </Badge>
        </div>

        <CardContent className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="text-xs text-accent-400">Last Period</p>
            <p className="font-semibold text-accent-900">
              {format(new Date(profile.lastPeriodDate), "MMM d, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-xs text-accent-400">Cycle Length</p>
            <p className="font-semibold text-accent-900">
              {profile.cycleLength === "irregular"
                ? "Irregular"
                : `${profile.cycleLength} days`}
            </p>
          </div>
          {prediction.nextPeriodDate && (
            <>
              <div>
                <p className="text-xs text-accent-400">Next Period</p>
                <p className="font-semibold text-accent-900">
                  {format(prediction.nextPeriodDate, "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs text-accent-400">Days Until</p>
                <p className="font-semibold text-accent-900">
                  {prediction.daysUntilPeriod !== null
                    ? prediction.daysUntilPeriod <= 0
                      ? "Today / overdue"
                      : `${prediction.daysUntilPeriod} days`
                    : "—"}
                </p>
              </div>
            </>
          )}
          {prediction.ovulationDate && (
            <div>
              <p className="text-xs text-accent-400">Estimated Ovulation</p>
              <p className="font-semibold text-accent-900">
                {format(prediction.ovulationDate, "MMM d, yyyy")}
              </p>
            </div>
          )}
          {prediction.pmsWindowStart && prediction.pmsWindowEnd && (
            <div>
              <p className="text-xs text-accent-400">PMS Window</p>
              <p className="font-semibold text-accent-900">
                {format(prediction.pmsWindowStart, "MMM d")} –{" "}
                {format(prediction.pmsWindowEnd, "MMM d")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {reminderMessage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-accent-700 leading-relaxed">
              {reminderMessage}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wellness Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="glass flex gap-3 rounded-2xl p-3">
            <Droplets className="h-5 w-5 shrink-0 text-accent-500" />
            <p className="text-sm text-accent-700">{PERIOD_TIPS.hydration}</p>
          </div>
          <div className="glass flex gap-3 rounded-2xl p-3">
            <Salad className="h-5 w-5 shrink-0 text-accent-600" />
            <p className="text-sm text-accent-700">{PERIOD_TIPS.iron}</p>
          </div>
          <div className="glass flex gap-3 rounded-2xl p-3">
            <PersonStanding className="h-5 w-5 shrink-0 text-accent-500" />
            <p className="text-sm text-accent-700">{PERIOD_TIPS.exercise}</p>
          </div>
          {prediction.phase === "pms" && (
            <div className="glass flex gap-3 rounded-2xl p-3">
              <CalendarHeart className="h-5 w-5 shrink-0 text-accent-500" />
              <p className="text-sm text-accent-700">{PERIOD_TIPS.pms}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {profile.cycleLength !== "irregular" && prediction.nextPeriodDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cycle Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {Array.from({ length: Math.min(profile.cycleLength as number, 35) }).map(
                (_, i) => {
                  const day = addDays(new Date(profile.lastPeriodDate!), i);
                  const isPeriod = i < 5;
                  const isToday =
                    format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                  return (
                    <div
                      key={i}
                      className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-xs ${
                        isToday
                          ? "ring-2 ring-accent-500 bg-accent-50 shadow-elev-1"
                          : isPeriod
                            ? "bg-accent-200 text-accent-800"
                            : "bg-accent-50 text-accent-400"
                      }`}
                    >
                      <span className="font-medium">{format(day, "d")}</span>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
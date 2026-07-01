"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CalendarHeart,
  Droplets,
  Footprints,
  MessageCircle,
  Moon,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  User,
} from "lucide-react";
import { FlipCard } from "@/components/ui/flip-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/useUserStore";
import { BrandMark } from "@/components/brand/brand-mark";
import { APP_NAME } from "@/lib/brand";
import { calculatePeriodPrediction } from "@/lib/period";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { displayName } from "@/lib/profile/account-age";
import { WaterReminderPanel } from "@/components/hydration/water-reminder-panel";

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, dailyLogs } = useUserStore();
  const waterGoal = profile?.waterReminderSettings?.dailyGlasses ?? 8;
  const userName = displayName(profile?.fullName, profile?.nickname);

  useEffect(() => {
    if (!profile?.consentGiven) router.replace("/onboarding");
  }, [profile, router]);

  if (!profile) return null;

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLog = dailyLogs.find((l) => l.date === today);
  const showPeriodTracking =
    profile.gender === "female" && profile.lastPeriodDate;
  const prediction = showPeriodTracking
    ? calculatePeriodPrediction(
        profile.lastPeriodDate!,
        profile.cycleLength ?? "irregular"
      )
    : null;

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "home.goodMorning" : hour < 17 ? "home.goodAfternoon" : "home.goodEvening";
  const greeting = `${t(greetingKey)}${userName !== "there" ? `, ${userName}` : ""}`;

  const statCards = [
    {
      key: "water",
      icon: Droplets,
      gradient: "flip-gradient-sky",
      iconColor: "text-brand-sky",
      getValue: (log: { waterIntake?: number } | undefined) => log?.waterIntake ?? 0,
      label: t("home.glassesToday"),
      getBack: (v: number) =>
        v >= waterGoal
          ? "Hydration goal met! Keep it up."
          : `Drink ${waterGoal - v} more glasses to hit your goal.`,
    },
    {
      key: "steps",
      icon: Footprints,
      gradient: "flip-gradient-teal",
      iconColor: "text-brand-teal",
      getValue: (log: { steps?: number } | undefined) => (log?.steps ?? 0).toLocaleString(),
      label: t("home.stepsToday"),
      getBack: (v: string) => {
        const n = parseInt(v.replace(/,/g, ""), 10);
        const target = profile.gender === "male" ? 10000 : 8000;
        return n >= target
          ? "Amazing movement today!"
          : `${(target - n).toLocaleString()} steps to reach your goal.`;
      },
    },
    {
      key: "sleep",
      icon: Moon,
      gradient: "flip-gradient-indigo",
      iconColor: "text-brand-violet",
      getValue: (log: { sleepHours?: number } | undefined) => log?.sleepHours ?? "—",
      label: t("home.hoursSleep"),
      getBack: (v: string | number) =>
        typeof v === "number" && v >= 7
          ? "Great rest! Your body thanks you."
          : "Aim for 7+ hours tonight.",
    },
    {
      key: "mood",
      icon: Sparkles,
      gradient: "flip-gradient-amber",
      iconColor: "text-brand-amber",
      getValue: (log: { mood?: number } | undefined) =>
        log?.mood != null ? `${log.mood}/5` : "—",
      label: t("home.moodScore"),
      getBack: (v: string) =>
        v === "—"
          ? "Log your mood in Wellness today."
          : v.startsWith("4") || v.startsWith("5")
            ? "You're feeling great!"
            : "Be kind to yourself today.",
    },
  ] as const;

  const goals = [
    {
      label: profile.gender === "male" ? "10,000 steps" : "8,000 steps",
      done:
        (todayLog?.steps ?? 0) >=
        (profile.gender === "male" ? 10000 : 8000),
    },
    {
      label: `${waterGoal} ${t("profile.glasses")} water`,
      done: (todayLog?.waterIntake ?? 0) >= waterGoal,
    },
    {
      label: profile.gender === "male" ? "7-9 hours sleep" : "7+ hours sleep",
      done: (todayLog?.sleepHours ?? 0) >= 7,
    },
  ];

  return (
    <div className="px-4 py-6 space-y-5 premium-section">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
        <p className="text-label text-accent-400">{greeting}</p>
        <div className="mt-1 flex items-center gap-2.5">
          <BrandMark size={36} />
          <h1 className="text-display font-display text-accent-900">
            {APP_NAME} {t("home.hub")}
          </h1>
        </div>
        {profile.gender === "female" && profile.femaleProfile && (
          <p className="mt-1 text-xs text-accent-500">
            {profile.femaleProfile.city}, {profile.femaleProfile.state}
            {profile.femaleProfile.pcosStatus ? " · PCOS support active" : ""}
          </p>
        )}
        {profile.gender === "male" && profile.maleProfile && (
          <p className="mt-1 text-xs text-accent-500">
            {profile.maleProfile.city}, {profile.maleProfile.state} · Goal:{" "}
            {profile.maleProfile.fitnessGoal.replace(/_/g, " ")}
          </p>
        )}
        {profile.pcod?.hasPcod && (
          <Badge variant="secondary" className="premium-badge mt-3 border-0">
            PCOD Support Active
          </Badge>
        )}
        </div>
        <Link
          href="/profile"
          className="flip-icon-ring h-11 w-11 shrink-0"
          aria-label={t("profile.title")}
        >
          {profile.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.profilePhoto} alt="" className="h-full w-full rounded-[18px] object-cover" />
          ) : (
            <User className="h-5 w-5 text-brand-violet" />
          )}
        </Link>
      </header>

      {prediction &&
        prediction.daysUntilPeriod !== null &&
        prediction.daysUntilPeriod <= 7 && (
        <div className="premium-card overflow-hidden border-rose-200/60 bg-gradient-to-r from-rose-50 via-pink-50 to-violet-50 p-4 shadow-elev-3">
          <div className="flex items-center gap-3">
            <div className="flip-icon-ring h-12 w-12">
              <CalendarHeart className="h-7 w-7 text-brand-rose" />
            </div>
            <div>
              <p className="text-sm font-semibold text-accent-800">
                {prediction.daysUntilPeriod <= 0
                  ? "Period time — be gentle with yourself"
                  : `Period in ${prediction.daysUntilPeriod} days`}
              </p>
              <p className="text-xs text-accent-500">
                {prediction.phase} phase · Tap Cycle for tips
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-label text-accent-400">
        <RotateCcw className="h-3 w-3" />
        {t("home.tapCards")}
      </p>

      <WaterReminderPanel compact />

      <div className="grid grid-cols-2 gap-3.5">
        {statCards.map(({ key, icon: Icon, gradient, iconColor, getValue, label, getBack }) => {
          const value = getValue(todayLog);
          return (
            <FlipCard
              key={key}
              gradientClass={gradient}
              height="h-[148px]"
              front={
                <div className="relative z-[3] flex h-full flex-col justify-between p-4">
                  <div className="flip-icon-ring h-10 w-10">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="text-stat">{value}</p>
                    <p className="mt-0.5 text-xs font-medium text-accent-500">{label}</p>
                  </div>
                  <span className="flip-hint">Flip</span>
                </div>
              }
              back={
                <div className="relative z-[3] flex h-full flex-col justify-center gap-2.5 p-4">
                  <div className="flip-icon-ring h-9 w-9">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <p className="text-xs font-semibold leading-relaxed text-accent-800">
                    {getBack(value as never)}
                  </p>
                </div>
              }
            />
          );
        })}
      </div>

      <div className="premium-card p-5 shadow-elev-2">
        <h2 className="font-display text-title mb-4">Today&apos;s Goals</h2>
        <div className="space-y-2.5 text-sm">
          {goals.map((goal) => (
            <div key={goal.label} className="flex items-center gap-2.5">
              <CheckCircle2
                className={`h-4 w-4 shrink-0 ${goal.done ? "text-brand-teal" : "text-accent-300"}`}
                fill={goal.done ? "currentColor" : "none"}
              />
              <span
                className={
                  goal.done
                    ? "text-brand-teal font-medium line-through decoration-brand-teal/40"
                    : "text-accent-600"
                }
              >
                {goal.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link href="/chat">
            <MessageCircle className="h-5 w-5" />
            Ask AI Coach
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/plan">
            Today&apos;s Plan &amp; Reminders
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/wellness">Log Today&apos;s Wellness</Link>
        </Button>
      </div>
    </div>
  );
}
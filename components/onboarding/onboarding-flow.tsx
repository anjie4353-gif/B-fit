"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Droplets,
  Heart,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/hooks/useUserStore";
import { generateWellnessPlan } from "@/lib/plan/generate-plan";
import { bootstrapNotificationsOnOnboarding } from "@/components/notifications/notification-bootstrap";
import { useTranslation } from "@/components/i18n/i18n-provider";
import { syncWaterNotificationSchedule } from "@/lib/hydration/water-reminders";
import { calculateDailyWaterGlasses } from "@/lib/hydration/water-goal";
import { assessSleepSchedule } from "@/lib/coach/health-advisor";
import { DoctorAdviceCard } from "@/components/coach/doctor-advice-card";
import { syncUserToServer } from "@/lib/sync-user";
import type { WaterReminderSettings } from "@/types";
import {
  DIET_TYPE_LABELS,
  FITNESS_GOAL_LABELS,
  INDIAN_STATES,
  WORK_TYPE_LABELS,
  getRegionFromState,
} from "@/lib/bharat-coach";
import { PREGNANCY_STATUS_LABELS } from "@/lib/herwell-coach";
import type {
  ActivityLevel,
  DietType,
  FitnessGoal,
  Gender,
  PregnancyStatus,
  UserProfile,
  WorkType,
} from "@/types";
import { cn } from "@/lib/utils";

const FEMALE_STEPS = [1, 24, 2, 3, 4, 19, 20, 21, 5, 6, 22, 23, 7, 8, 25, 9, 10] as const;
const MALE_STEPS = [1, 24, 2, 3, 4, 11, 12, 13, 14, 15, 16, 17, 18, 25, 9, 10] as const;

function workTypeToActivity(workType: WorkType): ActivityLevel {
  const map: Record<WorkType, ActivityLevel> = {
    desk: "sedentary",
    field: "moderate",
    shift: "light",
    physical: "active",
  };
  return map[workType];
}

function getStepSequence(gender: Gender | ""): readonly number[] {
  return gender === "male" ? MALE_STEPS : FEMALE_STEPS;
}

const activityOptions: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
  { value: "light", label: "Light", desc: "1-2 days/week" },
  { value: "moderate", label: "Moderate", desc: "3-4 days/week" },
  { value: "active", label: "Active", desc: "5+ days/week" },
];

const cycleOptions = [28, 30, 35];

interface FormData {
  gender: Gender | "";
  fullName: string;
  nickname: string;
  age: string;
  weight: string;
  height: string;
  activityLevel: ActivityLevel | "";
  city: string;
  state: string;
  occupation: string;
  workType: WorkType | "";
  wakeTime: string;
  sleepTime: string;
  dietType: DietType | "";
  medicalConditions: string;
  fitnessGoal: FitnessGoal | "";
  pregnancyStatus: PregnancyStatus | "";
  hasPcod: boolean | null;
  underTreatment: boolean | null;
  takingMedications: boolean | null;
  medicationDetails: string;
  regularCycles: boolean | null;
  lastPeriodDate: string;
  cycleLength: number | "irregular" | "";
  whatsappNumber: string;
  consentGiven: boolean;
}

const initialForm: FormData = {
  gender: "",
  fullName: "",
  nickname: "",
  age: "",
  weight: "",
  height: "",
  activityLevel: "",
  city: "",
  state: "",
  occupation: "",
  workType: "",
  wakeTime: "06:00",
  sleepTime: "22:30",
  dietType: "",
  medicalConditions: "",
  fitnessGoal: "",
  pregnancyStatus: "",
  hasPcod: null,
  underTreatment: null,
  takingMedications: null,
  medicationDetails: "",
  regularCycles: null,
  lastPeriodDate: "",
  cycleLength: "",
  whatsappNumber: "",
  consentGiven: false,
};

function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "glass-interactive w-full rounded-2xl p-4 text-left transition-all duration-200 min-h-[56px] select-none active:scale-[0.98]",
        selected
          ? "bg-white/85 border-accent-400 shadow-[0_0_20px_rgba(107,114,128,0.2)] ring-2 ring-accent-400/50"
          : "bg-white/60 border border-white/80 hover:bg-white/75 hover:shadow-md"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">{children}</div>
        {selected && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white">
            <Check className="h-4 w-4" />
          </span>
        )}
      </div>
    </button>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const setProfile = useUserStore((s) => s.setProfile);
  const setWellnessPlan = useUserStore((s) => s.setWellnessPlan);
  const setPlanReady = useUserStore((s) => s.setPlanReady);
  const ensureInstallDate = useUserStore((s) => s.ensureInstallDate);
  const firstInstallDate = useUserStore((s) => s.firstInstallDate);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sleepDoctorAccepted, setSleepDoctorAccepted] = useState(false);
  const languageSet = useUserStore((s) => s.language);
  const existingProfile = useUserStore((s) => s.profile);

  useEffect(() => {
    if (existingProfile?.consentGiven) {
      router.replace("/home");
      return;
    }
    if (!languageSet) router.replace("/language");
  }, [languageSet, existingProfile, router]);

  const stepSequence = getStepSequence(form.gender);
  const step = stepSequence[stepIndex];
  const totalSteps = stepSequence.length;

  const agentWaterGlasses = useMemo(() => {
    const weight = parseFloat(form.weight);
    if (!form.gender || !weight || weight < 30) return null;
    return calculateDailyWaterGlasses({
      weightKg: weight,
      gender: form.gender as Gender,
      activityLevel: form.activityLevel,
      workType: form.workType,
    });
  }, [form.weight, form.gender, form.activityLevel, form.workType]);

  const sleepAssessment = useMemo(() => {
    if (!form.gender) return null;
    return assessSleepSchedule(
      form.wakeTime,
      form.sleepTime,
      form.gender as Gender
    );
  }, [form.wakeTime, form.sleepTime, form.gender]);

  const applySleepRecommendation = () => {
    if (!sleepAssessment) return;
    if (sleepAssessment.recommendedWake) {
      update("wakeTime", sleepAssessment.recommendedWake);
    }
    update("sleepTime", sleepAssessment.recommendedSleep);
    setSleepDoctorAccepted(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.sleepTime;
      delete next.sleepDoctor;
      return next;
    });
  };

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "gender" && value === "male") {
        next.hasPcod = false;
        next.underTreatment = null;
        next.takingMedications = null;
        next.medicationDetails = "";
        next.regularCycles = null;
        next.lastPeriodDate = "";
        next.cycleLength = "";
        next.activityLevel = "";
      }
      if (key === "gender" && value === "female") {
        next.occupation = "";
        next.workType = "";
        next.fitnessGoal = "";
        next.medicalConditions = "";
        next.wakeTime = "06:00";
        next.sleepTime = "22:30";
        next.pregnancyStatus = "";
      }

      if (key === "wakeTime" || key === "sleepTime") {
        setSleepDoctorAccepted(false);
      }

      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!form.gender) e.gender = "Please select your gender";
        break;
      case 24:
        if (!form.fullName.trim()) e.fullName = t("onboarding.nameRequired");
        break;
      case 25: {
        if (form.gender !== "male") {
          if (!form.wakeTime) e.wakeTime = "Required";
          if (!form.sleepTime) e.sleepTime = "Required";
          if (
            sleepAssessment &&
            !sleepAssessment.isHealthy &&
            !sleepDoctorAccepted
          ) {
            e.sleepDoctor = sleepAssessment.doctorMessage;
          }
        }
        break;
      }
      case 2: {
        const age = parseInt(form.age);
        if (!form.age || isNaN(age) || age < 13 || age > 70)
          e.age = "Age must be between 13 and 70";
        break;
      }
      case 3: {
        const w = parseFloat(form.weight);
        if (!form.weight || isNaN(w) || w < 30 || w > 300)
          e.weight = "Enter a valid weight (30-300 kg)";
        break;
      }
      case 4: {
        const h = parseFloat(form.height);
        if (!form.height || isNaN(h) || h < 100 || h > 250)
          e.height = "Enter a valid height (100-250 cm)";
        break;
      }
      case 5:
        if (!form.activityLevel) e.activityLevel = "Select activity level";
        break;
      case 6:
        if (form.hasPcod === null) e.hasPcod = "Please answer this question";
        break;
      case 19:
        if (!form.city.trim()) e.city = "Enter your city";
        break;
      case 20:
        if (!form.state) e.state = "Select your state";
        break;
      case 21:
        if (!form.dietType) e.dietType = "Select diet type";
        break;
      case 23:
        if (!form.pregnancyStatus) e.pregnancyStatus = "Please select";
        break;
      case 7:
        if (!form.lastPeriodDate) e.lastPeriodDate = "Enter your last period date";
        break;
      case 8:
        if (!form.cycleLength) e.cycleLength = "Select cycle length";
        break;
      case 9:
        break;
      case 10:
        if (!form.consentGiven) e.consent = "Consent is required to continue";
        break;
      case 11:
        if (!form.city.trim()) e.city = "Enter your city";
        break;
      case 12:
        if (!form.state) e.state = "Select your state";
        break;
      case 13:
        if (!form.occupation.trim()) e.occupation = "Enter your occupation";
        break;
      case 14:
        if (!form.workType) e.workType = "Select work type";
        break;
      case 15:
        if (!form.wakeTime) e.wakeTime = "Set wake time";
        if (!form.sleepTime) e.sleepTime = "Set sleep time";
        if (
          sleepAssessment &&
          !sleepAssessment.isHealthy &&
          !sleepDoctorAccepted
        ) {
          e.sleepDoctor = sleepAssessment.doctorMessage;
        }
        break;
      case 16:
        if (!form.dietType) e.dietType = "Select diet type";
        break;
      case 17:
        if (!form.fitnessGoal) e.fitnessGoal = "Select fitness goal";
        break;
      case 18:
        break;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (stepIndex < totalSteps - 1) setStepIndex(stepIndex + 1);
    else submit();
  };

  const back = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else router.push("/");
  };

  const submit = async () => {
    const isMale = form.gender === "male";
    setSubmitting(true);

    ensureInstallDate();
    const now = new Date().toISOString();
    const dailyGlasses = calculateDailyWaterGlasses({
      weightKg: parseFloat(form.weight),
      gender: form.gender as Gender,
      activityLevel: form.activityLevel,
      workType: form.workType,
    });

    const sleepForProfile =
      sleepAssessment && !sleepAssessment.isHealthy
        ? {
            wakeTime: sleepAssessment.recommendedWake ?? form.wakeTime,
            sleepTime: sleepAssessment.recommendedSleep,
          }
        : { wakeTime: form.wakeTime, sleepTime: form.sleepTime };

    const waterSettings: WaterReminderSettings = {
      wakeTime: sleepForProfile.wakeTime,
      sleepTime: sleepForProfile.sleepTime,
      dailyGlasses,
      mlPerGlass: 250,
      enabled: true,
      paused: false,
      pausedUntil: null,
    };

    const profile: UserProfile = {
      name: form.fullName.trim(),
      fullName: form.fullName.trim(),
      nickname: form.nickname.trim() || undefined,
      gender: form.gender as Gender,
      age: parseInt(form.age),
      weight: parseFloat(form.weight),
      height: parseFloat(form.height),
      activityLevel: isMale
        ? workTypeToActivity(form.workType as WorkType)
        : (form.activityLevel as ActivityLevel),
      pcod: {
        hasPcod: isMale ? false : (form.hasPcod ?? false),
        underTreatment: isMale ? undefined : (form.underTreatment ?? undefined),
        takingMedications: isMale ? undefined : (form.takingMedications ?? undefined),
        medicationDetails: isMale ? undefined : (form.medicationDetails || undefined),
        regularCycles: isMale ? undefined : (form.regularCycles ?? undefined),
      },
      femaleProfile: !isMale
        ? {
            city: form.city.trim(),
            state: form.state,
            region: getRegionFromState(form.state),
            dietType: form.dietType as DietType,
            pcosStatus: form.hasPcod ?? false,
            medications: form.medicationDetails.trim() || undefined,
            pregnancyStatus: form.pregnancyStatus as PregnancyStatus,
          }
        : undefined,
      maleProfile: isMale
        ? {
            city: form.city.trim(),
            state: form.state,
            region: getRegionFromState(form.state),
            occupation: form.occupation.trim(),
            workType: form.workType as WorkType,
            wakeTime: sleepForProfile.wakeTime,
            sleepTime: sleepForProfile.sleepTime,
            dietType: form.dietType as DietType,
            medicalConditions: form.medicalConditions.trim() || undefined,
            fitnessGoal: form.fitnessGoal as FitnessGoal,
          }
        : undefined,
      lastPeriodDate: isMale ? undefined : form.lastPeriodDate || undefined,
      cycleLength: isMale
        ? undefined
        : (form.cycleLength as number | "irregular") || undefined,
      whatsappNumber: `pwa-${crypto.randomUUID()}`,
      consentGiven: form.consentGiven,
      registeredAt: now,
      firstInstallDate: firstInstallDate ?? now,
      language: language ?? "en",
      waterReminderSettings: waterSettings,
    };

    setProfile(profile);

    try {
      const { plan, error } = await generateWellnessPlan(profile);
      if (plan) {
        setWellnessPlan(plan);
        setPlanReady(true);
      } else {
        console.error("Plan error:", error);
        setPlanReady(false);
      }
      await bootstrapNotificationsOnOnboarding();
      await syncWaterNotificationSchedule(
        waterSettings,
        profile.nickname ?? profile.fullName,
        language ?? "en"
      );
      void syncUserToServer(profile);
    } catch {
      setPlanReady(false);
    } finally {
      setSubmitting(false);
      router.push("/welcome");
    }
  };

  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className="flex min-h-dvh flex-col px-5 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={back}
          className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-accent-500"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs font-medium text-accent-400">
            Step {stepIndex + 1} of {totalSteps}
          </p>
          <Progress value={progress} className="mt-2" />
        </div>
      </div>

      <Card className="relative z-10 flex-1">
        <CardHeader>
          <CardTitle className="font-display text-xl">
            {step === 1 && "What's your gender?"}
            {step === 24 && t("onboarding.whatToCallYou")}
            {step === 25 && t("onboarding.hydrationTitle")}
            {step === 2 && "How old are you?"}
            {step === 3 && "What's your weight?"}
            {step === 4 && "What's your height?"}
            {step === 5 && "Activity level?"}
            {step === 6 && "PCOD / PCOS"}
            {step === 7 && "Last period date"}
            {step === 8 && "Typical cycle length"}
            {step === 9 && "Smart reminders"}
            {step === 10 && "Almost done!"}
            {step === 11 && "Which city are you in?"}
            {step === 12 && "Select your state"}
            {step === 13 && "What do you do?"}
            {step === 14 && "Work type"}
            {step === 15 && "Sleep schedule"}
            {step === 16 && "Diet preference"}
            {step === 17 && "Fitness goal"}
            {step === 18 && "Medical conditions (optional)"}
            {step === 19 && "Which city are you in?"}
            {step === 20 && "Select your state"}
            {step === 21 && "Diet preference"}
            {step === 22 && "Medications (optional)"}
            {step === 23 && "Pregnancy status"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="relative z-20 space-y-3">
              {(["female", "male"] as Gender[]).map((g) => (
                <OptionCard
                  key={g}
                  selected={form.gender === g}
                  onClick={() => {
                    update("gender", g);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.gender;
                      return next;
                    });
                    setStepIndex(1);
                  }}
                >
                  <span className="font-medium capitalize text-accent-900">{g}</span>
                </OptionCard>
              ))}
              <p className="text-center text-xs text-accent-400">
                Tap your gender to continue
              </p>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender}</p>
              )}
            </div>
          )}

          {step === 24 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("onboarding.fullName")}</Label>
                <Input
                  id="fullName"
                  placeholder={t("onboarding.fullNamePlaceholder")}
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">{t("onboarding.nickname")}</Label>
                <Input
                  id="nickname"
                  placeholder={t("onboarding.nicknamePlaceholder")}
                  value={form.nickname}
                  onChange={(e) => update("nickname", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 25 && (
            <div className="space-y-4">
              <p className="text-sm text-accent-500">{t("onboarding.hydrationSubtitle")}</p>
              {form.gender !== "male" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="wakeTime">{t("onboarding.wakeTime")}</Label>
                    <Input
                      id="wakeTime"
                      type="time"
                      value={form.wakeTime}
                      onChange={(e) => update("wakeTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleepTime">{t("onboarding.sleepTime")}</Label>
                    <Input
                      id="sleepTime"
                      type="time"
                      value={form.sleepTime}
                      onChange={(e) => update("sleepTime", e.target.value)}
                    />
                  </div>
                  {sleepAssessment && !sleepAssessment.isHealthy && (
                    <DoctorAdviceCard
                      message={sleepAssessment.doctorMessage}
                      recommendedSleep={sleepAssessment.recommendedSleep}
                      recommendedWake={sleepAssessment.recommendedWake}
                      onApply={applySleepRecommendation}
                    />
                  )}
                  {errors.sleepDoctor && (
                    <p className="text-sm text-red-500">{errors.sleepDoctor}</p>
                  )}
                </>
              )}
              <div className="glass rounded-2xl border border-white/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-brand-sky" />
                  <span className="text-sm font-medium text-accent-700">
                    {t("onboarding.agentWaterGoal")}
                  </span>
                </div>
                <p className="text-3xl font-semibold text-accent-900">
                  {agentWaterGlasses ?? "—"}{" "}
                  <span className="text-base font-normal text-accent-500">
                    {t("profile.glasses")}
                  </span>
                </p>
                <p className="text-xs text-accent-500">
                  {t("onboarding.agentWaterGoalNote")}
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label htmlFor="age">Age (13-70)</Label>
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                placeholder="25"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
              {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                inputMode="decimal"
                placeholder="60"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
              />
              {errors.weight && (
                <p className="text-sm text-red-500">{errors.weight}</p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                inputMode="numeric"
                placeholder="165"
                value={form.height}
                onChange={(e) => update("height", e.target.value)}
              />
              {errors.height && (
                <p className="text-sm text-red-500">{errors.height}</p>
              )}
            </div>
          )}

          {step === 5 && form.gender !== "male" && (
            <div className="space-y-3">
              {activityOptions.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.activityLevel === opt.value}
                  onClick={() => update("activityLevel", opt.value)}
                >
                  <p className="font-medium text-accent-900">{opt.label}</p>
                  <p className="text-sm text-accent-500">{opt.desc}</p>
                </OptionCard>
              ))}
              {errors.activityLevel && (
                <p className="text-sm text-red-500">{errors.activityLevel}</p>
              )}
            </div>
          )}

          {step === 6 && form.gender !== "male" && (
            <div className="space-y-3">
              <Label>Do you have PCOS/PCOD?</Label>
              <div className="flex gap-3">
                {[true, false].map((v) => (
                  <OptionCard
                    key={String(v)}
                    selected={form.hasPcod === v}
                    onClick={() => update("hasPcod", v)}
                  >
                    {v ? "Yes" : "No"}
                  </OptionCard>
                ))}
              </div>
              {errors.hasPcod && (
                <p className="text-sm text-red-500">{errors.hasPcod}</p>
              )}
            </div>
          )}

          {(step === 19 || step === 11) && (
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g. Chennai, Mumbai, Delhi"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>
          )}

          {(step === 20 || step === 12) && (
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                className="glass-input flex h-12 w-full rounded-2xl px-4 text-base text-accent-950 focus-visible:outline-none"
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {form.state && (
                <p className="text-xs text-accent-600">
                  Region: {getRegionFromState(form.state).replace(/^./, (c) => c.toUpperCase())} India
                </p>
              )}
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>
          )}

          {(step === 21 || step === 16) && (
            <div className="space-y-3">
              {(Object.entries(DIET_TYPE_LABELS) as [DietType, string][]).map(
                ([value, label]) => (
                  <OptionCard
                    key={value}
                    selected={form.dietType === value}
                    onClick={() => update("dietType", value)}
                  >
                    <span className="font-medium text-accent-900">{label}</span>
                  </OptionCard>
                )
              )}
              {errors.dietType && (
                <p className="text-sm text-red-500">{errors.dietType}</p>
              )}
            </div>
          )}

          {step === 22 && (
            <div className="space-y-2">
              <Label htmlFor="medDetails">Current medications (optional)</Label>
              <Input
                id="medDetails"
                placeholder="e.g. Metformin, Thyroid medicine — or leave blank"
                value={form.medicationDetails}
                onChange={(e) => update("medicationDetails", e.target.value)}
              />
              <p className="text-xs text-accent-400">
                We never prescribe or change medicines — this helps personalize tips only.
              </p>
            </div>
          )}

          {step === 23 && (
            <div className="space-y-3">
              {(Object.entries(PREGNANCY_STATUS_LABELS) as [PregnancyStatus, string][]).map(
                ([value, label]) => (
                  <OptionCard
                    key={value}
                    selected={form.pregnancyStatus === value}
                    onClick={() => update("pregnancyStatus", value)}
                  >
                    <span className="font-medium text-accent-900">{label}</span>
                  </OptionCard>
                )
              )}
              {errors.pregnancyStatus && (
                <p className="text-sm text-red-500">{errors.pregnancyStatus}</p>
              )}
            </div>
          )}

          {step === 7 && form.gender !== "male" && (
            <div className="space-y-2">
              <Label htmlFor="lastPeriod">Last period start date</Label>
              <Input
                id="lastPeriod"
                type="date"
                value={form.lastPeriodDate}
                onChange={(e) => update("lastPeriodDate", e.target.value)}
              />
              {errors.lastPeriodDate && (
                <p className="text-sm text-red-500">{errors.lastPeriodDate}</p>
              )}
            </div>
          )}

          {step === 8 && form.gender !== "male" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {cycleOptions.map((days) => (
                  <OptionCard
                    key={days}
                    selected={form.cycleLength === days}
                    onClick={() => update("cycleLength", days)}
                  >
                    <span className="font-medium text-accent-900">{days} days</span>
                  </OptionCard>
                ))}
              </div>
              <OptionCard
                selected={form.cycleLength === "irregular"}
                onClick={() => update("cycleLength", "irregular")}
              >
                <span className="font-medium text-accent-900">Irregular</span>
              </OptionCard>
              {errors.cycleLength && (
                <p className="text-sm text-red-500">{errors.cycleLength}</p>
              )}
            </div>
          )}

          {step === 13 && (
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                placeholder="e.g. Software Engineer, Shop owner"
                value={form.occupation}
                onChange={(e) => update("occupation", e.target.value)}
              />
              {errors.occupation && (
                <p className="text-sm text-red-500">{errors.occupation}</p>
              )}
            </div>
          )}

          {step === 14 && (
            <div className="space-y-3">
              {(Object.entries(WORK_TYPE_LABELS) as [WorkType, string][]).map(
                ([value, label]) => (
                  <OptionCard
                    key={value}
                    selected={form.workType === value}
                    onClick={() => update("workType", value)}
                  >
                    <span className="font-medium text-accent-900">{label}</span>
                  </OptionCard>
                )
              )}
              {errors.workType && (
                <p className="text-sm text-red-500">{errors.workType}</p>
              )}
            </div>
          )}

          {step === 15 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wakeTime">Wake up time</Label>
                <Input
                  id="wakeTime"
                  type="time"
                  value={form.wakeTime}
                  onChange={(e) => update("wakeTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleepTime">Sleep time</Label>
                <Input
                  id="sleepTime"
                  type="time"
                  value={form.sleepTime}
                  onChange={(e) => update("sleepTime", e.target.value)}
                />
              </div>
              <p className="text-xs text-accent-400">
                Ideal: wake 5:30-6:30 AM · sleep 10:30 PM · 7-9 hrs rest
              </p>
              {sleepAssessment && !sleepAssessment.isHealthy && (
                <DoctorAdviceCard
                  message={sleepAssessment.doctorMessage}
                  recommendedSleep={sleepAssessment.recommendedSleep}
                  recommendedWake={sleepAssessment.recommendedWake}
                  onApply={applySleepRecommendation}
                />
              )}
              {errors.wakeTime && (
                <p className="text-sm text-red-500">{errors.wakeTime}</p>
              )}
              {errors.sleepDoctor && (
                <p className="text-sm text-red-500">{errors.sleepDoctor}</p>
              )}
            </div>
          )}

          {step === 17 && (
            <div className="space-y-3">
              {(Object.entries(FITNESS_GOAL_LABELS) as [FitnessGoal, string][]).map(
                ([value, label]) => (
                  <OptionCard
                    key={value}
                    selected={form.fitnessGoal === value}
                    onClick={() => update("fitnessGoal", value)}
                  >
                    <span className="font-medium text-accent-900">{label}</span>
                  </OptionCard>
                )
              )}
              {errors.fitnessGoal && (
                <p className="text-sm text-red-500">{errors.fitnessGoal}</p>
              )}
            </div>
          )}

          {step === 18 && (
            <div className="space-y-2">
              <Label htmlFor="medical">Any medical conditions? (optional)</Label>
              <Input
                id="medical"
                placeholder="e.g. Diabetes, hypertension — or leave blank"
                value={form.medicalConditions}
                onChange={(e) => update("medicalConditions", e.target.value)}
              />
              <p className="text-xs text-accent-400">
                We never diagnose. This helps personalize lifestyle tips only.
              </p>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <div className="premium-card p-4 text-sm text-accent-700 leading-relaxed">
                <p className="font-medium text-accent-900">{t("onboarding.notificationsTitle")}</p>
                <p className="mt-2">{t("onboarding.notificationsSubtitle")}</p>
              </div>
              <div className="glass-subtle rounded-2xl p-4 text-sm text-accent-700 leading-relaxed">
                <p className="font-medium text-accent-900">Install as an app</p>
                <p className="mt-2">
                  After setup you&apos;ll get a link — add B-Fit to your Home Screen.
                  Reminders for water, meals, sleep &amp; movement will ring on your
                  phone with a <strong>Done</strong> button.
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-accent-600">
                  <li>Miss a reminder? We&apos;ll nudge again in 5 minutes.</li>
                  <li>Up to 3 alerts, then we pause until the next slot.</li>
                  <li>Plan stays active for 3 months, then we refresh your inputs.</li>
                </ul>
              </div>
              <p className="text-xs text-accent-500">
                Works for both men and women — schedule adapts to your profile.
              </p>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-6">
              <div className="glass-subtle rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                  <p className="text-sm text-accent-700 leading-relaxed">
                    Your data stays on this device only. Nothing is stored on
                    our servers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={form.consentGiven}
                  onCheckedChange={(c) => update("consentGiven", c === true)}
                />
                <label
                  htmlFor="consent"
                  className="text-sm text-accent-700 leading-relaxed cursor-pointer"
                >
                  I understand this platform is educational and does not replace
                  medical advice.
                </label>
              </div>
              {errors.consent && (
                <p className="text-sm text-red-500">{errors.consent}</p>
              )}

              <div className="rounded-2xl border border-accent-200 bg-accent-50/50 p-4">
                <div className="flex items-center gap-2 text-accent-700">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm font-medium">You&apos;re all set!</span>
                </div>
                <p className="mt-2 text-xs text-accent-600">
                  Tap complete to meet your B-Fit coach.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="relative z-20 mt-6">
        <Button onClick={next} className="w-full" size="lg" disabled={submitting || (step === 1 && !form.gender)}>
          {submitting ? (
            "Generating your plan..."
          ) : stepIndex === totalSteps - 1 ? (
            <>
              <Check className="h-5 w-5" />
              Complete Setup
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
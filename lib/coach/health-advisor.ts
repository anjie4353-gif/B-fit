import type { Gender } from "@/types";

export interface SleepScheduleAssessment {
  isHealthy: boolean;
  sleepDurationHours: number;
  issues: string[];
  recommendedSleep: string;
  recommendedWake?: string;
  doctorMessage: string;
}

export type UnhealthyHabitKind =
  | "late_heavy_meal"
  | "late_sleep_request"
  | "bad_bedtime"
  | null;

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function formatMinutesToTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function sleepDurationHours(wake: string, sleep: string): number {
  const wakeM = parseTimeToMinutes(wake);
  const sleepM = parseTimeToMinutes(sleep);

  // Evening bedtime (e.g. 22:30) → wake is next morning
  if (sleepM > wakeM && sleepM >= 18 * 60) {
    return (wakeM + 1440 - sleepM) / 60;
  }

  // After-midnight bedtime (e.g. 00:30) → wake same morning
  if (sleepM < wakeM) {
    return (wakeM - sleepM) / 60;
  }

  // Same-day gap (unusual daytime sleep)
  return (sleepM - wakeM) / 60;
}

/** Evidence-based bedtime window for healthy adults. */
export function assessSleepSchedule(
  wakeTime: string,
  sleepTime: string,
  gender: Gender = "female"
): SleepScheduleAssessment {
  const sleepM = parseTimeToMinutes(sleepTime);
  const wakeM = parseTimeToMinutes(wakeTime);
  const duration = sleepDurationHours(wakeTime, sleepTime);
  const issues: string[] = [];

  const recommendedSleep = gender === "male" ? "22:00" : "22:30";
  const recommendedWake =
    wakeM > 8 * 60 ? "06:30" : wakeM < 5 * 60 + 30 ? "06:00" : undefined;

  // Noon/morning "bedtime" is invalid
  if (sleepM >= 6 * 60 && sleepM < 21 * 60) {
    issues.push("bedtime_daytime");
  }

  // After 11 PM or early-morning bed (12 AM – 5 AM)
  if (sleepM >= 23 * 60 || sleepM < 5 * 60) {
    issues.push("bedtime_too_late");
  } else if (sleepM >= 22 * 60 + 45) {
    issues.push("bedtime_borderline_late");
  }

  if (duration < 7) issues.push("sleep_too_short");
  if (duration > 10) issues.push("sleep_too_long");
  if (wakeM >= 9 * 60) issues.push("wake_too_late");

  const isHealthy = issues.length === 0;

  let doctorMessage: string;
  if (issues.includes("bedtime_daytime")) {
    doctorMessage =
      "12 PM (afternoon) is not a healthy sleep time. Your body needs night sleep 10:00–10:30 PM for hormone repair, muscle recovery, and mental clarity. Please set bedtime between 9:30–10:30 PM.";
  } else if (issues.includes("bedtime_too_late")) {
    doctorMessage = `Sleep at ${sleepTime} is too late. After 11 PM, cortisol and melatonin clash — poor recovery, weight gain, and fatigue tomorrow. As your coach I recommend ${recommendedSleep} (7–9 hours before wake).`;
  } else if (issues.includes("bedtime_borderline_late")) {
    doctorMessage = `Bedtime ${sleepTime} is late. For a strong, healthy body, wind down by 10 PM and sleep by ${recommendedSleep}.`;
  } else if (issues.includes("sleep_too_short")) {
    doctorMessage = `Only ${duration.toFixed(1)} hours between wake and sleep — adults need 7–9 hours. Shift bedtime earlier to ${recommendedSleep}.`;
  } else if (issues.includes("wake_too_late")) {
    doctorMessage =
      "Waking after 9 AM often pairs with late nights and low energy. Try 6:00–6:30 AM wake with 10:30 PM sleep for better metabolism.";
  } else {
    doctorMessage =
      "Your sleep schedule supports recovery. Keep 7–9 hours consistently.";
  }

  return {
    isHealthy,
    sleepDurationHours: duration,
    issues,
    recommendedSleep,
    recommendedWake,
    doctorMessage,
  };
}

export function normalizeSleepSchedule(
  wakeTime: string,
  sleepTime: string,
  gender: Gender
): { wakeTime: string; sleepTime: string } {
  const assessment = assessSleepSchedule(wakeTime, sleepTime, gender);
  if (assessment.isHealthy) return { wakeTime, sleepTime };
  return {
    wakeTime: assessment.recommendedWake ?? wakeTime,
    sleepTime: assessment.recommendedSleep,
  };
}

const LATE_TIME_PATTERN =
  /(?:1[0-2]|10|11)\s*(?:pm|p\.m\.|night|రాత్రి|रात|இரவு)|midnight|12\s*(?:am|a\.m\.)|late\s*night|రాత్రి\s*(?:10|11|12)/i;

const HEAVY_FOOD_PATTERN =
  /biryani|biriyani|fried\s*rice|pulao|paratha|pizza|burger|heavy\s*meal|full\s*meal|big\s*dinner|rice\s*meal|nonveg|non-veg|బిర్యానీ|భోజనం/i;

const EAT_INTENT_PATTERN =
  /can\s+i\s+(eat|have)|should\s+i\s+(eat|have)|is\s+it\s+ok.*(eat|have)|tinocha|tinacha|తిన|खा|சாப்பி/i;

const SLEEP_INTENT_PATTERN =
  /sleep\s*(at|by|time)|bed\s*(at|by|time)|go\s*to\s*bed|bedtime|నిద్ర|सोना|தூங்க/i;

export function detectUnhealthyHabit(message: string): UnhealthyHabitKind {
  const trimmed = message.trim();
  if (!trimmed) return null;

  if (HEAVY_FOOD_PATTERN.test(trimmed) && LATE_TIME_PATTERN.test(trimmed)) {
    return "late_heavy_meal";
  }

  if (EAT_INTENT_PATTERN.test(trimmed) && HEAVY_FOOD_PATTERN.test(trimmed)) {
    if (LATE_TIME_PATTERN.test(trimmed)) return "late_heavy_meal";
  }

  if (SLEEP_INTENT_PATTERN.test(trimmed) && LATE_TIME_PATTERN.test(trimmed)) {
    return "late_sleep_request";
  }

  if (/sleep\s*(at|by)\s*(12|11|1)\s*pm/i.test(trimmed)) {
    return "bad_bedtime";
  }

  return null;
}

export function getStaticDoctorResponse(
  kind: NonNullable<UnhealthyHabitKind>,
  gender: Gender = "female"
): string {
  const womenNote =
    gender === "female"
      ? " Late meals worsen PCOS, period cramps, and mood swings."
      : " Late meals raise belly fat risk and hurt next-day strength.";

  switch (kind) {
    case "late_heavy_meal":
      return (
        "I cannot recommend biryani or a heavy meal at 11 PM — as your wellness coach I have to be honest.\n\n" +
        "Why: digestion slows at night, insulin stays high, sleep quality drops, and you wake sluggish." +
        womenNote +
        "\n\nBetter plan: finish dinner by 8 PM. If hungry now, take a small bowl of curd, soup, or fruit. " +
        "Enjoy biryani at lunch tomorrow — your body handles it much better.\n\n" +
        "This is educational guidance, not a substitute for medical advice."
      );
    case "late_sleep_request":
    case "bad_bedtime":
      return (
        "Sleeping at 12 AM (midnight) is not a healthy plan I can support.\n\n" +
        "Why: melatonin peaks before 11 PM; late sleep cuts deep sleep, raises cortisol, and weakens immunity and focus." +
        womenNote +
        `\n\nDoctor-coach recommendation: lights off by 10 PM, sleep by ${gender === "male" ? "10:00" : "10:30"} PM, ` +
        "7–9 hours. Start tonight — shift 30 minutes earlier each week if needed.\n\n" +
        "This is educational guidance, not a substitute for medical advice."
      );
  }
}
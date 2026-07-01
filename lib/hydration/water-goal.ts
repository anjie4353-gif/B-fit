import type { ActivityLevel, Gender, WorkType } from "@/types";

function workTypeToActivity(workType: WorkType): ActivityLevel {
  const map: Record<WorkType, ActivityLevel> = {
    desk: "sedentary",
    field: "moderate",
    shift: "light",
    physical: "active",
  };
  return map[workType];
}

export interface WaterGoalInput {
  weightKg: number;
  gender: Gender;
  activityLevel?: ActivityLevel | "";
  workType?: WorkType | "";
}

/**
 * Agent-computed daily water goal (glasses × 250ml).
 * Based on body weight, activity, and gender — user is never prompted.
 */
export function calculateDailyWaterGlasses(input: WaterGoalInput): number {
  const weight = input.weightKg;
  if (!weight || weight < 30 || weight > 300) return 8;

  let ml = weight * 35;

  const activity: ActivityLevel = input.activityLevel
    ? input.activityLevel
    : input.workType
      ? workTypeToActivity(input.workType)
      : "moderate";

  const activityBoostMl: Record<ActivityLevel, number> = {
    sedentary: 0,
    light: 200,
    moderate: 400,
    active: 600,
  };
  ml += activityBoostMl[activity];

  if (input.gender === "male") ml += 250;

  const glasses = Math.round(ml / 250);
  return Math.min(16, Math.max(6, glasses));
}
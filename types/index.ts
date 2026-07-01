export type Gender = "female" | "male";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type IndiaRegion = "north" | "south" | "east" | "west" | "central";
export type WorkType = "desk" | "field" | "shift" | "physical";
export type DietType = "vegetarian" | "non_vegetarian" | "vegan" | "eggetarian";
export type FitnessGoal =
  | "weight_loss"
  | "muscle_gain"
  | "general_fitness"
  | "better_sleep"
  | "stress_relief"
  | "metabolic_health";

export type PregnancyStatus =
  | "not_pregnant"
  | "pregnant"
  | "trying"
  | "postpartum"
  | "prefer_not_say";

export interface FemaleProfile {
  city: string;
  state: string;
  region?: IndiaRegion;
  dietType: DietType;
  pcosStatus: boolean;
  medications?: string;
  pregnancyStatus: PregnancyStatus;
}

export interface MaleProfile {
  city: string;
  state: string;
  region?: IndiaRegion;
  occupation: string;
  workType: WorkType;
  wakeTime: string;
  sleepTime: string;
  dietType: DietType;
  medicalConditions?: string;
  fitnessGoal: FitnessGoal;
}

export interface PCODProfile {
  hasPcod: boolean;
  underTreatment?: boolean;
  takingMedications?: boolean;
  medicationDetails?: string;
  regularCycles?: boolean;
}

export type AppLanguage = "en" | "te" | "hi" | "ta" | "kn" | "ml";

export interface WaterReminderSettings {
  wakeTime: string;
  sleepTime: string;
  dailyGlasses: number;
  mlPerGlass: number;
  enabled: boolean;
  paused: boolean;
  pausedUntil: string | null;
}

export type WaterReminderAction =
  | "scheduled"
  | "fired"
  | "consumed"
  | "skipped"
  | "paused"
  | "resumed";

export interface WaterReminderHistoryEntry {
  id: string;
  scheduledAt: string;
  action: WaterReminderAction;
  glasses?: number;
  recordedAt: string;
}

export interface UserProfile {
  name?: string;
  fullName?: string;
  nickname?: string;
  profilePhoto?: string;
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  activityLevel: ActivityLevel;
  pcod: PCODProfile;
  femaleProfile?: FemaleProfile;
  maleProfile?: MaleProfile;
  lastPeriodDate?: string;
  cycleLength?: number | "irregular";
  whatsappNumber: string;
  consentGiven: boolean;
  onboardedAt?: string;
  registeredAt?: string;
  firstInstallDate?: string;
  language?: AppLanguage;
  waterReminderSettings?: WaterReminderSettings;
}

export interface PeriodPrediction {
  nextPeriodDate: Date | null;
  ovulationDate: Date | null;
  pmsWindowStart: Date | null;
  pmsWindowEnd: Date | null;
  daysUntilPeriod: number | null;
  phase: "menstrual" | "follicular" | "ovulation" | "luteal" | "pms" | "unknown";
}

export interface DailyLog {
  date: string;
  waterIntake: number;
  steps: number;
  sleepHours: number;
  mood: 1 | 2 | 3 | 4 | 5;
  energyLevel: 1 | 2 | 3 | 4 | 5;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isEmergency?: boolean;
}

export interface WhatsAppMessage {
  id: string;
  type: MessageType | "user_reply";
  content: string;
  timestamp: string;
  direction: "incoming" | "outgoing";
  deliveryStatus: "sent" | "delivered" | "failed" | "simulated";
  deliveryError?: string;
}

export type MessageType =
  | "wake_up"
  | "breakfast"
  | "morning"
  | "hydration"
  | "lunch"
  | "movement"
  | "snack"
  | "activity"
  | "dinner"
  | "sleep_prep"
  | "sleep"
  | "period_7d"
  | "period_3d"
  | "period_1d"
  | "period_day1"
  | "welcome";

export interface ScheduledMessage {
  id: string;
  type: MessageType;
  scheduledTime: string;
  content: string;
  status: "pending" | "sent" | "failed";
}

export interface DashboardMetrics {
  totalSessions: number;
  activeToday: number;
  pcodUsers: number;
  messagesSent: number;
  upcomingPeriodAlerts: number;
  failedDeliveries: number;
}

export interface PlanReminderSlot {
  id: string;
  type: MessageType;
  label: string;
  time: string;
  message: string;
  icon?: string;
}

export interface WellnessPlan {
  id: string;
  createdAt: string;
  expiresAt: string;
  summary: string;
  reminders: PlanReminderSlot[];
  gender: Gender;
}

export type ReminderInstanceStatus = "pending" | "done" | "stopped";

export interface ReminderInstanceState {
  status: ReminderInstanceStatus;
  attempts: number;
  lastFiredAt: string | null;
  doneAt: string | null;
  snoozedUntil: string | null;
}

export interface ActiveReminderAlert {
  slotId: string;
  label: string;
  message: string;
  attempt: number;
  maxAttempts: number;
}
import type {
  DietType,
  FitnessGoal,
  IndiaRegion,
  UserProfile,
  WorkType,
} from "@/types";

export const BHARAT_MEDICAL_DISCLAIMER =
  "This guidance is educational and not a substitute for medical advice.";

export const BHARAT_MEN_SYSTEM_PROMPT = `You are B-Fit Men's Coach, an evidence-based men's wellness assistant on the B-Fit app, designed specifically for Indian users.

MISSION:
Help Indian men improve:
* Sleep quality
* Physical fitness
* Hydration
* Nutrition
* Stress management
* Weight management
* Productivity
* Long-term metabolic health

You are NOT a doctor.

You must never:
* Diagnose diseases
* Prescribe medications
* Recommend stopping medicines
* Claim medical certainty

Always remind users:
"This guidance is educational and not a substitute for medical advice."

REGIONAL ADAPTATION:
Adjust recommendations based on North, South, East, West, or Central India.
Consider climate, food habits, seasonal fruits, local cuisines, and water requirements.

South India examples: Idli, Dosa, Sambar, Ragi, Coconut
North India examples: Roti, Dal, Paneer, seasonal vegetables
West India examples: Jowar, Bajra, Poha
East India: Rice, fish, mustard oil dishes, seasonal greens
Central India: Wheat roti, dal, seasonal sabzi

DAILY IDEAL SCHEDULE REFERENCE:
5:30-6:30 AM: Wake, 500ml water, 10 min sunlight, light mobility
7:00 AM: Protein-rich Indian breakfast
9:00 AM: Hydration reminder
11:00 AM: 5-min movement break
1:00 PM: Lunch — 50% vegetables, 25% protein, 25% carbs
4:00 PM: Healthy snack (fruits, roasted chana, nuts — avoid sugary drinks)
6:00 PM: 8000-10000 steps OR 30-45 min exercise
8:00 PM: Light dinner, avoid overeating
10:00 PM: Sleep prep — no screens, low light, mindfulness
10:30 PM: Sleep target 7-9 hours

COACHING STYLE:
Friendly, practical, scientific, Indian-context aware, motivational, concise WhatsApp messages.

OUTPUT FORMAT when giving daily guidance:
Daily Plan | Nutrition Tips | Hydration Goal | Step Goal | Sleep Goal | Stress Tip | Motivation

Never exceed 150 words per WhatsApp response.`;

const STATE_REGION_MAP: Record<string, IndiaRegion> = {
  delhi: "north",
  haryana: "north",
  punjab: "north",
  "uttar pradesh": "north",
  uttarakhand: "north",
  "himachal pradesh": "north",
  "jammu and kashmir": "north",
  rajasthan: "north",
  "tamil nadu": "south",
  kerala: "south",
  karnataka: "south",
  "andhra pradesh": "south",
  telangana: "south",
  puducherry: "south",
  "west bengal": "east",
  odisha: "east",
  bihar: "east",
  jharkhand: "east",
  assam: "east",
  sikkim: "east",
  meghalaya: "east",
  manipur: "east",
  mizoram: "east",
  nagaland: "east",
  tripura: "east",
  "arunachal pradesh": "east",
  maharashtra: "west",
  gujarat: "west",
  goa: "west",
  rajasthan_west: "west",
  "madhya pradesh": "central",
  chhattisgarh: "central",
};

export function getRegionFromState(state: string): IndiaRegion {
  const key = state.trim().toLowerCase();
  return STATE_REGION_MAP[key] ?? "central";
}

export function getRegionalFoodHint(region: IndiaRegion): string {
  const hints: Record<IndiaRegion, string> = {
    north: "Roti, dal, paneer, seasonal sabzi, lassi",
    south: "Idli, dosa, sambar, ragi, coconut-based dishes",
    east: "Rice, fish, dal, seasonal greens, light curries",
    west: "Jowar, bajra, poha, dhokla, groundnut chutney",
    central: "Wheat roti, dal, seasonal vegetables, sprouts",
  };
  return hints[region];
}

export function buildMaleUserContext(profile?: Partial<UserProfile>): string {
  if (!profile?.maleProfile) return "";

  const m = profile.maleProfile;
  const region = m.region ?? getRegionFromState(m.state);
  const parts = [
    `Gender: male`,
    `Age: ${profile.age}`,
    `Height: ${profile.height}cm`,
    `Weight: ${profile.weight}kg`,
    `City: ${m.city}`,
    `State: ${m.state}`,
    `Region: ${region}`,
    `Occupation: ${m.occupation}`,
    `Work type: ${m.workType}`,
    `Wake time: ${m.wakeTime}`,
    `Sleep time: ${m.sleepTime}`,
    `Diet: ${m.dietType}`,
    `Fitness goal: ${m.fitnessGoal}`,
    `Regional foods: ${getRegionalFoodHint(region)}`,
  ];

  if (m.medicalConditions) {
    parts.push(`Medical conditions (user-reported): ${m.medicalConditions}`);
  }

  return `\nUser profile:\n${parts.join("\n")}`;
}

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  desk: "Desk / Office job",
  field: "Field work",
  shift: "Shift work",
  physical: "Physical labour",
};

export const DIET_TYPE_LABELS: Record<DietType, string> = {
  vegetarian: "Vegetarian",
  non_vegetarian: "Non-vegetarian",
  vegan: "Vegan",
  eggetarian: "Eggetarian",
};

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  weight_loss: "Weight loss",
  muscle_gain: "Muscle gain",
  general_fitness: "General fitness",
  better_sleep: "Better sleep",
  stress_relief: "Stress relief",
  metabolic_health: "Metabolic health",
};

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;
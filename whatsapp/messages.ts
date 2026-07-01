import type { MessageType, UserProfile } from "@/types";
import { getRegionalFoodHint, getRegionFromState } from "@/lib/bharat-coach";
import { HERWELL_MEDICAL_DISCLAIMER } from "@/lib/herwell-coach";
import { PERIOD_TIPS } from "@/lib/period";

export const FEMALE_WELCOME = `Welcome to B-Fit 🌸

Your Indian women's wellness companion:

✓ Period & cycle tracking
✓ PCOS/PCOD lifestyle support
✓ Regional Indian nutrition
✓ Hydration & fitness goals
✓ Daily WhatsApp reminders

${HERWELL_MEDICAL_DISCLAIMER}`;

export const MALE_WELCOME = `Welcome to B-Fit 💪

Your Indian men's wellness companion:

✓ Sleep & fitness coaching
✓ Regional Indian nutrition
✓ Hydration & step goals
✓ Stress & productivity tips
✓ Daily WhatsApp reminders

This guidance is educational and not a substitute for medical advice.`;

export const FEMALE_DAILY_MESSAGES: Record<
  | "wake_up"
  | "breakfast"
  | "hydration"
  | "lunch"
  | "snack"
  | "activity"
  | "dinner"
  | "sleep_prep"
  | "sleep",
  string
> = {
  wake_up: `🌅 Good Morning!

Start your day right:
✓ Drink water — hydrate first
✓ 10 min sunlight
✓ Gentle stretches

Hormonal health loves morning rituals!`,

  breakfast: `🍳 Breakfast (7:30 AM)

Balanced breakfast with protein:
• Idli + Sambar / Poha / Eggs / Paneer / Oats
• Include protein in every breakfast
• Avoid skipping — it supports hormones`,

  hydration: `💧 Water Reminder (10 AM)

Aim for 2-2.5L water today.
Warm water or ginger tea may ease bloating.
Keep sipping through the day!`,

  lunch: `🥗 Balanced Lunch (1 PM)

Build your plate:
• Plenty of vegetables
• Protein: dal, paneer, eggs, fish
• Whole grains: roti, rice, millets
Eat mindfully 💗`,

  snack: `🥜 Healthy Snack (4 PM)

Good options:
• Fruits / roasted chana / nuts
• Millets-based snacks

Avoid: sugary drinks, excess sweets, fried junk`,

  activity: `🚶 Walk or Exercise (6 PM)

Today's movement goal:
✓ 30-45 min walk, yoga, or workout
✓ Gentle movement supports hormones & mood

Listen to your body — rest if on period.`,

  dinner: `🌙 Light Dinner (8 PM)

Keep dinner light:
• Dal + sabzi + roti/millets
• Avoid heavy or late meals
• Supports sleep & digestion`,

  sleep_prep: `😴 Sleep Prep (10 PM)

Wind down now:
• No screens
• Dim lights
• Deep breathing or gentle yoga
• Target 7-9 hours sleep`,

  sleep: `🌙 Sleep Time (10:30 PM)

Good sleep supports hormonal balance, recovery & mood.
Rest well — you deserve it 🌸`,
};

export const MALE_DAILY_MESSAGES: Record<
  | "wake_up"
  | "breakfast"
  | "hydration"
  | "movement"
  | "lunch"
  | "snack"
  | "activity"
  | "dinner"
  | "sleep_prep"
  | "sleep",
  string
> = {
  wake_up: `🌅 Good Morning!

Start strong:
✓ 500ml water first thing
✓ 10 min sunlight
✓ Light stretches / mobility

Small habits, big results!`,

  breakfast: `🍳 Breakfast Time (7 AM)

Protein-rich Indian breakfast:
• Idli + Sambar / Upma / Eggs / Oats / Sprouts
• Avoid sugary drinks
• Eat within 1 hour of waking`,

  hydration: `💧 Hydration (9 AM)

Aim for 2.5-3L water today.
Hot climate? Add 500ml more.
Keep a bottle at your desk!`,

  movement: `🚶 Movement Break (11 AM)

Stand and walk 5 minutes.
Desk job? Stretch neck, shoulders, hips.
Movement boosts focus & metabolism.`,

  lunch: `🥗 Lunch (1 PM)

Plate structure:
• 50% vegetables
• 25% protein (dal, paneer, chicken, fish)
• 25% carbs (roti/rice)
Eat mindfully, no rushing!`,

  snack: `🥜 Healthy Snack (4 PM)

Good choices:
• Seasonal fruits
• Roasted chana
• Handful of nuts

Avoid: sugary drinks, fried junk`,

  activity: `🏃 Evening Activity (6 PM)

Today's target:
✓ 8000-10000 steps
OR
✓ 30-45 min exercise (walk, gym, yoga)

You've got this!`,

  dinner: `🌙 Dinner (8 PM)

Keep it light:
• Dal + sabzi + roti
• Avoid overeating
• Finish 2-3 hrs before sleep`,

  sleep_prep: `😴 Sleep Prep (10 PM)

Wind down now:
• No screens
• Dim lights
• 5 min deep breathing
• Target 7-9 hrs sleep`,

  sleep: `🌙 Sleep Time (10:30 PM)

Good sleep = better hormones, recovery & focus.
Put phone away. Rest well, champion!`,
};

export const PERIOD_MESSAGES: Record<
  "period_7d" | "period_3d" | "period_1d" | "period_day1",
  string
> = {
  period_7d: `📅 Period in ~7 days (PMS window may begin)

Prepare gently:
• ${PERIOD_TIPS.hydration}
• Stock iron-rich foods: ${PERIOD_TIPS.iron}
• ${PERIOD_TIPS.pms}`,

  period_3d: `📅 Period in ~3 days

Gentle prep:
• ${PERIOD_TIPS.hydration}
• Warm meals, reduce caffeine if sensitive
• ${PERIOD_TIPS.exercise}`,

  period_1d: `📅 Period likely tomorrow

Be kind to yourself:
• ${PERIOD_TIPS.iron}
• Heating pad, ginger tea for mild discomfort
• Rest when needed — never push through pain`,

  period_day1: `🌸 Day 1 of your cycle

Take it easy:
• ${PERIOD_TIPS.hydration}
• Iron-rich foods: spinach, lentils, dates
• Gentle walking or stretching only
• For severe pain — please see a doctor`,
};

function appendRegionalFoods(
  msg: string,
  profile?: Partial<UserProfile>
): string {
  const f = profile?.femaleProfile;
  const m = profile?.maleProfile;
  const state = f?.state ?? m?.state;
  if (!state) return msg;
  const region = f?.region ?? m?.region ?? getRegionFromState(state);
  const foods = getRegionalFoodHint(region);
  return `${msg}\n\n🍛 ${region.charAt(0).toUpperCase() + region.slice(1)} India: ${foods}`;
}

export function getScheduledMessagesForHour(
  hour: number,
  gender?: string
): MessageType[] {
  const maleSchedule: Record<number, MessageType[]> = {
    6: ["wake_up"],
    7: ["breakfast"],
    9: ["hydration"],
    11: ["movement"],
    13: ["lunch"],
    16: ["snack"],
    18: ["activity"],
    20: ["dinner"],
    22: ["sleep_prep", "sleep"],
  };

  const femaleSchedule: Record<number, MessageType[]> = {
    6: ["wake_up"],
    7: ["breakfast"],
    10: ["hydration"],
    13: ["lunch"],
    16: ["snack"],
    18: ["activity"],
    20: ["dinner"],
    22: ["sleep_prep", "sleep"],
  };

  return gender === "male"
    ? (maleSchedule[hour] ?? [])
    : (femaleSchedule[hour] ?? []);
}

export function getMessageContent(
  type: MessageType,
  profile?: Partial<UserProfile>
): string {
  const gender = profile?.gender;

  if (type === "welcome") {
    return gender === "male" ? MALE_WELCOME : FEMALE_WELCOME;
  }

  if (type in PERIOD_MESSAGES) {
    return PERIOD_MESSAGES[type as keyof typeof PERIOD_MESSAGES];
  }

  const foodTypes = ["breakfast", "lunch", "snack"] as const;

  if (gender === "male" && type in MALE_DAILY_MESSAGES) {
    let msg = MALE_DAILY_MESSAGES[type as keyof typeof MALE_DAILY_MESSAGES];
    if (
      profile?.maleProfile &&
      foodTypes.includes(type as (typeof foodTypes)[number])
    ) {
      msg = appendRegionalFoods(msg, profile);
    }
    return msg;
  }

  if (gender === "female" && type in FEMALE_DAILY_MESSAGES) {
    let msg = FEMALE_DAILY_MESSAGES[type as keyof typeof FEMALE_DAILY_MESSAGES];
    if (
      profile?.femaleProfile &&
      foodTypes.includes(type as (typeof foodTypes)[number])
    ) {
      msg = appendRegionalFoods(msg, profile);
    }
    return msg;
  }

  return "";
}
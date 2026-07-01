---
name: bfit-agent-goals
description: >
  B-Fit / HerHealth agent-planned wellness goals. The coach agent MUST plan and assign
  daily water glasses from profile data (weight, gender, activity) and show the plan
  to the user — NEVER ask "how many glasses?" or any water-goal input. Trigger on:
  water goal, hydration, నీరు, glasses, onboarding, waterReminderSettings,
  calculateDailyWaterGlasses, dailyWaterGoal, agent plan.
---

# B-Fit Agent-Planned Water Goal

## Core rule (non-negotiable)

**Agent plan chesi ivvali. User ni adagakudadu.**

- Coach/agent decides **enni glasses water tagali** from profile data.
- User sees the plan (read-only card) — they do **not** enter or choose the goal.
- User only **logs intake** (+/− glasses today), never sets the daily target.

### Forbidden (never add these)

- `<Input>` or number picker for daily water glasses in onboarding, profile, or settings
- Validation like `waterGoalRequired` tied to user-entered glass count
- Chat/coach prompts: "How many glasses do you want to drink?"
- `dailyWaterGoal` field in `FormData` or onboarding steps

---

## Agent plan flow

```
Profile collected (weight, gender, activity/workType)
        ↓
calculateDailyWaterGlasses()  →  6–16 glasses (250 ml each)
        ↓
Saved to profile.waterReminderSettings.dailyGlasses
        ↓
Shown read-only: onboarding step 25, profile, home, daily log, dashboard
        ↓
Water reminder schedule + notifications use same dailyGlasses
```

### Calculation (`lib/hydration/water-goal.ts`)

```ts
calculateDailyWaterGlasses({
  weightKg,
  gender,
  activityLevel,  // female path
  workType,       // male path (maps to activity)
})
```

| Factor | Effect |
|--------|--------|
| Base | weight (kg) × 35 ml |
| Activity | sedentary +0, light +200, moderate +400, active +600 ml |
| Male | +250 ml |
| Clamp | 6–16 glasses |

---

## UI patterns (implemented)

| Screen | What user sees | What user does |
|--------|----------------|----------------|
| Onboarding step 25 | Agent goal card (`agentWaterGoal` + count + `agentWaterGoalNote`) | Sets wake/sleep only (female); no glass input |
| Profile | Read-only `ProfileRow` with daily glasses | Cannot edit goal |
| Home / daily log | `Goal: N glasses` from profile | Logs today's intake only |
| Progress dashboard | `waterGoal` from profile sync | View only |

**Read pattern everywhere:**

```ts
profile?.waterReminderSettings?.dailyGlasses ?? 8
```

**Write pattern (onboarding submit only):**

```ts
const dailyGlasses = calculateDailyWaterGlasses({ weightKg, gender, activityLevel, workType });
waterReminderSettings: { dailyGlasses, mlPerGlass: 250, wakeTime, sleepTime, ... }
```

---

## i18n (6 locales: en, te, hi, ta, kn, ml)

Required keys:
- `onboarding.hydrationSubtitle` — coach sets goal automatically
- `onboarding.agentWaterGoal` — personalized goal label
- `onboarding.agentWaterGoalNote` — calculated from weight & activity
- `profile.glasses`, `profile.waterGoal`

Deprecated (do not use in UI): `onboarding.dailyWaterGoal`, `onboarding.waterGoalRequired`

---

## Tests & verify

```bash
npm run test:unit    # tests/unit/water-goal.test.ts
npm run build
```

---

## Non-disruptive constraint

Hydration/onboarding files only. Do not change unrelated modules, APIs, or nav.
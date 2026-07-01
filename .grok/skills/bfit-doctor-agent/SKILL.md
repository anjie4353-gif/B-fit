---
name: bfit-doctor-agent
description: >
  B-Fit doctor-coach agents for men and women. Use when changing onboarding validation,
  sleep/meal habits, chat coach, plan generation, or habit refusal logic. Agents think
  like lifestyle physicians — refuse unhealthy habits, explain why, suggest better plans.
  Never accept late sleep, heavy late meals, or bad bedtimes without correction.
---

# B-Fit Doctor-Coach Agent

## Core behavior

**Agent = personal advice doctor (not a licensed MD).**

- Men agent: `BHARAT_MEN_SYSTEM_PROMPT` + `DOCTOR_COACH_RULES`
- Women agent: `HERWELL_SYSTEM_PROMPT` + `DOCTOR_COACH_RULES` + PCOS rules

### Never accept without correction

| User input | Agent response |
|------------|----------------|
| Sleep 12 AM / after 11 PM | Refuse. Recommend 10:00–10:30 PM. Explain circadian rhythm. |
| Sleep 12 PM (noon) | Refuse. Explain night sleep is required. |
| Biryani / heavy meal at 11 PM | Refuse. Dinner by 8 PM; light snack if hungry. |
| Sleep under 7 hours | Refuse. Shift bedtime earlier. |

### Onboarding

- `assessSleepSchedule()` in `lib/coach/health-advisor.ts`
- Show `DoctorAdviceCard` on steps 15 (male) and 25 (female)
- Block Continue until user applies doctor recommendation OR enters healthy schedule
- `normalizeSleepSchedule()` applied on plan generate + submit

### Chat

- `detectUnhealthyHabit()` before general Groq chat
- Static doctor response + `generateDoctorHabitAdvice()` for AI layer
- Temperature 0.55 for consistency; never say "ok" to unhealthy habits

### Plan

- `app/api/plan/generate/route.ts` → `applyHealthySleep()` before reminders
- Female reminders now use profile wake/sleep (not hardcoded)

## PWA updates (no reinstall)

- Bump `APP_VERSION` in `lib/pwa/version.ts` + `public/sw.js` CACHE name on deploy
- `UpdatePrompt` shows "New features available" + Update button
- Optional push notification via `notifyUpdateAvailable()`

## Files

```
lib/coach/health-advisor.ts
lib/coach/doctor-rules.ts
components/coach/doctor-advice-card.tsx
components/pwa/update-prompt.tsx
lib/chat-handler.ts
services/groq.ts
tests/unit/health-advisor.test.ts
```

## Verify

```bash
npm run test:unit
npm run build
```
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assessSleepSchedule,
  detectUnhealthyHabit,
  normalizeSleepSchedule,
} from "../../lib/coach/health-advisor";

describe("assessSleepSchedule", () => {
  it("flags midnight bedtime as unhealthy", () => {
    const result = assessSleepSchedule("06:30", "00:00", "female");
    assert.equal(result.isHealthy, false);
    assert.ok(result.issues.includes("bedtime_too_late"));
    assert.equal(result.recommendedSleep, "22:30");
  });

  it("flags noon bedtime as unhealthy", () => {
    const result = assessSleepSchedule("06:30", "12:00", "male");
    assert.equal(result.isHealthy, false);
    assert.ok(result.issues.includes("bedtime_daytime"));
  });

  it("accepts healthy 10:30 PM sleep", () => {
    const result = assessSleepSchedule("06:00", "22:30", "female");
    assert.equal(result.isHealthy, true);
  });
});

describe("detectUnhealthyHabit", () => {
  it("detects late biryani", () => {
    assert.equal(
      detectUnhealthyHabit("Can I eat biryani at 11 pm?"),
      "late_heavy_meal"
    );
  });

  it("detects late sleep request", () => {
    assert.equal(
      detectUnhealthyHabit("I want to sleep at 12 am"),
      "late_sleep_request"
    );
  });
});

describe("normalizeSleepSchedule", () => {
  it("corrects late sleep to doctor recommendation", () => {
    const normalized = normalizeSleepSchedule("06:30", "00:00", "female");
    assert.equal(normalized.sleepTime, "22:30");
  });
});
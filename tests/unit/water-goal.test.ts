import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateDailyWaterGlasses } from "../../lib/hydration/water-goal";

describe("calculateDailyWaterGlasses", () => {
  it("computes higher goal for active male", () => {
    const glasses = calculateDailyWaterGlasses({
      weightKg: 75,
      gender: "male",
      workType: "physical",
    });
    assert.ok(glasses >= 10 && glasses <= 16);
  });

  it("returns default when weight missing", () => {
    assert.equal(
      calculateDailyWaterGlasses({ weightKg: 0, gender: "female" }),
      8
    );
  });

  it("clamps to valid range", () => {
    const glasses = calculateDailyWaterGlasses({
      weightKg: 45,
      gender: "female",
      activityLevel: "sedentary",
    });
    assert.ok(glasses >= 6 && glasses <= 16);
  });
});
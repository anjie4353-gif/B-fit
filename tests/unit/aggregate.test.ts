import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aggregateProgress } from "../../modules/progress-dashboard/utils/aggregate";
import type { ProgressDataInput } from "../../modules/progress-dashboard/types";

describe("aggregateProgress", () => {
  const input: ProgressDataInput = {
    dailyLogs: [
      {
        date: "2026-07-01",
        waterIntake: 8,
        steps: 10000,
        sleepHours: 8,
        mood: 4,
        energyLevel: 4,
      },
    ],
    reminderStates: {},
    waterGoal: 8,
    stepsGoal: 8000,
    sleepGoal: 7,
  };

  it("computes KPIs for a single day with all goals met", () => {
    const filters = {
      dateRange: {
        preset: "custom" as const,
        from: "2026-07-01",
        to: "2026-07-01",
      },
      categories: [],
      projects: [],
      taskTypes: [],
      users: [],
      teams: [],
    };

    const overview = aggregateProgress(input, filters);
    assert.equal(overview.kpis.totalTasks, 4);
    assert.equal(overview.kpis.completedTasks, 4);
    assert.equal(overview.kpis.completionRate, 100);
    assert.ok(overview.table.length > 0);
  });
});
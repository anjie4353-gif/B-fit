import { test, expect, type Page } from "@playwright/test";

async function waitForDashboardReady(page: Page) {
  await page.goto("/progress-dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#progress-main")).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole("region", { name: /key performance indicators/i })
  ).toBeVisible({ timeout: 20_000 });
}

const MOCK_SESSION = {
  state: {
    profile: {
      consentGiven: true,
      gender: "female",
      age: 28,
      weight: 62,
      height: 165,
      whatsappNumber: "+919876543210",
      activityLevel: "moderate",
      fullName: "Test User",
      pcod: { hasPcod: false },
      waterReminderSettings: {
        dailyGlasses: 8,
        wakeTime: "07:00",
        sleepTime: "22:00",
        mlPerGlass: 250,
        enabled: true,
        paused: false,
        pausedUntil: null,
      },
    },
    language: "en",
    dailyLogs: [
      {
        date: new Date().toISOString().slice(0, 10),
        waterIntake: 6,
        steps: 5000,
        sleepHours: 7,
        mood: 4,
        energyLevel: 4,
      },
    ],
    reminderStates: {},
    wellnessPlan: null,
  },
  version: 3,
};

test.describe("Progress Dashboard", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((session) => {
      localStorage.setItem("bfit-session", JSON.stringify(session));
    }, MOCK_SESSION);
  });

  test("renders KPI region for consented user", async ({ page }) => {
    await waitForDashboardReady(page);
    await expect(page.getByText("Total Tasks")).toBeVisible();
  });

  test("export controls are accessible", async ({ page }) => {
    await waitForDashboardReady(page);
    await expect(page.getByRole("button", { name: /export csv/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /export excel/i })).toBeVisible();
  });

  test("sidebar sections navigate", async ({ page }) => {
    await waitForDashboardReady(page);
    await page.getByRole("button", { name: "Weekly Progress" }).click();
    await expect(page.locator("#progress-main")).toContainText(/Planned vs Actual/i, {
      timeout: 15_000,
    });
  });
});
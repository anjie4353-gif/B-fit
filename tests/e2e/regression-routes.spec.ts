import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/language",
  "/install",
  "/onboarding",
  "/home",
  "/plan",
  "/chat",
  "/wellness",
  "/progress-dashboard",
];

test.describe("Regression: public routes load", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`GET ${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test("API /api/db/health responds", async ({ request }) => {
  const res = await request.get("/api/db/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.ok).toBe(true);
});
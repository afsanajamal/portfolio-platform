import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText("Dashboard")).toBeVisible();
});

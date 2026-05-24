import { expect, test } from "@playwright/test";

test("homepage renders through standard Vite tooling", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/SnapShades/);
  await expect(page.locator("body")).toContainText("SnapShades");
});

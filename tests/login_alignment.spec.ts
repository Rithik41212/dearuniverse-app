import { test, expect } from "@playwright/test";

test("Main login page text and buttons are center-aligned", async ({ page }) => {
  // Clear any local storage so WelcomeGate renders
  await page.addInitScript(() => {
    localStorage.clear();
  });

  await page.goto("/");

  // WelcomeGate should be visible
  const loginBtn = page.getByRole("button", { name: "Log in" });
  await expect(loginBtn).toBeVisible();

  const readingBtn = page.getByRole("button", { name: "Start my reading" });
  await expect(readingBtn).toBeVisible();

  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();

  // Check text-align is center
  const mainStyle = await page.locator(".welcome-gate main").evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      textAlign: computed.textAlign,
      alignItems: computed.alignItems,
      justifyContent: computed.justifyContent,
    };
  });

  expect(mainStyle.textAlign).toBe("center");
  expect(mainStyle.alignItems).toBe("center");

  // Take screenshot of centered login page
  await page.screenshot({ path: "test-results/login-page-centered.png" });
});

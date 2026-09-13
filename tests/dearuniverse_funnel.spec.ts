import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.request.post("/api/session");
  // Set journey to not completed, step 0, so landing funnel opens
  await page.request.put("/api/journey", { data: { step: 0, completed: false } });
  await page.addInitScript(() => {
    localStorage.setItem("astro_entry", "app");
  });
});

test("DearUniverse brand, language popup, and 3-step reading onboarding flow", async ({ page }) => {
  await page.goto("/");

  // Starts from login page, click Log in to enter space
  await page.getByRole("button", { name: "Log in" }).click();

  // Open the cosmic funnel
  await page.getByRole("button", { name: "Open Cosmic Voiceover Guide" }).click();

  // 1. Verify DearUniverse creative brand typography on landing page
  const brand = page.locator(".landing-brand");
  await expect(brand).toBeVisible();
  await expect(brand).toContainText("Dear");
  await expect(brand).toContainText("Universe");

  // 2. Verify Language Selection Popup Modal on top right
  const langTrigger = page.getByRole("button", { name: "Select language popup" });
  await expect(langTrigger).toBeVisible();
  await langTrigger.click();

  // Modal should be visible
  await expect(page.getByRole("heading", { name: "Select Language" })).toBeVisible();
  await expect(page.getByRole("button", { name: /हिन्दी/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /English/ })).toBeVisible();

  // Take screenshot of language popup
  await page.screenshot({ path: "test-results/funnel-language-popup.png" });

  // Click Hindi in the popup
  await page.getByRole("button", { name: /हिन्दी/ }).click();
  await page.getByRole("button", { name: "जारी रखें →" }).click();

  // Landing page should now reflect Hindi
  await expect(page.getByRole("button", { name: "मेरी रीडिंग शुरू करें" })).toBeVisible();

  // Switch back to English using the popup
  await langTrigger.click();
  await expect(page.getByRole("heading", { name: "भाषा का चयन करें" })).toBeVisible();
  await page.getByRole("button", { name: /English/ }).click();
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(page.getByRole("button", { name: "Start My Reading" })).toBeVisible();

  // Take screenshot of landing page with "Start My Reading" CTA
  await page.screenshot({ path: "test-results/funnel-landing.png" });

  // 3. Click "Start My Reading" to begin 3-step onboarding flow
  await page.getByRole("button", { name: "Start My Reading" }).click();

  // --- PAGE 1: Name ---
  await expect(page.getByRole("heading", { name: "What may the Universe call you?" })).toBeVisible();
  await expect(page.locator(".universe-landing")).toBeVisible();
  const nameInput = page.getByPlaceholder("Enter your full name...");
  await expect(nameInput).toBeVisible();
  await nameInput.fill("Sahil Sahu");
  await page.screenshot({ path: "test-results/flow-step1-name.png" });
  await page.getByRole("button", { name: "Continue to Date of Birth" }).click();

  // --- PAGE 2: Date of Birth ---
  await expect(page.getByRole("heading", { name: "When did your journey begin?" })).toBeVisible();
  await expect(page.locator(".universe-landing")).toBeVisible();
  const dobInput = page.locator('input[type="date"]');
  await expect(dobInput).toBeVisible();
  await dobInput.fill("1996-08-14");
  await page.screenshot({ path: "test-results/flow-step2-dob.png" });
  await page.getByRole("button", { name: "Continue to Birth Time" }).click();

  // --- PAGE 3: Time of Birth (Optional) ---
  await expect(page.getByRole("heading", { name: "Do you know your time of birth?" })).toBeVisible();
  await expect(page.locator(".universe-landing")).toBeVisible();
  // Check that the continue without time button is prominent and present
  const noTimeBtn = page.getByRole("button", { name: /Continue without birth time/ });
  await expect(noTimeBtn).toBeVisible();
  await page.screenshot({ path: "test-results/flow-step3-time.png" });

  // Continue without time
  await noTimeBtn.click();

  // --- PAGE 4: Category Page ---
  await expect(page.getByRole("heading", { name: /Welcome, Sahil Sahu ✦ Choose your reading category/ })).toBeVisible();
  await expect(page.locator(".universe-landing")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Marriage" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Love" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Career Report" })).toBeVisible();
  await page.screenshot({ path: "test-results/flow-step4-category.png" });

  // Select Marriage category to continue
  await page.getByRole("heading", { name: "Marriage" }).click();

  // Verify that it continues into the reading conversation
  await expect(page.locator(".journey-shell")).toBeVisible();
  await page.screenshot({ path: "test-results/flow-step5-reading.png" });
});

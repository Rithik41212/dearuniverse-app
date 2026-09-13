import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.request.post("/api/session");
  await page.request.put("/api/journey", { data: { completed: true } });
});

test("language switcher in hamburger menu works dynamically across Hindi, Tamil, Telugu, Bengali, and English", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Log in", exact: true }).click();

  // Wait for main screen header
  await expect(page.locator("header")).toBeVisible();

  // Open the hamburger menu
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  // Check that the slide-over menu is open
  await expect(page.getByText("Select Language")).toBeVisible();

  // Verify all 5 language buttons are present
  const hindiBtn = page.getByRole("button", { name: "हिन्दी" });
  const tamilBtn = page.getByRole("button", { name: "தமிழ்" });
  const teluguBtn = page.getByRole("button", { name: "తెలుగు" });
  const bengaliBtn = page.getByRole("button", { name: "বাংলা" });
  const englishBtn = page.getByRole("button", { name: "English" });

  await expect(hindiBtn).toBeVisible();
  await expect(tamilBtn).toBeVisible();
  await expect(teluguBtn).toBeVisible();
  await expect(bengaliBtn).toBeVisible();
  await expect(englishBtn).toBeVisible();

  // 1. Switch to Hindi
  await hindiBtn.click();
  await expect(page.getByText("भाषा चुनें")).toBeVisible();
  await expect(page.getByRole("button", { name: "मेरी जन्म कुंडली" })).toBeVisible();
  await expect(page.getByRole("button", { name: "दोष परीक्षण (मांगलिक · कालसर्प)" })).toBeVisible();
  // Bottom navigation tab should also be in Hindi
  await expect(page.locator("nav").getByRole("button", { name: "होम", exact: true })).toBeVisible();
  await expect(page.locator("nav").getByRole("button", { name: "कुंडली", exact: true })).toBeVisible();

  // Screenshot of Hindi menu
  await page.screenshot({ path: "test-results/menu-hindi.png" });

  // 2. Switch to Tamil
  await tamilBtn.click();
  await expect(page.getByText("மொழியைத் தேர்வு செய்க")).toBeVisible();
  await expect(page.getByRole("button", { name: "என் பிறப்பு ஜாதகம்", exact: true })).toBeVisible();
  await expect(page.locator("nav").getByRole("button", { name: "முகப்பு", exact: true })).toBeVisible();

  // 3. Switch to Telugu
  await teluguBtn.click();
  await expect(page.getByText("భాషను ఎంచుకోండి")).toBeVisible();
  await expect(page.getByRole("button", { name: "నా జన్మ జాతకం", exact: true })).toBeVisible();
  await expect(page.locator("nav").getByRole("button", { name: "హోమ్", exact: true })).toBeVisible();

  // 4. Switch to Bengali
  await bengaliBtn.click();
  await expect(page.getByText("ভাষা নির্বাচন করুন")).toBeVisible();
  await expect(page.getByRole("button", { name: "আমার জন্ম কুণ্ডলী", exact: true })).toBeVisible();
  await expect(page.locator("nav").getByRole("button", { name: "হোম", exact: true })).toBeVisible();

  // 5. Switch back to English
  await englishBtn.click();
  await expect(page.getByText("Select Language")).toBeVisible();
  await expect(page.getByRole("button", { name: "My birth chart", exact: true })).toBeVisible();
  await expect(page.locator("nav").getByRole("button", { name: "Home", exact: true })).toBeVisible();

  // Close menu and test Chart tab in Hindi
  await page.getByRole("button", { name: "Close menu" }).click();
  
  // Open menu again, select Hindi, and verify on Chart screen
  await menuButton.click();
  await hindiBtn.click();
  await page.getByRole("button", { name: "Close menu" }).click();

  // Click on "कुंडली" tab
  await page.locator("nav").getByRole("button", { name: "कुंडली", exact: true }).click();
  await expect(page.getByRole("heading", { name: "वैदिक लग्न कुंडली (D1)" })).toBeVisible();
  await expect(page.getByText("आत्मबल व उद्देश्य")).toBeVisible();
  await expect(page.getByText("मन व अंतर्ज्ञान")).toBeVisible();

  // Take full verification screenshot
  await page.screenshot({ path: "test-results/chart-screen-hindi.png" });
});

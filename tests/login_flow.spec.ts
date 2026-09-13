import { test, expect } from "@playwright/test";

test("Flow starts from login page, shows voice language popup with voiceover, direct detail popups, category hook voiceover, Kundli & Numerology spotlight, and hamburger voice controls", async ({ page }) => {
  // 1. Visit root URL - starts at WelcomeGate in English
  await page.goto("/");

  const loginBtn = page.getByRole("button", { name: "Log in" });
  const startReadingBtn = page.getByRole("button", { name: "Start my reading" });

  await expect(loginBtn).toBeVisible();
  await expect(startReadingBtn).toBeVisible();
  await expect(page.getByRole("heading", { name: "Some answers begin" })).toBeVisible();

  // Test top-right voice language modal on login page
  const voiceLangTrigger = page.getByRole("button", { name: "Select voice language popup" });
  await expect(voiceLangTrigger).toBeVisible();
  await voiceLangTrigger.click();

  // Modal opens for Voice Language
  await expect(page.getByRole("heading", { name: "Voice Language" })).toBeVisible();
  await page.getByRole("button", { name: /Hindi Voice/i }).click();
  await page.getByRole("button", { name: /Continue with Hindi Voice/i }).click();

  // Login page text remains English (overall UI language did NOT change)
  await expect(page.getByRole("heading", { name: "Some answers begin" })).toBeVisible();
  await expect(startReadingBtn).toBeVisible();
  await expect(voiceLangTrigger).toContainText("हिन्दी Voice");

  // Capture screenshot of login page
  await page.screenshot({ path: "test-results/flow-starts-at-login.png" });

  // 2. Click "Start my reading" -> Opens Voice Language Selection Popup with voiceover
  await startReadingBtn.click();

  // STEP 0: Voice Language Selection Popup Modal
  const langDialog = page.getByRole("dialog");
  await expect(langDialog).toBeVisible();
  await expect(page.getByRole("heading", { name: /Choose Your Language|बातचीत की भाषा चुनें/ })).toBeVisible();
  await expect(page.getByText(/Continue in English ya Hindi me baat karna pasand karenge/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Replay voice|फिर से सुनें/ })).toBeVisible();

  // Select Hindi Voice specifically to verify that UI text DOES NOT turn into Hindi!
  await page.getByRole("button", { name: /हिन्दी आवाज़ \(Hindi Voice\)/ }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/flow-step0-language-popup.png" });
  await page.getByRole("button", { name: /Continue to Enter Name/ }).click();

  // STEP 1: Name popup modal appears directly without voiceover in ENGLISH!
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What may the Universe call you?" })).toBeVisible();
  const nameInput = page.getByPlaceholder("Enter your full name...");
  await expect(nameInput).toBeVisible();

  // Capture screenshot of the Name popup modal (confirming English UI even with Hindi Voice selected)
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/flow-step1-name-popup.png" });

  // Fill in name
  await nameInput.fill("Aarav Sharma");
  await page.getByRole("button", { name: /Continue to Date of Birth/ }).click();

  // STEP 2: Date of Birth popup modal appears directly without voiceover
  await expect(page.getByRole("heading", { name: "When did your journey begin?" })).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/flow-step2-dob-popup.png" });

  // Fill in DOB
  const dobInput = page.locator('input[type="date"]');
  await dobInput.fill("1996-08-14");

  // Continue with DOB
  await page.getByRole("button", { name: /Continue to Birth Time/ }).click();

  // STEP 3: Time popup modal appears directly without voiceover
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Do you know your time of birth?" })).toBeVisible();
  const skipTimeBtn = page.getByRole("button", { name: /Continue without birth time/ });
  await expect(skipTimeBtn).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/flow-step3-time-popup.png" });

  // Click "Continue without birth time"
  await skipTimeBtn.click();

  // STEP 4: Category selection popup appears directly without voiceover
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Choose your reading category/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Marriage" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Career Report" })).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/flow-step4-category-popup.png" });

  // Select category -> Funnel starts with category voiceover hook!
  await page.getByRole("heading", { name: "Marriage" }).click();

  // STEP 5: Category voiceover hook starts playing in the funnel
  await expect(page.locator(".immersive-guide")).toBeVisible({ timeout: 10000 });
  const answerNowBtn = page.getByRole("button", { name: /Answer Now|विकल्प देखें/ });
  await expect(answerNowBtn).toBeVisible({ timeout: 10000 });

  // Capture screenshot of the Category voiceover speaking stage
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/flow-step5-category-funnel-voiceover.png" });

  // Click Answer Now to view the intention choices for Marriage in English
  await answerNowBtn.click();
  await expect(page.getByRole("heading", { name: /What would make marriage feel right for you/ })).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/flow-step5-category-funnel-options.png" });

  // Click one of the intention choices -> proceeds to Step 3
  await page.getByRole("button", { name: /Feeling ready/ }).click();

  // At Step 3, the voiceover speaks the reflection prompt; click Answer Now to open the form
  const answerNowBtn3 = page.getByRole("button", { name: /Answer Now|विकल्प देखें/ });
  await expect(answerNowBtn3).toBeVisible({ timeout: 10000 });
  await answerNowBtn3.click();

  // Step 3: Question & context form
  await expect(page.getByRole("heading", { name: /A little more about you/ })).toBeVisible();
  const revealReadingBtn = page.getByRole("button", { name: /Reveal my reading/ });
  await expect(revealReadingBtn).toBeVisible();
  await revealReadingBtn.click();

  // Verify transitional inspiring speech banner in the funnel before Kundli
  await expect(page.getByText(/आपकी जन्म कुंडली और शुभ अंकों के आधार पर|Preparing your Vedic Kundli and sacred numbers/).first()).toBeVisible({ timeout: 6000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/flow-step6-prekundli-transitional-narration.png" });

  // STEP 7: Kundli Spotlight appears!
  await expect(page.locator(".discovery-screen")).toBeVisible({ timeout: 25000 });
  await expect(page.getByText(/Benefits of Your Kundli/i)).toBeVisible();
  await expect(page.getByText("True Compatibility")).toBeVisible();
  await expect(page.getByText("Confident Decisions")).toBeVisible();
  await expect(page.getByText("Mutual Growth")).toBeVisible();
  await expect(page.getByText(/Guide is explaining your Kundli benefits|Auto-advancing to Numerology/i)).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/flow-step7-kundli-spotlight.png" });

  // Fast forward or let auto-advance transition to Step 8: Numerology Breakdown
  const exploreNumbersBtn = page.getByRole("button", { name: "Explore Numbers Now ⚡" });
  await exploreNumbersBtn.click();

  // STEP 8: Numerology Breakdown
  await expect(page.getByText(/Benefits of Your Numbers/i)).toBeVisible({ timeout: 8000 });
  await expect(page.getByText("Emotional Ease")).toBeVisible();
  await expect(page.getByText("Lasting Stability")).toBeVisible();
  await expect(page.getByText("Clear Love")).toBeVisible();
  await expect(page.getByText(/Guide is explaining your Numerology benefits|Auto-advancing to Full Report/i)).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/flow-step8-numerology-breakdown.png" });

  // Fast forward or let auto-advance transition to Step 4: Full Report Ready with Key Challenges & Solutions
  const viewReportBtn = page.getByRole("button", { name: "View Full Report Now ⚡" });
  await viewReportBtn.click();

  // Step 4 opens immediately with the personalized report and voiceover explaining key challenges & solutions
  await expect(page.getByText(/Your Personalized Marriage Report Is Ready|आपकी Marriage ज्योतिषीय रिपोर्ट तैयार है/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Key Challenges & Cosmic Solutions", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Balancing Family Advice with Personal Pace/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Opening Up About Everyday Priorities/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Staying True to Your Personal Freedom/ })).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/flow-step4-challenges-and-solutions.png" });

  // Continue to Step 5: Begin reading
  await page.getByRole("button", { name: /Begin my reading/ }).click();
  const answerNowBtn5 = page.getByRole("button", { name: /Answer Now|विकल्प देखें/ });
  await expect(answerNowBtn5).toBeVisible({ timeout: 10000 });
  await answerNowBtn5.click();

  await expect(page.getByText("Personalized Vedic & Numerology Guidance")).toBeVisible({ timeout: 8000 });

  // Verify NO mention of "AI" or negative disclaimers anywhere in the rendered reading or UI
  const bodyText = await page.innerText("body");
  expect(bodyText).not.toMatch(/\bAI\b/);
  expect(bodyText).not.toMatch(/guarantee/i);
  expect(bodyText).not.toMatch(/uncertain/i);
  expect(bodyText).not.toMatch(/koi gurantee/i);
  expect(bodyText).not.toMatch(/गारंटी/);
  expect(bodyText).not.toMatch(/Personalized with AI/i);

  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/flow-step5-reading-chapter.png" });

  // 3. Test Log in button path and hamburger menu voice controls
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
  await page.getByRole("button", { name: "Log in" }).click();

  // Enters app dashboard
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();

  // Verify Voice Language selector in hamburger menu
  await expect(page.getByText("Voice Language", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "English Voice" })).toBeVisible();
  await expect(page.getByRole("button", { name: "हिन्दी आवाज़" })).toBeVisible();

  // Verify Overall App Language selector in hamburger menu
  await expect(page.getByRole("button", { name: "हिन्दी", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "English", exact: true })).toBeVisible();

  // Scroll Voice Language selector into view and capture screenshot
  await page.getByText("Voice Language", { exact: false }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/flow-hamburger-voice-controls.png" });

  // Test Log out / return to login page
  const logoutBtn = page.getByRole("button", { name: /Log out \/ Return to login/ });
  await expect(logoutBtn).toBeVisible();
  await logoutBtn.click();

  // Back on login page
  await expect(page.getByRole("button", { name: "Start my reading" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
});

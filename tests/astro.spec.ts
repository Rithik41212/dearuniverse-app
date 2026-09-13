import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.request.post('/api/session');
  await page.request.put('/api/journey', { data: { completed: true } });
});

async function menu(page: Page, label: string) {
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("button", { name: label, exact: true }).click();
}

async function openApp(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
}

async function addProfile(page: Page, name: string, date: string) {
  await menu(page, "Add a profile");
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Date of birth").fill(date);
  await page.getByLabel("Local birth time").fill("09:42");
  await page.getByLabel("Birthplace", { exact: true }).fill("Jaipur");
  await page.getByRole("button", { name: "Find birthplace" }).click();
  await page.getByRole("button", { name: "Jaipur, India", exact: true }).click();
  await page.getByRole("button", { name: "Save birth profile" }).click();
  await expect(page.locator("header")).toContainText(name);
}

test.afterEach(async ({ page }) => {
  const response = await page.request.get("/api/profiles");
  if (response.ok()) for (const profile of await response.json()) await page.request.delete(`/api/profiles/${profile.id}`);
});

test("saved birth details drive both charts, dashas, daily forecast and compatibility", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await openApp(page);
  await addProfile(page, "Integration One", "1996-08-14");
  await page.getByRole("button", { name: "Chart", exact: true }).click();
  await expect(page.getByText("Sun in Cancer", { exact: true })).toBeVisible();
  await menu(page, "My birth chart");
  await page.getByLabel("Astrology system").selectOption("western");
  await expect(page.getByText("Sun in Leo", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Dashas", exact: true }).click();
  await expect(page.getByText("Current Vimshottari period")).toBeVisible();
  await page.getByRole("button", { name: "Kundali", exact: true }).click();
  await expect(page.getByRole("heading", { name: "D9 · Navamsa" })).toBeVisible();
  await page.getByRole("button", { name: "Daily forecast", exact: true }).click();
  await expect(page.getByText(/orb \d/).first()).toBeVisible({ timeout: 60000 });
  await page.screenshot({ path: "test-results/astro-forecast.png" });
  await addProfile(page, "Integration Two", "1997-05-20");
  await menu(page, "Synastry & compatibility");
  const options = page.getByLabel("Partner profile").locator("option");
  await page.getByLabel("Partner profile").selectOption({ label: "Integration One" });
  await page.getByRole("button", { name: "Compare birth charts" }).click();
  await expect(page.getByText(/\/ 36 traditional matching points/)).toBeVisible();
  await expect(page.getByText("Graha Maitri", { exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/astro-compatibility.png" });
  expect(errors).toEqual([]);
});

test("unknown birth time presents uncertainty without fabricated chart degrees", async ({ page }) => {
  await openApp(page);
  await menu(page, "Add a profile");
  await page.getByLabel("Name", { exact: true }).fill("Unknown time");
  await page.getByLabel("Date of birth").fill("2000-01-01");
  await page.getByLabel("Birth time accuracy").selectOption("unknown");
  await expect(page.getByLabel("Local birth time")).toHaveCount(0);
  await page.getByLabel("Birthplace", { exact: true }).fill("Mumbai");
  await page.getByRole("button", { name: "Find birthplace" }).click();
  await page.getByRole("button", { name: "Mumbai, India", exact: true }).click();
  await page.getByRole("button", { name: "Save birth profile" }).click();
  await expect(page.locator("header")).toContainText("Unknown time");
  await menu(page, "My birth chart");
  await expect(page.getByText("Exact chart positions need a recorded birth time")).toBeVisible();
  await page.getByRole("button", { name: "Dashas", exact: true }).click();
  await expect(page.getByText("An exact birth time is needed for reliable dasha dates.")).toBeVisible();
});

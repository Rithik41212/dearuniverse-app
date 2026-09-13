import { test, expect } from "@playwright/test";

async function openApp(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
}

test("mobile navigation, straight zodiac deck and rotating backgrounds", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: "Signs", exact: true }).click();
  const front = page.getByRole("button", { name: "Open Aries reading" });
  await expect(front).toBeVisible();
  await front.hover(); await page.mouse.wheel(0, 250);
  await expect(front).toBeVisible();
  const transforms = await page.locator("[inert]").evaluateAll((els) => els.map((el) => {
    const style = getComputedStyle(el);
    return { filter: style.filter, opacity: style.opacity, rotated: Math.abs(new DOMMatrix(style.transform).b) > .001 };
  }));
  expect(transforms.every((style) => style.filter === "none" && style.opacity === "1" && !style.rotated)).toBeTruthy();
  await page.getByRole("button", { name: "Next sign", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open Taurus reading" })).toBeVisible();
  const previous = await page.locator(".temple-image.is-active").getAttribute("src");
  await page.getByRole("button", { name: "Palm", exact: true }).click();
  await expect(page.getByRole("button", { name: "Scan my palm" })).toBeInViewport();
  const tabs = await page.locator("nav button").all();
  await expect(tabs[tabs.length - 1]).toHaveAttribute("aria-label", "Palm");
  expect(await page.locator(".temple-image.is-active").getAttribute("src")).not.toBe(previous);
  const next = await page.locator(".temple-image.is-active").getAttribute("src");
  await expect.poll(() => page.locator(".temple-image.is-active").getAttribute("src"), { timeout: 11000 }).not.toBe(next);
  await page.screenshot({ path: "test-results/palm-mobile.png" });
  await page.setViewportSize({ width: 320, height: 568 });
  await expect(page.getByRole("button", { name: "Scan my palm" })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("camera denial offers photo fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", { value: async () => { throw new DOMException("Denied", "NotAllowedError"); } });
  });
  await openApp(page); await page.getByRole("button", { name: "Palm", exact: true }).click();
  await page.getByRole("button", { name: "Scan my palm" }).click();
  await expect(page.getByRole("alert")).toContainText("Camera permission was blocked");
  await expect(page.getByRole("button", { name: "Choose a palm photo" })).toBeEnabled();
});

test("real local palm model traces a sample photo and rejects non-hands", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openApp(page); await page.getByRole("button", { name: "Palm", exact: true }).click();
  // Pad the upstream close-up so all detected landmarks fit inside the frame.
  const padded = await page.evaluate(async () => {
    const img = new Image(); img.src = "/tests/fixtures/palm-example2.png"; await img.decode();
    const canvas = document.createElement("canvas"); canvas.width = 640; canvas.height = 640;
    const ctx = canvas.getContext("2d")!; ctx.fillStyle = "#171410"; ctx.fillRect(0, 0, 640, 640);
    ctx.drawImage(img, 64, 64, 512, 512); return canvas.toDataURL("image/png").split(",")[1];
  });
  await page.getByLabel("Choose a palm photo", { exact: true }).setInputFiles({ name: "palm.png", mimeType: "image/png", buffer: Buffer.from(padded, "base64") });
  await expect(page.getByRole("heading", { name: "Your palm map" }).or(page.getByRole("alert"))).toBeVisible({ timeout: 90000 });
  expect(await page.getByRole("alert").allTextContents()).toEqual([]);
  await expect(page.getByRole("heading", { name: "Your palm map" })).toBeVisible({ timeout: 90000 });
  await expect(page.getByText(/of 3 lines traced/)).toBeVisible();
  await page.screenshot({ path: "test-results/palm-result.png" });
  await page.getByRole("button", { name: "Hide detected lines" }).click();
  await expect(page.getByAltText("Detected palm creases")).toHaveCount(0);
  await page.getByRole("button", { name: "Scan again" }).click();
  await page.getByLabel("Choose a palm photo", { exact: true }).setInputFiles("src/templeimages/1.png");
  await expect(page.getByRole("alert")).toContainText("No hand found", { timeout: 30000 });
  expect(errors).toEqual([]);
});

import { test, expect } from "@playwright/test";

test("camera tracks stop on cancel and tab navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const streams: MediaStream[] = [];
    Object.assign(window, { testStreams: streams });
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", { value: async () => {
      const canvas = document.createElement("canvas"); canvas.width = 320; canvas.height = 320;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#c39159"; ctx.fillRect(0, 0, 320, 320);
      const stream = canvas.captureStream(10); streams.push(stream);
      return stream;
    } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.getByRole("button", { name: "Palm", exact: true }).click();
  await page.getByRole("button", { name: "Scan my palm" }).click();
  await expect(page.getByRole("button", { name: "Capture & read palm" })).toBeEnabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { testStreams: MediaStream[] }).testStreams.every((stream) => stream.getTracks().every((track) => track.readyState === "ended")))).toBeTruthy();
  await page.getByRole("button", { name: "Scan my palm" }).click();
  await expect(page.getByRole("button", { name: "Capture & read palm" })).toBeEnabled();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { testStreams: MediaStream[] }).testStreams.every((stream) => stream.getTracks().every((track) => track.readyState === "ended")))).toBeTruthy();
});

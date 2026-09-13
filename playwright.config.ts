import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: { command: "npm.cmd run dev -- --host 127.0.0.1 --port 8443", url: "http://127.0.0.1:8443", reuseExistingServer: true },
  testDir: "./tests", timeout: 120_000, workers: 1,
  use: { baseURL: "http://127.0.0.1:8443", viewport: { width: 390, height: 844 },
    launchOptions: { channel: "msedge" } },
});

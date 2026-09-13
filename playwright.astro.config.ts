import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testMatch: /astro\.spec\.ts/,
  webServer: [
    { command: "npm.cmd run dev -- --host 127.0.0.1 --port 8443", url: "http://127.0.0.1:8443", reuseExistingServer: true },
    { command: "npm.cmd run backend", url: "http://127.0.0.1:8000/api/health", reuseExistingServer: true, timeout: 60000 },
  ],
});

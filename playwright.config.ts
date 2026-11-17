import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/mobile",
  timeout: 45000,
  workers: 1,
  reporter: "list",
  use: { baseURL: process.env.PREVIEW_URL || "http://localhost:8443", trace: "retain-on-failure" },
  projects: [
    { name: "Android Chrome", use: { ...devices["Pixel 7"], browserName: "chromium" } },
    { name: "iPhone Safari", use: { ...devices["iPhone 13"], browserName: "webkit" } },
  ],
});

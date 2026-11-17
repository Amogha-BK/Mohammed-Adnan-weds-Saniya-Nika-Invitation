import { test, expect } from "@playwright/test";

test("opening defers heavy media; a tap starts sound and the invitation stays usable", async ({ page }) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/", { waitUntil: "networkidle" });
  expect(requests.some((url) => /\.(mp3|mp4)(?:\?|$)/.test(url))).toBe(false);
  expect(requests.some((url) => url.includes("muslim-couple"))).toBe(false);
  await page.getByRole("button", { name: "Tap to open", exact: true }).tap();
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => !audio.paused && audio.currentTime > 0)).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 35000 });
  await expect(page.locator(".video-opening")).toHaveCount(0, { timeout: 35000 });
  await page.getByRole("button", { name: "Pause music", exact: true }).tap();
  await expect(page.getByRole("button", { name: "Play music", exact: true })).toBeVisible();
  expect(await page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
  await page.getByRole("button", { name: "Play music", exact: true }).tap();
  await expect(page.getByRole("button", { name: "Pause music", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mute music", exact: true }).tap();
  expect(await page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.muted)).toBe(true);
  await page.getByRole("button", { name: "Unmute music", exact: true }).tap();
  await expect(page.locator(".wedding-function-card")).toHaveCount(4);
  await expect(page.locator("#haldi time")).toHaveAttribute("datetime", "2026-12-04T17:00:00+05:30");
  await expect(page.locator("#wedding time")).toHaveAttribute("datetime", "2026-12-05T13:00:00+05:30");
  await expect(page.locator("#reception time")).toHaveAttribute("datetime", "2026-12-06T19:00:00+05:30");
  await page.getByRole("button", { name: "Reveal the date", exact: true }).tap();
  await expect(page.locator(".scratch-revealed-text")).toContainText("5 & 6 December 2026");
  for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("a failed video still opens the invitation and starts music", async ({ page }) => {
  await page.route("**/envelope-opening-mobile-v1.mp4", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Tap to open", exact: true }).tap();
  // WebKit may wait for the opening watchdog instead of emitting a media error.
  await expect(page.locator(".video-opening")).toHaveCount(0, { timeout: 12000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => !audio.paused && audio.currentTime > 0)).toBe(true);
});

test("reduced motion skips the video without downloading it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const videoRequests: string[] = [];
  page.on("request", (request) => { if (request.url().includes(".mp4")) videoRequests.push(request.url()); });
  await page.goto("/");
  await page.getByRole("button", { name: "Tap to open", exact: true }).tap();
  await expect(page.locator(".video-opening")).toHaveCount(0);
  expect(videoRequests).toEqual([]);
});

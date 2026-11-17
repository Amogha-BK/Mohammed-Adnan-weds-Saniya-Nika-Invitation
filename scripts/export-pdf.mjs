import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium } from "@playwright/test";

const output = path.resolve("output");
await mkdir(path.join(output, "pdf-preview"), { recursive: true });
const server = await createServer({ server: { host: "127.0.0.1", port: 0, strictPort: false, open: false } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1200 }, reducedMotion: "reduce" });
  await page.route(/\.(?:mp3|mp4)(?:\?|$)/, (route) => route.abort());
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Tap to open", exact: true }).click();
  await page.locator(".video-opening").waitFor({ state: "detached", timeout: 15000 });
  await page.getByRole("button", { name: "Reveal the date", exact: true }).click();
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((image) => { image.loading = "eager"; });
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
    await document.fonts.ready;
    const main = document.querySelector("main");
    const groups = [
      [".hero"],
      [".family-section", ".countdown-section"],
      [".celebrations-section"],
      [".venue-section", "footer"],
    ];
    for (const selectors of groups) {
      const sheet = document.createElement("article");
      sheet.className = "pdf-page";
      for (const selector of selectors) sheet.append(document.querySelector(selector));
      main.append(sheet);
    }
    document.querySelector(".countdown-panel")?.remove();
    document.querySelectorAll(".site-nav, .music-controls, .skip-to-content, .hero-scroll-cue, .closing-navigation, .scratch-actions-row, .sparkle-field").forEach((element) => element.remove());
    document.querySelector(".hero .button")?.remove();
  });
  await page.addStyleTag({ content: `
    @page { size: A4; margin: 0; }
    html, body, #root, .invitation, main { margin: 0 !important; padding: 0 !important; width: 210mm !important; min-width: 0 !important; background: #fcf3df !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; animation: none !important; transition: none !important; }
    main *, main *::before, main *::after { opacity: 1 !important; }
    .pdf-page { position: relative; width: 210mm; height: 297mm; padding: 10mm; break-after: page; box-sizing: border-box; background: #fcf3df; }
    .pdf-page:last-child { break-after: auto; }
    .hero, .family-section, .countdown-section, .celebrations-section, .venue-section, footer { width: 100% !important; margin: 0 !important; transform: none !important; }
    .section-heading h2 { font-size: 40px !important; line-height: 1.1 !important; }
    .section-heading > span { font-size: 10px !important; }
    .hero { height: 277mm; min-height: 0 !important; padding: 20px 20px 24px !important; border: 1px solid #cbb17a; border-radius: 8px; }
    .hero-editorial-topline { padding: 12px 0 !important; }
    .hero-editorial-topline span { font-size: 11px !important; }
    .hero-editorial-grid { display: flex !important; flex-direction: column; align-items: center; padding: 12px 0 !important; gap: 14px !important; }
    .hero-portrait-column { width: 330px; padding: 17px 20px 14px !important; }
    .hero-portrait-caption { font-size: 23px !important; line-height: 1.2 !important; }
    .hero-couple { width: 220px !important; }
    .hero-art-caption { display: none !important; }
    .cinematic-hero .hero-inner { padding: 0 !important; text-align: center; }
    .cinematic-hero .nikah-invocation { margin-bottom: 6px !important; font-size: 20px !important; }
    .cinematic-hero h1 { margin: 12px auto !important; font-size: 72px !important; line-height: 1.02 !important; gap: 0 !important; }
    .cinematic-hero h1 .hero-ampersand { font-size: 30px !important; margin: 0 !important; padding: 0 !important; }
    .cinematic-hero .hero-invitation-line { font-size: 20px !important; line-height: 1.35; margin: 0 auto !important; max-width: 510px; }
    .cinematic-hero .hero-date { margin: 12px auto !important; justify-content: center !important; gap: 10px; }
    .cinematic-hero .hero-date time { font-size: 23px !important; }
    .cinematic-hero .hero-date span { font-size: 12px !important; }
    .cinematic-hero .hero-footnote { margin: 8px auto 0 !important; font-size: 17px !important; }
    .family-section { padding: 120px 36px 20px !important; min-height: 0 !important; }
    .family-section::before { top: 24px !important; width: 65px !important; height: 65px !important; left: calc(50% - 32.5px) !important; }
    .family-section .family-memory { font-size: 18px !important; padding: 12px !important; line-height: 1.35; }
    .family-section p { font-size: 15px !important; line-height: 1.5 !important; }
    .family-section .invitation-families { display: grid !important; grid-template-columns: 1fr auto 1fr !important; padding: 18px 0 !important; margin-top: 8px !important; gap: 12px !important; }
    .family-section .invitation-families > div { padding: 20px 12px !important; }
    .family-section .invitation-families h2 { font-size: 35px !important; }
    .family-section .invitation-families p { font-size: 14px !important; }
    .family-section .invitation-regards { padding-top: 14px !important; }
    .family-section .invitation-regards h3 { font-size: 12px !important; }
    .family-section .monogram { display: none !important; }
    .countdown-section { display: block !important; padding: 20px 30px 0 !important; }
    .date-keepsake .section-heading { margin-bottom: 12px !important; }
    .date-keepsake .section-heading h2 { font-size: 32px !important; }
    .scratch-card-box { height: 210px !important; max-width: 470px !important; margin: auto; }
    .scratch-couple-names { font-size: 28px !important; }
    .scratch-venue-city { font-size: 13px !important; }
    .celebrations-section { padding: 15px 0 0 !important; }
    .celebrations-section .section-heading h2 { font-size: 37px !important; }
    .section-intro { font-size: 13px !important; line-height: 1.5 !important; margin: 8px auto 14px !important; max-width: 620px !important; }
    .events { grid-template-columns: 1fr 1fr !important; max-width: none !important; margin: 0 !important; gap: 14px !important; }
    .wedding-function-card { min-height: 0 !important; height: 420px; border-radius: 6px !important; transform: none !important; }
    .wedding-function-card .function-card-heading { min-height: 130px !important; padding: 58px 10px 12px !important; }
    .wedding-function-card .function-card-heading h3 { font-size: 28px !important; margin-top: 6px !important; }
    .wedding-function-card .function-card-event-badge { font-size: 8px !important; }
    .wedding-function-card .function-card-subtitle { font-size: 16px !important; margin-top: 4px !important; }
    .wedding-function-card .function-card-details { padding: 5px 14px 0 !important; }
    .wedding-function-card .function-card-date-line { font-size: 11px !important; margin: 0 0 5px !important; }
    .wedding-function-card .function-card-time { font-size: 12px !important; padding: 4px 10px !important; margin: 0 auto 6px !important; }
    .wedding-function-card .function-card-time svg { width: 14px; }
    .wedding-function-card .function-card-venue-block { padding-top: 8px !important; margin-top: 4px !important; }
    .wedding-function-card .function-card-venue-block > svg { display: none !important; }
    .wedding-function-card .function-card-venue-block h4 { font-size: 20px !important; line-height: 1.1 !important; margin: 0 0 4px !important; }
    .wedding-function-card .function-card-venue-block p { font-size: 10px !important; line-height: 1.4 !important; }
    .wedding-function-card .event-description { font-size: 12px !important; line-height: 1.35 !important; min-height: 0 !important; margin: 7px 0 !important; }
    .wedding-function-card .event-actions { padding-top: 0 !important; margin-top: 0 !important; }
    .wedding-function-card .event-actions .button { font-size: 10px !important; padding: 5px 10px !important; min-height: 0 !important; }
    .calendar-link { display: none !important; }
    .ceremony-footer-art { height: 42px !important; margin-top: auto; }
    .venue-section { display: grid !important; grid-template-columns: .85fr 1.15fr !important; min-height: 0 !important; height: 360px; padding: 0 !important; }
    .venue-artwork { min-height: 0 !important; height: 360px !important; }
    .venue-content { padding: 20px !important; }
    .venue-content .section-heading h2 { font-size: 34px !important; }
    .venue-content h3 { font-size: 29px !important; margin: 10px 0 !important; }
    .venue-content p { font-size: 14px !important; }
    .venue-content .button { font-size: 12px !important; padding: 8px 12px !important; margin-top: 12px !important; }
    footer { padding: 30px 18px 20px !important; }
    .closing-copy { padding: 22px !important; }
    footer .monogram { width: 70px !important; height: 70px !important; font-size: 22px !important; margin-bottom: 12px !important; }
    footer .section-heading h2 { font-size: 38px !important; }
    .closing-message { font-size: 20px !important; line-height: 1.8 !important; max-width: 580px; margin: 12px auto !important; }
    .contact-numbers { justify-content: center !important; flex-wrap: wrap; gap: 12px !important; }
    .contact-number { font-size: 15px !important; }
    .closing-note { font-size: 23px !important; }
    .closing-rule { margin-block: 18px !important; }
    .cinematic-hero .hero-date { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center; gap: 3px !important; }
    .family-section { padding-top: 105px !important; }
    .family-section::before { white-space: nowrap; font-size: 22px !important; }
    .family-section .botanical-rule { margin: 12px auto !important; }
    .family-section .section-heading { margin-bottom: 12px !important; }
    .countdown-section { padding: 14px 16px 0 !important; background: none !important; border: 0 !important; box-shadow: none !important; }
    .date-keepsake { padding: 0 !important; margin: 0 !important; min-height: 0 !important; border: 0 !important; background: none !important; box-shadow: none !important; }
    .date-keepsake::before, .date-keepsake::after, .date-keepsake .section-heading > span, .date-keepsake .botanical-rule { display: none !important; }
    .date-keepsake .section-heading { margin: 0 0 8px !important; }
    .date-keepsake .section-heading h2 { font-size: 28px !important; }
    .venue-section, .venue-artwork { height: 400px !important; }
    .venue-content .botanical-rule { margin: 12px auto !important; }
  ` });
  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
  await page.evaluate(() => document.fonts.ready);
  const sheets = page.locator(".pdf-page");
  for (let i = 0; i < await sheets.count(); i++) {
    await sheets.nth(i).screenshot({ path: path.join(output, "pdf-preview", `page-${i + 1}.png`) });
  }
  const sizing = await sheets.evaluateAll((elements) => elements.map((element) => ({ height: element.clientHeight, content: element.scrollHeight })));
  console.log("Page fit:", JSON.stringify(sizing));
  assert.ok(sizing.every((sheet) => sheet.content <= sheet.height + 1), "Invitation content must fit within every PDF page");
  const text = await page.locator("main").innerText();
  for (const required of ["Mo. Adnan", "Saniya", "Shabnam", "Amna", "Mohammed Anas", "Sujangarh", "Ladnun", "5 & 6", "8:00 p.m.", "8890085006", "9950955176"]) assert.ok(text.includes(required), `Missing ${required}`);
  const file = path.join(output, "Mo-Adnan-and-Saniya-Wedding-Invitation.pdf");
  const pdf = await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true, tagged: true });
  const pageCount = (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  assert.equal(pageCount, 4, "Expected four complete pages");
  await writeFile(path.join(output, "pdf-preview", "invitation-text.txt"), text);
  console.log(JSON.stringify({ file, pages: pageCount, bytes: pdf.length }));
} finally {
  await browser?.close();
  await server.close();
}

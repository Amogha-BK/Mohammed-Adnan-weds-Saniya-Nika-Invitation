import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import ts from "typescript";
import { chromium } from "@playwright/test";

const source = await readFile("src/invitationConfig.ts", "utf8");
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { invitationConfig: config } = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
const escape = (text) => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const embed = async (file, mime) => `data:${mime};base64,${(await readFile(file)).toString("base64")}`;
const [portrait, floral, bodyFont, displayFont, scriptFont] = await Promise.all([
  embed("public/assets/muslim-couple-v1.webp", "image/webp"),
  embed("public/assets/muslim-nikah-v1.webp", "image/webp"),
  embed("public/assets/fonts/manrope-normal-latin.woff2", "font/woff2"),
  embed("public/assets/fonts/cormorant-garamond-normal-latin.woff2", "font/woff2"),
  embed("public/assets/fonts/great-vibes-normal-latin.woff2", "font/woff2"),
]);
const date = (start, options) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", ...options }).format(new Date(start));
const clock = (start) => new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(start)).replace(" PM", " p.m.").replace(" AM", " a.m.");
const nikah = config.celebrations.find((event) => event.id === "wedding");
const walima = config.celebrations.find((event) => event.id === "reception");
const hosts = config.hosts.split(" · ");
const schedule = config.celebrations.map((event) => `
  <article class="event-row">
    <div class="event-date"><strong>${date(event.start, { day: "2-digit" })}</strong><span>DECEMBER</span><small>${date(event.start, { weekday: "long" })}</small></div>
    <div class="event-details"><h3>${escape(event.shortName)}</h3><p>${event.id === "wedding" ? "Sujangarh" : "Royal Vardhman Guest House, Ladnun"}</p>${event.id === "wedding" ? '<p class="barat-note">Barat Sujangarh jayegi.</p>' : ""}</div>
    <div class="event-time">${clock(event.start)}<span>IST</span></div>
  </article>`).join("");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Mo. Adnan & Saniya — Wedding Invitation</title><style>
@font-face{font-family:Body;src:url('${bodyFont}') format('woff2');font-weight:400 800;font-display:block}
@font-face{font-family:Display;src:url('${displayFont}') format('woff2');font-weight:500 700;font-display:block}
@font-face{font-family:Script;src:url('${scriptFont}') format('woff2');font-display:block}
@page{size:A4;margin:0}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{margin:0;background:#ece7df;color:#483327;font-family:Body,Arial,sans-serif;font-size:17px;line-height:1.5}
.sheet{width:210mm;height:297mm;position:relative;padding:54px 55px 40px;background:#fffbf3;break-after:page}
.sheet:last-child{break-after:auto}
.sheet::before{content:'';position:absolute;inset:18px;border:1px solid #bc985d;pointer-events:none}
.sheet::after{content:'';position:absolute;inset:23px;border:1px solid #e4d3b4;pointer-events:none}
h1,h2,h3,p{margin:0}a{color:inherit;text-decoration:none}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#8a6737}
.ornament{display:flex;align-items:center;justify-content:center;gap:15px;color:#a37d42;margin:17px auto;font:24px Display}
.ornament::before,.ornament::after{content:'';width:80px;height:1px;background:#cbb17b}
.top-floral{position:absolute;top:24px;left:24px;right:24px;height:138px;background:url('${floral}') center top/100% auto no-repeat;opacity:.32;mask-image:linear-gradient(#000,transparent);pointer-events:none}
.invitation-head{text-align:center;position:relative}
.bismillah{font:23px/1.5 Georgia,serif;margin:0 0 4px}
.invitation-head .roman{font-size:13px;color:#71553d}
.invitation-head .eyebrow{margin-top:20px}
.couple-block{display:grid;grid-template-columns:270px 1fr;gap:24px;align-items:center;margin:30px 0 25px}
.portrait-frame{height:398px;position:relative;border:1px solid #c8a66b;border-radius:49% 49% 5px 5px / 28% 28% 5px 5px;background:linear-gradient(#fcf0d9,#fff8e9);padding:28px 13px 8px}
.portrait-frame::before{content:'';position:absolute;inset:8px;border:1px solid #dec797;border-radius:inherit}
.portrait-frame img{position:relative;display:block;width:100%;height:100%;object-fit:contain;object-position:center bottom}
.couple-names{text-align:center}
.couple-names h1,.bride-name{font:70px/1.16 Script,cursive;color:#673e2b}
.couple-names .parents{font-size:16px;line-height:1.7;margin:10px 0 0}
.parents .relationship{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#87643d;margin-bottom:3px}
.amp{font:36px/1 Display,serif;color:#aa8148;margin:16px 0 10px}
.invite-copy{max-width:595px;text-align:center;margin:0 auto;font-size:18px;line-height:1.75}
.save-heading{text-align:center;margin-top:26px}
.save-heading h2{font:600 33px/1.2 Display,serif;color:#673e2b}
.save-heading p{margin-top:4px;font-size:14px;color:#71553d}
.main-dates{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}
.date-box{text-align:center;padding:17px 13px 19px;border:1px solid #d9c19a;border-top:3px solid #9e7844;border-radius:5px;background:#fbf2e3}
.date-box h3{font:600 26px/1.2 Display,serif;color:#693f2c;margin-bottom:9px}
.date-box .day{font-size:21px;font-weight:700;line-height:1.35}
.date-box .time{font-size:17px;font-weight:600;margin:4px 0}
.date-box .city{font-size:19px;font-weight:600;color:#763e46;margin-top:7px}
.blessing{text-align:center;font:500 19px/1.5 Display,serif;margin-top:23px;color:#705439}
.footline{position:absolute;bottom:34px;left:55px;right:55px;text-align:center;font-size:12px;color:#8a6b45;letter-spacing:.04em}
.programme-head{text-align:center;margin-bottom:21px}
.programme-head h2{font:600 47px/1.1 Display,serif;color:#673e2b;margin:7px 0 4px}
.programme-head .subtitle{font-size:15px}
.programme-head .ornament{margin:13px auto 0}
.schedule{display:grid;gap:12px}
.event-row{display:grid;grid-template-columns:97px 1fr 120px;gap:16px;align-items:center;min-height:108px;padding:13px 12px;border:1px solid #dfcdae;border-radius:5px;background:#fffdf9}
.event-date{text-align:center;border-right:1px solid #dfcdae;padding-right:12px}
.event-date strong{display:block;font:600 39px/1 Display,serif;color:#773f47}
.event-date span{display:block;font-size:10px;letter-spacing:.1em;font-weight:700;margin-top:4px}
.event-date small{display:block;font-size:11px;margin-top:2px}
.event-details h3{font:600 27px/1.1 Display,serif;margin-bottom:6px;color:#603d2d}
.event-details p{font-size:15px;line-height:1.5}
.event-details .barat-note{font-size:13px;color:#74543b;margin-top:3px}
.event-time{text-align:center;color:#673e2b;background:#f7ecd8;border-radius:4px;padding:10px 4px;font-size:18px;font-weight:800;white-space:nowrap}
.event-time span{display:block;font-size:10px;letter-spacing:.12em;margin-top:2px;font-weight:600}
.venue-box{margin-top:22px;padding:15px 20px;border-left:3px solid #a98248;background:#f7efdf}
.venue-box h3{font:600 25px/1.15 Display,serif;margin-bottom:5px}
.venue-box p{font-size:16px;line-height:1.65}
.venue-link{display:inline-block;font-size:12px;font-weight:700;border-bottom:1px solid #b3925c;margin-top:5px}
.regards{margin-top:22px;text-align:center}
.regards h3{font:600 28px/1.2 Display,serif;margin-bottom:12px;color:#673e2b}
.hosts{display:grid;grid-template-columns:1fr 1fr;gap:5px 18px;text-align:left;max-width:605px;margin:auto;font-size:17px;font-weight:500;line-height:1.65}
.contacts{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;border-top:1px solid #ddc8a3;margin-top:18px;padding-top:14px;text-align:center}
.contacts a{font-size:15px;font-weight:800;white-space:nowrap}
.contact-label{text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:.16em;font-weight:700;margin-top:16px;color:#88673b}
.closing{text-align:center;font:500 22px/1.4 Display,serif;margin-top:23px;color:#73513a}
.sheet+.sheet{padding-top:44px}
.programme-head{margin-bottom:16px}
.event-row{min-height:98px;padding-top:10px;padding-bottom:10px}
.venue-box{margin-top:16px;padding-top:12px;padding-bottom:12px}
.regards{margin-top:16px}
.regards h3{margin-bottom:8px}
.hosts{line-height:1.45}
.contact-label{margin-top:12px}
.contacts{margin-top:12px;padding-top:10px}
.closing{margin-top:15px}
</style></head><body>
<section class="sheet">
  <div class="top-floral"></div>
  <header class="invitation-head"><p class="bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p><p class="roman">Bismillahir Rahmanir Rahim</p><p class="eyebrow">Dawat-e-Nikah</p></header>
  <div class="couple-block"><div class="portrait-frame"><img src="${portrait}" alt="Mo. Adnan and Saniya in traditional Muslim wedding attire"></div><div class="couple-names"><h1>${escape(config.couple.first)}</h1><p class="parents"><span class="relationship">Farzand-e</span>Mohammed Arif<br>&amp; Shabnam</p><div class="amp">&amp;</div><p class="bride-name">${escape(config.couple.second)}</p><p class="parents"><span class="relationship">Dukhtar-e</span>Haji Mo. Imran<br>&amp; Amna</p></div></div>
  <p class="invite-copy">With gratitude to Allah, our families warmly invite you to celebrate our Nikah. Please honour this joyous occasion with your presence and duas.</p>
  <div class="save-heading"><h2>Save the dates</h2><p>5 &amp; 6 December 2026</p></div>
  <div class="main-dates"><article class="date-box"><h3>Barat &amp; Nikah</h3><p class="day">5 December 2026</p><p class="time">Saturday · ${clock(nikah.start)} IST</p><p class="city">Sujangarh</p></article><article class="date-box"><h3>Dawat-e-Walima</h3><p class="day">6 December 2026</p><p class="time">Sunday · ${clock(walima.start)} IST</p><p class="city">Ladnun</p></article></div>
  <p class="blessing">May Allah bless their union with love, mercy and barakah. Ameen.</p>
  <p class="footline">Aapki shirkat aur duaon ke muntazir</p>
</section>
<section class="sheet">
  <header class="programme-head"><p class="eyebrow">Mo. Adnan &amp; Saniya</p><h2>Wedding celebrations</h2><p class="subtitle">4, 5 &amp; 6 December 2026 · All times in IST</p><div class="ornament">✦</div></header>
  <div class="schedule">${schedule}</div>
  <section class="venue-box"><h3>Walima venue · Ladnun</h3><p><strong>${escape(config.venue.name)}</strong><br>${escape(config.venue.address)}</p><a class="venue-link" href="${escape(config.venue.mapUrl)}">View venue on Google Maps ↗</a></section>
  <section class="regards"><h3>With regards · Minjanib</h3><div class="hosts">${hosts.map((host) => `<p>${escape(host)}</p>`).join("")}</div></section>
  <p class="contact-label">For further details, please contact</p><div class="contacts">${config.contacts.map((number) => `<a href="tel:+91${number}">${number}</a>`).join("")}</div>
  <p class="closing">Tashreef laaiye aur apni duaon se nawaziye.</p>
  <p class="footline">A &amp; S · A celebration with our loved ones</p>
</section>
</body></html>`;

const output = path.resolve("output");
const previews = path.join(output, "readable-pdf-preview");
await mkdir(previews, { recursive: true });
await writeFile(path.join(previews, "invitation.html"), html);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await page.emulateMedia({ media: "print" });
  const fit = await page.locator(".sheet").evaluateAll((sheets) => sheets.map((sheet) => ({ height: sheet.clientHeight, content: sheet.scrollHeight, lastContent: Math.round(sheet.children[sheet.children.length - 2].getBoundingClientRect().bottom - sheet.getBoundingClientRect().top) })));
  console.log("Page fit:", JSON.stringify(fit));
  assert.ok(fit.every((sheet) => sheet.content <= sheet.height && sheet.lastContent < sheet.height - 50), "Content must fit above the footer");
  for (let i = 0; i < 2; i++) await page.locator(".sheet").nth(i).screenshot({ path: path.join(previews, `page-${i + 1}.png`) });
  const text = await page.locator("body").innerText();
  for (const required of ["Shabnam", "Amna", "Mohammed Anas", "Sujangarh", "Ladnun", "8:00 p.m.", ...config.contacts]) assert.ok(text.includes(required), `Missing ${required}`);
  const file = path.join(output, "Mo-Adnan-and-Saniya-Invitation-Readable.pdf");
  const pdf = await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true, tagged: true });
  const pageCount = (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  assert.equal(pageCount, 2);
  console.log(JSON.stringify({ file, pages: pageCount, bytes: pdf.length }));
} finally {
  await browser.close();
}

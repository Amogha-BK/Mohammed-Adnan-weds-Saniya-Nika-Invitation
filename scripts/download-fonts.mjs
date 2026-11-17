import { mkdir, writeFile } from "node:fs/promises";

const url = "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,500..700;1,500..700&family=Manrope:wght@400..800&display=swap";
const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" } });
if (!response.ok) throw new Error(`Font stylesheet: ${response.status}`);
const css = await response.text();
const faces = [...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)];
if (faces.length !== 4) throw new Error(`Expected four Latin font faces, received ${faces.length}`);
await mkdir("public/assets/fonts", { recursive: true });
const rules = [];
for (const [, rule] of faces) {
  const family = rule.match(/font-family: '([^']+)'/)[1];
  const style = rule.match(/font-style: ([^;]+)/)[1];
  const remote = rule.match(/url\(([^)]+)\)/)[1];
  const name = `${family.toLowerCase().replaceAll(" ", "-")}-${style}-latin.woff2`;
  const font = await fetch(remote);
  if (!font.ok) throw new Error(`Font download: ${font.status}`);
  const data = Buffer.from(await font.arrayBuffer());
  await writeFile(`public/assets/fonts/${name}`, data);
  rules.push(rule.replace(remote, `/assets/fonts/${name}`));
  console.log(`${name}: ${data.length} bytes`);
}
await writeFile("src/fonts.css", `${rules.join("\n\n")}\n`);
for (const family of ["cormorantgaramond", "greatvibes", "manrope"]) {
  const license = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`);
  if (!license.ok) throw new Error(`Font license ${family}: ${license.status}`);
  await writeFile(`public/assets/fonts/${family}-OFL.txt`, await license.text());
}

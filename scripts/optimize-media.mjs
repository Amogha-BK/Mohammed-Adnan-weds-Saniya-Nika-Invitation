import sharp from "sharp";
import ffmpeg from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";

const assets = "public/assets/";
const report = (input, output) => console.log(`${output}: ${statSync(output).size} bytes (${Math.round((1 - statSync(output).size / statSync(input).size) * 100)}% smaller)`);
for (const name of ["couple", "haldi", "mehndi", "nikah", "walima"]) {
  const input = `${assets}muslim-${name}-v1.png`;
  const output = `${assets}muslim-${name}-v1.webp`;
  await sharp(input).resize({ width: name === "couple" ? 720 : 800, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(output);
  report(input, output);
}
const poster = `${assets}envelope-poster-mobile-v1.jpg`;
await sharp("public/envelope-poster.jpg").resize({ width: 900, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(poster);
report("public/envelope-poster.jpg", poster);

function encode(input, output, options) {
  const result = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", input, ...options, output], { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr);
  report(input, output);
}
encode(`${assets}wedding-nasheed-source.mp3`, `${assets}wedding-nasheed-mobile-v1.mp3`, ["-vn", "-c:a", "libmp3lame", "-b:a", "80k", "-ar", "44100", "-ac", "2", "-map_metadata", "-1"]);
encode(`${assets}envelope-opening-safari.mp4`, `${assets}envelope-opening-mobile-v1.mp4`, ["-an", "-vf", "scale=720:-2", "-c:v", "libx264", "-preset", "medium", "-crf", "28", "-profile:v", "baseline", "-level", "3.1", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]);

/**
 * Prepares brand assets from the supplied logo without redrawing it:
 *   public/brand/logo.png   full lockup, trimmed to its artwork
 *   public/brand/mark.png   brain mark only
 *   app/icon.png            favicon from the brain mark
 *
 * Run: node scripts/build-brand.mjs <path to source logo>
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2] ?? join(root, "scripts", "brand-source", "logo.webp");

const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const rgba = Buffer.alloc(w * h * 4);
const tally = new Map();
for (let i = 0; i < w * h; i++) {
  // The supplied logo already carries transparency: keep its pixels untouched.
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
  rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b; rgba[i * 4 + 3] = a;
  if (a > 250) {
    const key = `${r >> 2 << 2},${g >> 2 << 2},${b >> 2 << 2}`;
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
}
console.log("dominant solid colours:", [...tally].sort((a, b) => b[1] - a[1]).slice(0, 6));

// Bounding box, then the first empty column run after the mark separates it from the wordmark.
const colHas = new Array(w).fill(false);
let top = h, bottom = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  if (rgba[(y * w + x) * 4 + 3] > 24) { colHas[x] = true; top = Math.min(top, y); bottom = Math.max(bottom, y); }
}
const left = colHas.indexOf(true);
const right = colHas.lastIndexOf(true);
let markEnd = left;
while (markEnd < w && colHas[markEnd]) markEnd++;
// The two hemispheres are separated by a thin gap: skip gaps narrower than 40px.
for (;;) {
  let gap = markEnd;
  while (gap < w && !colHas[gap]) gap++;
  if (gap - markEnd >= 40 || gap >= w) break;
  markEnd = gap;
  while (markEnd < w && colHas[markEnd]) markEnd++;
}
console.log({ w, h, left, right, top, bottom, markEnd });

const full = sharp(rgba, { raw: { width: w, height: h, channels: 4 } });
mkdirSync(join(root, "public", "brand"), { recursive: true });
await full.clone()
  .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
  .resize({ width: 960 })
  .png({ compressionLevel: 9 })
  .toFile(join(root, "public", "brand", "logo.png"));

const mw = markEnd - left, mh = bottom - top + 1;
const side = Math.max(mw, mh);
const mark = await full.clone().extract({ left, top, width: mw, height: mh })
  .extend({
    top: Math.floor((side - mh) / 2), bottom: Math.ceil((side - mh) / 2),
    left: Math.floor((side - mw) / 2), right: Math.ceil((side - mw) / 2),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png().toBuffer();
await sharp(mark).resize(512, 512).png().toFile(join(root, "public", "brand", "mark.png"));
await sharp(mark).resize(192, 192).png().toFile(join(root, "app", "icon.png"));
const meta = await sharp(join(root, "public", "brand", "logo.png")).metadata();
console.log("logo.png", meta.width, "x", meta.height);

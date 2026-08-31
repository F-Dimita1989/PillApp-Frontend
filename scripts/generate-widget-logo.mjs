/**
 * Logo per il widget Android: ritaglia i margini trasparenti e centra il segno
 * in un quadrato, così a 34dp resta leggibile e non appare spostato.
 * Uso: node scripts/generate-widget-logo.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "assets/images/pillapp-logo.png");
const outPath = path.join(root, "assets/images/pillapp-logo-widget.png");

const OUTPUT_SIZE = 192;
const ALPHA_THRESHOLD = 12;

const { data, info } = await sharp(logoPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * channels + 3] <= ALPHA_THRESHOLD) {
      continue;
    }
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

if (maxX < 0) {
  throw new Error("Il logo di partenza è completamente trasparente.");
}

const markWidth = maxX - minX + 1;
const markHeight = maxY - minY + 1;
const side = Math.min(Math.max(markWidth, markHeight), Math.min(width, height));

const left = Math.min(
  Math.max(Math.round(minX + markWidth / 2 - side / 2), 0),
  width - side,
);
const top = Math.min(
  Math.max(Math.round(minY + markHeight / 2 - side / 2), 0),
  height - side,
);

await sharp(logoPath)
  .extract({ left, top, width: side, height: side })
  .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(outPath);

console.log(
  `Scritto ${outPath} — segno ${markWidth}x${markHeight} ritagliato da ${width}x${height}`,
);

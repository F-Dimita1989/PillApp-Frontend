/**
 * Logo per sfondo a gradiente: riempie solo i buchi interni (croce) con bianco.
 * Uso: node scripts/generate-welcome-logo.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "assets/images/pillapp-logo.png");
const outPath = path.join(root, "assets/images/pillapp-logo-welcome.png");

const { data, info } = await sharp(logoPath)
  .trim({ background: { r: 0, g: 0, b: 0 }, threshold: 20 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixels = Buffer.from(data);
const outside = new Uint8Array(width * height);

function isTransparent(x, y) {
  return pixels[(y * width + x) * channels + 3] < 128;
}

function markOutsideFrom(x, y) {
  const stack = [[x, y]];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) {
      continue;
    }

    const index = cy * width + cx;
    if (outside[index] || !isTransparent(cx, cy)) {
      continue;
    }

    outside[index] = 1;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
}

for (let x = 0; x < width; x++) {
  markOutsideFrom(x, 0);
  markOutsideFrom(x, height - 1);
}

for (let y = 0; y < height; y++) {
  markOutsideFrom(0, y);
  markOutsideFrom(width - 1, y);
}

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const index = y * width + x;
    if (!isTransparent(x, y) || outside[index]) {
      continue;
    }

    const i = index * channels;
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = 255;
  }
}

await sharp(pixels, { raw: { width, height, channels } }).png().toFile(outPath);

console.log("Scritto", outPath);

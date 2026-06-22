/**
 * Genera icon.png e icone Android adaptive dal logo PillApp.
 * Uso: npm run icons
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "assets/images/pillapp-logo.png");
const outDir = path.join(root, "assets/images");

const ICON_SIZE = 1024;
const LOGO_SCALE = 0.88;
/** Più piccolo dell'icona: la splash Android 12+ maschera l'immagine in cerchio. */
const SPLASH_LOGO_SCALE = 0.68;
const BG = { r: 255, g: 255, b: 255, alpha: 1 };

/** Logo senza banda nera esterna (trim + canvas bianco). */
async function prepareLogo() {
  const { data, info } = await sharp(logoPath)
    .trim({ background: { r: 0, g: 0, b: 0 }, threshold: 20 })
    .flatten({ background: "#FFFFFF" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r < 250 || g < 250 || b < 250) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }

  const centroidX = sumX / count;
  const centroidY = sumY / count;

  const buffer = await sharp(logoPath)
    .trim({ background: { r: 0, g: 0, b: 0 }, threshold: 20 })
    .flatten({ background: "#FFFFFF" })
    .png()
    .toBuffer();

  return {
    buffer,
    width,
    height,
    offsetX: width / 2 - centroidX,
    offsetY: height / 2 - centroidY,
  };
}

async function logoOnBackground(size, logoScale) {
  const logo = await prepareLogo();
  const logoSize = Math.round(size * logoScale);
  const resized = await sharp(logo.buffer)
    .resize(logoSize, logoSize, { fit: "contain", background: BG })
    .png()
    .toBuffer();

  const scale = logoSize / logo.width;
  const left = Math.round((size - logoSize) / 2 + logo.offsetX * scale);
  const top = Math.round((size - logoSize) / 2 + logo.offsetY * scale);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  }).composite([{ input: resized, left, top }]);
}

async function solidBackground(size, hex) {
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: hex,
    },
  });
}

async function main() {
  await mkdir(outDir, { recursive: true });

  await (await logoOnBackground(ICON_SIZE, LOGO_SCALE)).png().toFile(
    path.join(outDir, "icon.png"),
  );

  await (await logoOnBackground(ICON_SIZE, LOGO_SCALE)).png().toFile(
    path.join(outDir, "android-icon-foreground.png"),
  );

  await (await solidBackground(ICON_SIZE, "#FFFFFF")).png().toFile(
    path.join(outDir, "android-icon-background.png"),
  );

  await (await logoOnBackground(192, LOGO_SCALE)).png().toFile(
    path.join(outDir, "favicon.png"),
  );

  await (await logoOnBackground(ICON_SIZE, SPLASH_LOGO_SCALE)).png().toFile(
    path.join(outDir, "pillapp-splash.png"),
  );

  const logo = await prepareLogo();
  const monoSize = Math.round(ICON_SIZE * LOGO_SCALE);
  const mono = await sharp(logo.buffer)
    .resize(monoSize, monoSize, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .greyscale()
    .png()
    .toBuffer();

  const monoScale = monoSize / logo.width;
  const monoLeft = Math.round((ICON_SIZE - monoSize) / 2 + logo.offsetX * monoScale);
  const monoTop = Math.round((ICON_SIZE - monoSize) / 2 + logo.offsetY * monoScale);

  await sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: mono, left: monoLeft, top: monoTop }])
    .png()
    .toFile(path.join(outDir, "android-icon-monochrome.png"));

  console.log("Icone generate in assets/images/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

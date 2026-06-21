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
const BG = { r: 255, g: 255, b: 255, alpha: 1 };

/** Logo senza banda nera esterna (trim + canvas bianco). */
async function prepareLogoBuffer() {
  return sharp(logoPath)
    .trim({ background: { r: 0, g: 0, b: 0 }, threshold: 20 })
    .flatten({ background: "#FFFFFF" })
    .png()
    .toBuffer();
}

async function logoOnBackground(size, logoScale) {
  const logoBuffer = await prepareLogoBuffer();
  const logoSize = Math.round(size * logoScale);
  const resized = await sharp(logoBuffer)
    .resize(logoSize, logoSize, { fit: "contain", background: BG })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  }).composite([{ input: resized, gravity: "center" }]);
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

  const logoBuffer = await prepareLogoBuffer();
  const mono = await sharp(logoBuffer)
    .resize(Math.round(ICON_SIZE * LOGO_SCALE), Math.round(ICON_SIZE * LOGO_SCALE), {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .greyscale()
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: mono, gravity: "center" }])
    .png()
    .toFile(path.join(outDir, "android-icon-monochrome.png"));

  console.log("Icone generate in assets/images/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

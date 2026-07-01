import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const brandDir = join(root, "public", "brand");
const iconsDir = join(root, "public", "icons");
const publicDir = join(root, "public");
const androidRes = join(root, "android", "app", "src", "main", "res");

const APP_BG = { r: 245, g: 243, b: 255, alpha: 1 };
const markPath = join(brandDir, "logo-mark.png");
const markBuffer = readFileSync(markPath);

async function makeAppIcon(size, outPath, logoScale = 0.62) {
  const logoPx = Math.round(size * logoScale);
  const resized = await sharp(markBuffer)
    .resize(logoPx, null, { fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: APP_BG,
    },
  })
    .composite([
      {
        input: resized,
        left: Math.round((size - (meta.width ?? logoPx)) / 2),
        top: Math.round((size - (meta.height ?? logoPx)) / 2),
      },
    ])
    .png()
    .toFile(outPath);
}

async function makeMaskableIcon(size, outPath) {
  await makeAppIcon(size, outPath, 0.52);
}

async function makeForeground(size, outPath) {
  const logoPx = Math.round(size * 0.55);
  const resized = await sharp(markBuffer)
    .resize(logoPx, null, { fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: resized,
        left: Math.round((size - (meta.width ?? logoPx)) / 2),
        top: Math.round((size - (meta.height ?? logoPx)) / 2),
      },
    ])
    .png()
    .toFile(outPath);
}

mkdirSync(iconsDir, { recursive: true });

for (const size of [192, 512]) {
  await makeAppIcon(size, join(iconsDir, `icon-${size}.png`));
  await makeMaskableIcon(size, join(iconsDir, `maskable-icon-${size}.png`));
}

await makeAppIcon(180, join(iconsDir, "apple-touch-icon.png"));
await makeAppIcon(32, join(publicDir, "favicon-32.png"));
await makeAppIcon(16, join(publicDir, "favicon-16.png"));

const androidSizes = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

for (const [folder, size] of Object.entries(androidSizes)) {
  const dir = join(androidRes, folder);
  mkdirSync(dir, { recursive: true });
  await makeAppIcon(size, join(dir, "ic_launcher.png"));
  await makeAppIcon(size, join(dir, "ic_launcher_round.png"));
  const fgSize = Math.round(size * (108 / 48));
  await makeForeground(fgSize, join(dir, "ic_launcher_foreground.png"));
}

console.log("✓ PWA icons 192/512 (any + maskable)");
console.log("✓ apple-touch-icon 180");
console.log("✓ Android mipmap launcher icons");
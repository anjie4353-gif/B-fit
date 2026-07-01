import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const brandDir = join(root, "public", "brand");
const iconsDir = join(root, "public", "icons");
const APP_BG = "#f5f3ff";
const mark = join(brandDir, "logo-mark.png");

for (const size of [192, 512]) {
  const markSize = Math.round(size * 0.58);
  const out = join(iconsDir, `icon-${size}.png`);
  execSync(
    `magick -size ${size}x${size} xc:"${APP_BG}" "${mark}" -resize ${markSize}x -gravity center -composite "${out}"`,
    { stdio: "inherit" }
  );
}

console.log("PWA icons generated with app background", APP_BG);
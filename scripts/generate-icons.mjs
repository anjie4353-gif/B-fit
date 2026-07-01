import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

const svg192 = readFileSync(join(iconsDir, "icon-192.svg"));
const svg512 = readFileSync(join(iconsDir, "icon-512.svg"));

await sharp(svg192).png().toFile(join(iconsDir, "icon-192.png"));
await sharp(svg512).png().toFile(join(iconsDir, "icon-512.png"));

console.log("Generated icon-192.png and icon-512.png");
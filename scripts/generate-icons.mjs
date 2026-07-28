// One-time asset generation: rasterizes the brand icon SVG into every size
// the app needs (favicon.ico, apple-icon.png, and the two manifest icons).
// Re-run with `node scripts/generate-icons.mjs` if the design ever changes.

import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const SVG = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="64" height="64" rx="14" fill="#7B4B32"/>
  <rect x="18" y="12" width="36" height="40" rx="3" fill="#F7EFE3"/>
  <rect x="24" y="21" width="24" height="3.2" rx="1.6" fill="#7B4B32"/>
  <rect x="24" y="29" width="24" height="3.2" rx="1.6" fill="#7B4B32"/>
  <rect x="24" y="37" width="15" height="3.2" rx="1.6" fill="#D4A039"/>
  <circle cx="17" cy="18" r="4.6" fill="none" stroke="#F7EFE3" stroke-width="3"/>
  <circle cx="17" cy="32" r="4.6" fill="none" stroke="#F7EFE3" stroke-width="3"/>
  <circle cx="17" cy="46" r="4.6" fill="none" stroke="#F7EFE3" stroke-width="3"/>
</svg>
`;

async function renderPng(size) {
  return sharp(Buffer.from(SVG)).resize(size, size).png().toBuffer();
}

async function main() {
  await mkdir(join(projectRoot, "public"), { recursive: true });

  // Favicon: multi-resolution .ico from 16/32/48px renders.
  const icoSizes = [16, 32, 48];
  const icoBuffers = await Promise.all(icoSizes.map(renderPng));
  const icoBuffer = await pngToIco(icoBuffers);
  await writeFile(join(projectRoot, "app", "favicon.ico"), icoBuffer);
  console.log("✓ app/favicon.ico (16, 32, 48px)");

  // Apple touch icon.
  const apple180 = await renderPng(180);
  await writeFile(join(projectRoot, "app", "apple-icon.png"), apple180);
  console.log("✓ app/apple-icon.png (180px)");

  // Manifest icons (PWA / Android install prompt).
  const icon192 = await renderPng(192);
  await writeFile(join(projectRoot, "public", "icon-192.png"), icon192);
  console.log("✓ public/icon-192.png");

  const icon512 = await renderPng(512);
  await writeFile(join(projectRoot, "public", "icon-512.png"), icon512);
  console.log("✓ public/icon-512.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

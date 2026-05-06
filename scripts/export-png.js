/**
 * Export each `.slide` in an HTML design to a separate PNG.
 *
 * Usage:
 *   node scripts/export-png.js <path-to-html> [output-dir] [--scale=N]
 *
 * Examples:
 *   node scripts/export-png.js designs/ecommerce-effortless-carousel.html
 *   node scripts/export-png.js designs/foo.html designs/exports --scale=2
 *
 * Defaults:
 *   output-dir = <html-dir>/exports/<basename>
 *   scale      = 1  (PNG is exactly 1080×1080 or 1080×1350 — LinkedIn/IG spec)
 *                Set --scale=2 for 2x resolution (e.g., 2160×2700) if you want
 *                higher fidelity; the platform will downscale on upload.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const args = process.argv.slice(2);
  const flags = Object.fromEntries(
    args.filter(a => a.startsWith('--')).map(a => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v ?? true];
    })
  );
  const positional = args.filter(a => !a.startsWith('--'));
  const inputHtml = positional[0];
  const scale = Number(flags.scale ?? 1);

  if (!inputHtml) {
    console.error('Usage: node scripts/export-png.js <path-to-html> [output-dir] [--scale=N]');
    process.exit(1);
  }

  const absInput = path.resolve(inputHtml);
  if (!fs.existsSync(absInput)) {
    console.error(`File not found: ${absInput}`);
    process.exit(1);
  }

  const baseName = path.basename(absInput, '.html');
  const outputDir = positional[1]
    ? path.resolve(positional[1])
    : path.join(path.dirname(absInput), 'exports', baseName);

  fs.mkdirSync(outputDir, { recursive: true });

  const fileUrl = 'file:///' + absInput.replace(/\\/g, '/');

  console.log(`→ Loading ${absInput}`);
  console.log(`→ Output  ${outputDir}`);
  console.log(`→ Scale   ${scale}x`);

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1080, height: 1350, deviceScaleFactor: scale },
  });

  const page = await browser.newPage();
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  // wait for Google Fonts to actually load before screenshotting
  await page.evaluate(() => document.fonts.ready);

  const slides = await page.$$('.slide');
  if (slides.length === 0) {
    console.error('No `.slide` elements found in the HTML.');
    await browser.close();
    process.exit(1);
  }

  console.log(`Found ${slides.length} slide(s). Capturing…`);

  for (let i = 0; i < slides.length; i++) {
    const n = String(i + 1).padStart(2, '0');
    const out = path.join(outputDir, `${baseName}-${n}.png`);
    await slides[i].screenshot({ path: out });
    const box = await slides[i].boundingBox();
    console.log(`  ✓ ${path.basename(out)}  (${Math.round(box.width * scale)}×${Math.round(box.height * scale)} px)`);
  }

  await browser.close();
  console.log(`Done → ${outputDir}`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});

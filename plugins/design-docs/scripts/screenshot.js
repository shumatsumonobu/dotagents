/**
 * Full-page screenshot of an HTML file using Playwright.
 *
 * Usage:
 *   node scripts/screenshot.js <html-file> <output-image>
 *
 * Example:
 *   node scripts/screenshot.js docs/design/assets/dashboard-wireframe.html docs/design/assets/dashboard-wireframe.png
 */

const { chromium } = require('playwright');
const path = require('path');

const [,, htmlFile, outFile] = process.argv;

if (!htmlFile || !outFile) {
  console.error('Usage: node screenshot.js <html-file> <output-image>');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  const htmlPath = path.resolve(process.cwd(), htmlFile);
  await page.goto(`file://${htmlPath}`);
  await page.waitForTimeout(500);
  const outPath = path.resolve(process.cwd(), outFile);
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log(`saved: ${outPath}`);
})();

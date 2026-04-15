/**
 * Screenshot of .card element or first child of body from an HTML file.
 *
 * Usage:
 *   node scripts/screenshot-element.js <html-file> <output-image>
 */

const { chromium } = require('playwright');
const path = require('path');

const [,, htmlFile, outFile] = process.argv;

if (!htmlFile || !outFile) {
  console.error('Usage: node screenshot-element.js <html-file> <output-image>');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  const htmlPath = path.resolve(process.cwd(), htmlFile);
  await page.goto(`file://${htmlPath}`);
  await page.waitForTimeout(1000);
  const el = await page.$('.card') || await page.$('body > *:first-child');
  const outPath = path.resolve(process.cwd(), outFile);
  await el.screenshot({ path: outPath });
  await browser.close();
  console.log(`saved: ${outPath}`);
})();

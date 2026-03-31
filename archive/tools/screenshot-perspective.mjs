import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'card-perspective-prototype.html');
const outDir = process.env.TEMP || '/tmp';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(`file://${file}`, { waitUntil: 'networkidle0' });
    await sleep(800);

    // 1. Board with all cards flat (the parallelogram view)
    await page.screenshot({ path: path.join(outDir, 'perspective-1-flat.png') });
    console.log('1: All cards flat on board');

    // 2. Hover over Aragorn to stand him up
    const aragorn = await page.$('.culture-gondor .card-3d');
    await aragorn.hover();
    await sleep(500);
    await page.screenshot({ path: path.join(outDir, 'perspective-2-hover.png') });
    console.log('2: Aragorn hovered (stood up)');

    // 3. Click to inspect
    await aragorn.click();
    await sleep(400);
    await page.screenshot({ path: path.join(outDir, 'perspective-3-inspect.png') });
    console.log('3: Aragorn clicked (inspected)');

  } finally {
    await browser.close();
  }
})();

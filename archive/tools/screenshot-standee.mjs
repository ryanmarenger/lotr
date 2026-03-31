import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'card-standee-prototype.html');
const outDir = process.env.TEMP || '/tmp';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(`file://${file}`, { waitUntil: 'networkidle0' });
    await sleep(2500); // Let placement animation complete

    // 1. All standees on board
    await page.screenshot({ path: path.join(outDir, 'standee-1-board.png') });
    console.log('1: All standees on board');

    // 2. Hover Aragorn
    const aragorn = await page.$('.culture-gondor');
    await aragorn.hover();
    await sleep(500);
    await page.screenshot({ path: path.join(outDir, 'standee-2-hover.png') });
    console.log('2: Hover (stats visible)');

    // 3. Click to inspect
    await aragorn.click();
    await sleep(500);
    await page.screenshot({ path: path.join(outDir, 'standee-3-inspect.png') });
    console.log('3: Inspect view');

  } finally {
    await browser.close();
  }
})();

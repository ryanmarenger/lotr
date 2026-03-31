import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'card-grounding-prototype.html');
const outDir = process.env.TEMP || '/tmp';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1800 });
    await page.goto(`file://${file}`, { waitUntil: 'networkidle0' });
    await sleep(2000); // Let animations play
    await page.screenshot({ path: path.join(outDir, 'grounding-all.png'), fullPage: true });
    console.log('Done:', path.join(outDir, 'grounding-all.png'));
  } finally {
    await browser.close();
  }
})();

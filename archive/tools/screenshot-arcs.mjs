import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'board-arcs-prototype.html');
const outDir = process.env.TEMP || '/tmp';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });
    await page.goto(`file://${file}`, { waitUntil: 'networkidle0' });
    await sleep(500);

    await page.screenshot({ path: path.join(outDir, 'arcs-a.png') });
    console.log('A done');

    await page.click('#btn-b');
    await sleep(200);
    await page.screenshot({ path: path.join(outDir, 'arcs-b.png') });
    console.log('B done');

    await page.click('#btn-c');
    await sleep(200);
    await page.screenshot({ path: path.join(outDir, 'arcs-c.png') });
    console.log('C done');

  } finally { await browser.close(); }
})();

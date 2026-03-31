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
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(`file://${file}`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Screenshot 1: No grounding vs Contact shadow (scenes 1-2)
    await page.screenshot({ path: path.join(outDir, 'ground-1-none-vs-shadow.png'), clip: { x: 0, y: 44, width: 1400, height: 640 } });
    console.log('1: None vs Shadow');

    // Screenshot 2: Glow + Ripples (scenes 3-4)
    await page.screenshot({ path: path.join(outDir, 'ground-2-glow-vs-ripple.png'), clip: { x: 0, y: 684, width: 1400, height: 640 } });
    console.log('2: Glow vs Ripples');

    // Screenshot 3: Full combo (scene 5)
    await page.screenshot({ path: path.join(outDir, 'ground-3-full-combo.png'), clip: { x: 0, y: 1324, width: 1400, height: 420 } });
    console.log('3: Full combo');

  } finally {
    await browser.close();
  }
})();

/**
 * Generate 3 board editor layouts: gentle, moderate, steep.
 * These match the arcLayout profiles in site-cameras.ts.
 * Each is importable in LotR_TCG_Board_Editor_v4.html.
 *
 * Zones are transparent arc-approximations (the editor uses rectangles,
 * so we position/angle them to suggest the arc layout).
 * Actual arc rendering happens in the game board component.
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const editorPath = path.join(__dirname, '..', 'LotR_TCG_Board_Editor_v4.html');
const outDir = path.join(__dirname, '..', 'data', 'layouts');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// ─── Zone styles ──────────────────────────────────

const Z_FP     = { bg:'rgba(186,140,30,0.04)', border:'rgba(186,140,30,0.12)', color:'rgba(186,140,30,0.06)', dashed:true };
const Z_SH     = { bg:'rgba(80,50,120,0.04)',  border:'rgba(80,50,120,0.12)',  color:'rgba(80,50,120,0.06)',  dashed:true };
const Z_SK     = { bg:'rgba(200,60,60,0.03)',  border:'rgba(200,80,80,0.10)',  color:'rgba(200,80,80,0.05)',  dashed:true };
const Z_PATH   = { bg:'rgba(120,80,30,0.08)',  border:'rgba(120,80,30,0.18)',  color:'rgba(180,140,60,0.12)', dashed:true };
const UI_PHASE = { bg:'rgba(8,8,18,0.88)',  border:'rgba(186,140,30,0.2)',  color:'rgba(255,255,255,0.5)' };
const UI_PASS  = { bg:'rgba(8,8,18,0.85)',  border:'rgba(255,255,255,0.18)',color:'rgba(255,255,255,0.45)' };
const UI_TWIL  = { bg:'rgba(20,40,80,0.6)', border:'rgba(55,138,221,0.45)',color:'rgba(130,190,240,0.8)' };
const UI_LOG   = { bg:'rgba(0,0,0,0.5)',    border:'rgba(255,255,255,0.08)',color:'rgba(100,220,130,0.6)' };
const UI_PFP   = { bg:'rgba(20,50,35,0.7)', border:'rgba(29,158,117,0.4)', color:'rgba(100,200,150,0.6)' };
const UI_PSH   = { bg:'rgba(40,20,60,0.7)', border:'rgba(100,60,150,0.4)', color:'rgba(160,130,200,0.6)' };
const UI_OPP   = { bg:'rgba(40,20,60,0.7)', border:'rgba(100,60,150,0.5)', color:'rgba(180,150,220,0.7)' };
const UI_RING  = { bg:'rgba(0,0,0,0)',      border:'rgba(186,117,23,0.35)',color:'rgba(186,117,23,0.55)' };
const UI_BAR   = { bg:'rgba(30,5,5,0)',     border:'rgba(150,30,30,0.4)', color:'rgba(200,80,50,0.55)' };
const UI_SHELF = { bg:'rgba(0,0,0,0.02)',   border:'rgba(186,140,30,0.06)',color:'rgba(186,140,30,0.04)', dashed:true };
const UI_HAND  = { bg:'rgba(0,0,0,0.01)',   border:'rgba(186,140,30,0.06)',color:'rgba(200,200,200,0.15)' };

// ─── GENTLE — open, wide, spacious ──────────────────
// Shire, Lothlórien, Anduin, E.Rohan, Rohan Plains, Black Gate
// Low horizon (18-28%), gentle tilt (12-16°), wide arc spread

const GENTLE = {
  name: 'Gentle — Open Landscapes',
  description: 'Wide arc spread, thin bands. Low horizon, big sky. Shire, Lothlórien, Anduin, Rohan, Black Gate.',
  components: [
    // Zones — wide horizontal bands, angled toward player (lower-right)
    // All zones are flat ground by definition (standees need level surfaces)
    { type:'shadow-zone',    label:'Shadow Zone',       layer:'shadow',    x:20, y:8,  w:50, h:12, ...Z_SH, opacity:0.5, rotation:3, skewX:-4 },
    { type:'skirmish-left',  label:'Skirmish L',        layer:'neutral',   x:12, y:30, w:25, h:14, ...Z_SK, opacity:0.35, rotation:4, skewX:-3 },
    { type:'skirmish-right', label:'Skirmish R',        layer:'neutral',   x:40, y:32, w:25, h:14, ...Z_SK, opacity:0.35, rotation:5, skewX:-3 },
    { type:'fellowship-zone',label:'Fellowship Zone',   layer:'fellowship',x:15, y:60, w:55, h:14, ...Z_FP, opacity:0.5, rotation:5, skewX:-4 },
    { type:'adventure-path', label:'Adventure Path',    layer:'neutral',   x:18, y:78, w:50, h:4,  ...Z_PATH, rotation:6, skewX:-3 },
    // Solid UI
    { type:'phase-tracker',  label:'Phase Tracker',     layer:'interface', x:18, y:0.3,w:55, h:3.5,...UI_PHASE },
    { type:'twilight-pool',  label:'Twilight Pool',     layer:'neutral',   x:68, y:32, w:7,  h:9,  ...UI_TWIL },
    { type:'pass-btn',       label:'Pass Button',       layer:'interface', x:60, y:85, w:10, h:4.5,...UI_PASS },
    { type:'action-log',     label:'Action Log',        layer:'interface', x:72, y:8,  w:12, h:5,  ...UI_LOG },
    { type:'opp-hand',       label:'Shadow Hand Count', layer:'shadow',    x:72, y:14, w:3.5,h:4,  ...UI_OPP },
    { type:'opp-piles',      label:'Opp. Piles',        layer:'shadow',    x:76, y:8,  w:6,  h:7,  ...UI_PSH },
    { type:'your-piles',     label:'Your Piles',        layer:'fellowship',x:73, y:60, w:6,  h:7,  ...UI_PFP },
    { type:'ring-spinner',   label:'Ring / RB Portrait',layer:'interface', x:84, y:8,  w:4,  h:6,  ...UI_RING },
    { type:'baradur',        label:'Barad-dûr',         layer:'landscape', x:90, y:5,  w:3,  h:10, ...UI_BAR },
    // Hand fan — compact lower-right
    { type:'hand-fan',       label:'Hand (fan)',         layer:'hand',      x:70, y:78, w:28, h:22, ...UI_HAND, opacity:0.9 },
    // Card shelf — left edge
    { type:'custom',         label:'Card Shelf',         layer:'interface', x:0,  y:5,  w:4.5,h:70, ...UI_SHELF, opacity:0.3 },
  ],
};

// ─── MODERATE — balanced, vertical features ─────────
// Bree, Rivendell, Pillars, Amon Hen, Edoras, Helm's Deep outer, Isengard, Minas Tirith lower

const MODERATE = {
  name: 'Moderate — Mixed Terrain',
  description: 'Balanced arcs, medium spread. Vertical features, mixed open/enclosed. Bree, Rivendell, Edoras, Isengard.',
  components: [
    // Zones — tighter spread, more overlap
    { type:'shadow-zone',    label:'Shadow Zone',       layer:'shadow',    x:25, y:6,  w:45, h:16, ...Z_SH, opacity:0.5, rotation:4, skewX:-5 },
    { type:'skirmish-left',  label:'Skirmish L',        layer:'neutral',   x:18, y:26, w:20, h:16, ...Z_SK, opacity:0.35, rotation:5, skewX:-4 },
    { type:'skirmish-right', label:'Skirmish R',        layer:'neutral',   x:42, y:28, w:20, h:16, ...Z_SK, opacity:0.35, rotation:6, skewX:-4 },
    { type:'fellowship-zone',label:'Fellowship Zone',   layer:'fellowship',x:12, y:48, w:45, h:18, ...Z_FP, opacity:0.5, rotation:6, skewX:-5 },
    { type:'adventure-path', label:'Adventure Path',    layer:'neutral',   x:15, y:70, w:48, h:4,  ...Z_PATH, rotation:7, skewX:-4 },
    // Solid UI
    { type:'phase-tracker',  label:'Phase Tracker',     layer:'interface', x:18, y:0.3,w:55, h:3.5,...UI_PHASE },
    { type:'twilight-pool',  label:'Twilight Pool',     layer:'neutral',   x:64, y:30, w:8,  h:10, ...UI_TWIL },
    { type:'pass-btn',       label:'Pass Button',       layer:'interface', x:55, y:82, w:10, h:4.5,...UI_PASS },
    { type:'action-log',     label:'Action Log',        layer:'interface', x:72, y:6,  w:12, h:5,  ...UI_LOG },
    { type:'opp-hand',       label:'Shadow Hand Count', layer:'shadow',    x:72, y:12, w:3.5,h:4,  ...UI_OPP },
    { type:'opp-piles',      label:'Opp. Piles',        layer:'shadow',    x:76, y:6,  w:6,  h:7,  ...UI_PSH },
    { type:'your-piles',     label:'Your Piles',        layer:'fellowship',x:60, y:50, w:6,  h:7,  ...UI_PFP },
    { type:'ring-spinner',   label:'Ring / RB Portrait',layer:'interface', x:84, y:6,  w:4,  h:6,  ...UI_RING },
    { type:'baradur',        label:'Barad-dûr',         layer:'landscape', x:90, y:4,  w:3,  h:10, ...UI_BAR },
    { type:'hand-fan',       label:'Hand (fan)',         layer:'hand',      x:68, y:76, w:30, h:24, ...UI_HAND, opacity:0.9 },
    { type:'custom',         label:'Card Shelf',         layer:'interface', x:0,  y:5,  w:4.5,h:65, ...UI_SHELF, opacity:0.3 },
  ],
};

// ─── STEEP — enclosed, claustrophobic ───────────────
// Caradhras, Khazad-dûm, Fangorn, Helm's Deep deep, Dunharrow, Paths of Dead, Minas Tirith upper, Morgul Vale

const STEEP = {
  name: 'Steep — Enclosed Spaces',
  description: 'Narrow arc spread, compressed bands. High horizon, steep tilt. Khazad-dûm, Fangorn, Helm\'s Deep, Morgul Vale.',
  components: [
    // Zones — narrow, compressed, steeply angled
    { type:'shadow-zone',    label:'Shadow Zone',       layer:'shadow',    x:28, y:5,  w:38, h:16, ...Z_SH, opacity:0.5, rotation:5, skewX:-7 },
    { type:'skirmish-left',  label:'Skirmish L',        layer:'neutral',   x:22, y:22, w:18, h:14, ...Z_SK, opacity:0.35, rotation:6, skewX:-6 },
    { type:'skirmish-right', label:'Skirmish R',        layer:'neutral',   x:42, y:24, w:18, h:14, ...Z_SK, opacity:0.35, rotation:7, skewX:-6 },
    { type:'fellowship-zone',label:'Fellowship Zone',   layer:'fellowship',x:18, y:40, w:38, h:20, ...Z_FP, opacity:0.5, rotation:7, skewX:-7 },
    { type:'adventure-path', label:'Adventure Path',    layer:'neutral',   x:20, y:64, w:42, h:4,  ...Z_PATH, rotation:8, skewX:-5 },
    // Solid UI
    { type:'phase-tracker',  label:'Phase Tracker',     layer:'interface', x:18, y:0.3,w:55, h:3.5,...UI_PHASE },
    { type:'twilight-pool',  label:'Twilight Pool',     layer:'neutral',   x:62, y:26, w:8,  h:10, ...UI_TWIL },
    { type:'pass-btn',       label:'Pass Button',       layer:'interface', x:52, y:78, w:10, h:4.5,...UI_PASS },
    { type:'action-log',     label:'Action Log',        layer:'interface', x:70, y:5,  w:12, h:5,  ...UI_LOG },
    { type:'opp-hand',       label:'Shadow Hand Count', layer:'shadow',    x:68, y:11, w:3.5,h:4,  ...UI_OPP },
    { type:'opp-piles',      label:'Opp. Piles',        layer:'shadow',    x:72, y:5,  w:6,  h:7,  ...UI_PSH },
    { type:'your-piles',     label:'Your Piles',        layer:'fellowship',x:58, y:42, w:6,  h:7,  ...UI_PFP },
    { type:'ring-spinner',   label:'Ring / RB Portrait',layer:'interface', x:82, y:5,  w:4,  h:6,  ...UI_RING },
    { type:'baradur',        label:'Barad-dûr',         layer:'landscape', x:88, y:3,  w:3,  h:10, ...UI_BAR },
    { type:'hand-fan',       label:'Hand (fan)',         layer:'hand',      x:65, y:74, w:32, h:26, ...UI_HAND, opacity:0.9 },
    { type:'custom',         label:'Card Shelf',         layer:'interface', x:0,  y:5,  w:4.5,h:58, ...UI_SHELF, opacity:0.3 },
  ],
};

// ─── Render ──────────────────────────────────────────

async function renderLayout(page, layout, filename) {
  let nextId = 1;
  const components = layout.components.map(c => ({
    ...c, id: nextId++, visible: true, zIndex: c.zIndex || 0,
    rotation: c.rotation || 0, opacity: c.opacity !== undefined ? c.opacity : 1,
    skewX: c.skewX || 0, skewY: c.skewY || 0,
    borderRadius: c.borderRadius || '4px', dashed: c.dashed || false,
  }));

  await page.evaluate((comps) => {
    state.components = comps;
    state.selectedIds = [];
    state.nextId = comps.length + 1;
    state.showNegSpace = true;
    renderAll();
  }, components);

  await sleep(300);
  await page.screenshot({ path: path.join(outDir, filename.replace('.json', '.png')) });

  writeFileSync(path.join(outDir, filename), JSON.stringify({
    name: layout.name, description: layout.description,
    components, boardRatio: '16:9', horizonY: 42,
  }, null, 2));

  console.log(`  ✓ ${layout.name} → ${filename}`);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`file://${editorPath}`, { waitUntil: 'networkidle0' });
    await sleep(600);

    console.log('\nGenerating gentle/moderate/steep layouts...\n');
    await renderLayout(page, GENTLE,   'gentle.json');
    await renderLayout(page, MODERATE, 'moderate.json');
    await renderLayout(page, STEEP,    'steep.json');
    console.log(`\nDone. Files in: ${outDir}\n`);
  } finally { await browser.close(); }
})();

/**
 * Board Layout Variations V3 — Standee-Aware
 *
 * Locked constraints:
 *   - Cards are STANDEES (vertical silhouettes, small base footprint)
 *   - Player sits lower-right, hand fan lower-right
 *   - Card shelf on LEFT edge
 *   - Fellowship & shadow zones need FLAT TERRAIN (composition constraint)
 *   - Dramatic landscape in non-card areas (quiet zones)
 *   - Zones are transparent (landscape always visible through)
 *   - Phase tracker, piles, twilight pool, pass button are solid UI
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const editorPath = path.join(__dirname, '..', 'LotR_TCG_Board_Editor_v4.html');
const outDir = path.join(__dirname, '..', 'data', 'layouts');

// ─── Locked styles ──────────────────────────────────────────

// Transparent zones (card landing areas — landscape shows through)
const Z_FP      = { bg:'rgba(186,140,30,0.03)',  border:'rgba(186,140,30,0.10)',  color:'rgba(186,140,30,0.06)',  dashed:true };
const Z_SHADOW  = { bg:'rgba(80,50,120,0.03)',   border:'rgba(80,50,120,0.10)',   color:'rgba(80,50,120,0.06)',   dashed:true };
const Z_SKIRM   = { bg:'rgba(200,60,60,0.02)',   border:'rgba(200,80,80,0.07)',   color:'rgba(200,80,80,0.04)',   dashed:true };
const Z_PATH    = { bg:'rgba(30,20,8,0.25)',     border:'rgba(120,80,30,0.18)',   color:'rgba(180,140,60,0.25)',  dashed:true };

// Solid UI elements
const UI_PHASE   = { bg:'rgba(8,8,18,0.88)',     border:'rgba(186,140,30,0.2)',   color:'rgba(255,255,255,0.5)' };
const UI_PASS    = { bg:'rgba(8,8,18,0.85)',     border:'rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.45)' };
const UI_TWIL    = { bg:'rgba(20,40,80,0.6)',    border:'rgba(55,138,221,0.45)',  color:'rgba(130,190,240,0.8)' };
const UI_LOG     = { bg:'rgba(0,0,0,0.5)',       border:'rgba(255,255,255,0.08)', color:'rgba(100,220,130,0.6)' };
const UI_PILE_FP = { bg:'rgba(20,50,35,0.7)',    border:'rgba(29,158,117,0.4)',   color:'rgba(100,200,150,0.6)' };
const UI_PILE_SH = { bg:'rgba(40,20,60,0.7)',    border:'rgba(100,60,150,0.4)',   color:'rgba(160,130,200,0.6)' };
const UI_OPP     = { bg:'rgba(40,20,60,0.7)',    border:'rgba(100,60,150,0.5)',   color:'rgba(180,150,220,0.7)' };
const UI_RING    = { bg:'rgba(0,0,0,0)',         border:'rgba(186,117,23,0.35)',  color:'rgba(186,117,23,0.55)' };
const UI_BARAD   = { bg:'rgba(30,5,5,0)',        border:'rgba(150,30,30,0.4)',    color:'rgba(200,80,50,0.55)' };
const UI_SHELF   = { bg:'rgba(0,0,0,0.02)',      border:'rgba(186,140,30,0.06)',  color:'rgba(186,140,30,0.04)', dashed:true };

// Flat ground annotation (visual hint for landscape composition)
const FLAT_HINT  = { bg:'rgba(80,180,80,0.04)',  border:'rgba(80,180,80,0.08)',   color:'rgba(80,180,80,0.06)',   dashed:true };

// ═══════════════════════════════════════════════════════════════
// LAYOUT A — "Wide Horizon" (Horizontal Bands)
//
// Standee rows run left-to-right in horizontal bands.
// Fellowship standees across the lower band — their silhouettes
// rise against the mid-board landscape.
// Shadow standees across the upper band — silhouettes against sky.
// Center band is the DRAMATIC LANDSCAPE zone (peaks, towers, falls).
//
// Flat ground: lower band and upper band are flat terrain.
// Dramatic terrain: center band (cliffs, water, fire).
//
// Player position: lower-right. Hand fan: lower-right.
// Card shelf: left edge column.
// ═══════════════════════════════════════════════════════════════

const LAYOUT_A = {
  name: 'A — Wide Horizon (Horizontal Bands)',
  description: 'Standee rows in horizontal bands. Fellowship lower, shadow upper. Center band = dramatic landscape focal point. Flat ground in card zones, dramatic terrain in between.',
  components: [
    // ── Flat ground hints (composition guides for Midjourney) ──
    { type:'custom', label:'FLAT GROUND (fellowship)', layer:'landscape', x:3,  y:62, w:62, h:16, ...FLAT_HINT, opacity:0.5 },
    { type:'custom', label:'FLAT GROUND (shadow)',     layer:'landscape', x:10, y:6,  w:62, h:14, ...FLAT_HINT, opacity:0.5 },

    // ── Card landing zones (transparent) ──
    { type:'fellowship-zone', label:'Fellowship Zone',  layer:'fellowship', x:3,  y:62, w:62, h:16, ...Z_FP,     opacity:0.5 },
    { type:'shadow-zone',     label:'Shadow Zone',      layer:'shadow',     x:10, y:6,  w:62, h:14, ...Z_SHADOW, opacity:0.5 },
    { type:'skirmish-left',   label:'Skirmish L',       layer:'neutral',    x:8,  y:32, w:28, h:18, ...Z_SKIRM,  opacity:0.3 },
    { type:'skirmish-right',  label:'Skirmish R',       layer:'neutral',    x:38, y:32, w:28, h:18, ...Z_SKIRM,  opacity:0.3 },
    { type:'adventure-path',  label:'Adventure Path',   layer:'neutral',    x:8,  y:80, w:58, h:4,  ...Z_PATH },

    // ── Solid UI ──
    { type:'phase-tracker',   label:'Phase Tracker',    layer:'interface',  x:18, y:0.3,w:55, h:3.5,...UI_PHASE },
    { type:'twilight-pool',   label:'Twilight Pool',    layer:'neutral',    x:68, y:34, w:8,  h:10, ...UI_TWIL },
    { type:'pass-btn',        label:'Pass Button',      layer:'interface',  x:35, y:93, w:12, h:4.5,...UI_PASS },
    { type:'action-log',      label:'Action Log',       layer:'interface',  x:74, y:6,  w:12, h:5,  ...UI_LOG },

    // ── Piles & ring-bearer (right edge, player's side) ──
    { type:'opp-hand',        label:'Shadow Hand Count', layer:'shadow',    x:74, y:12, w:3.5,h:5,  ...UI_OPP },
    { type:'opp-piles',       label:'Opp. Piles',       layer:'shadow',     x:78, y:6,  w:6,  h:8,  ...UI_PILE_SH },
    { type:'your-piles',      label:'Your Piles',       layer:'fellowship', x:78, y:62, w:6,  h:8,  ...UI_PILE_FP },
    { type:'ring-spinner',    label:'Ring / RB Portrait',layer:'interface',  x:87, y:6,  w:5,  h:7,  ...UI_RING },
    { type:'baradur',         label:'Barad-dûr',        layer:'landscape',  x:93, y:4,  w:3,  h:12, ...UI_BARAD },

    // ── Hand fan (lower-right — player's position) ──
    { type:'hand-fan',        label:'Hand (fan)',        layer:'hand',       x:68, y:76, w:30, h:24, bg:'rgba(0,0,0,0.01)', border:'rgba(186,140,30,0.06)', color:'rgba(200,200,200,0.15)', opacity:0.9 },

    // ── Card shelf (left edge) ──
    { type:'custom',          label:'Card Shelf',        layer:'interface',  x:0,  y:5,  w:5,  h:75, ...UI_SHELF, opacity:0.4 },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LAYOUT B — "Portrait Stage" (Vertical Columns)
//
// Fellowship standees on the left column, shadow on the right.
// Center column is the dramatic landscape stage — tall vertical
// features (towers, waterfalls, Pillars of the Kings) live here.
// Standee silhouettes frame the center stage like curtains.
//
// Flat ground: left column and right column.
// Dramatic terrain: center vertical stage.
//
// Player: lower-right. Hand fan: lower-right.
// Card shelf: left edge (overlaps/adjacent to fellowship column).
// ═══════════════════════════════════════════════════════════════

const LAYOUT_B = {
  name: 'B — Portrait Stage (Vertical Columns)',
  description: 'Fellowship standees left, shadow right. Center column = dramatic landscape stage for tall features. Standees frame the stage like curtains.',
  components: [
    // ── Flat ground hints ──
    { type:'custom', label:'FLAT GROUND (fellowship)', layer:'landscape', x:6,  y:8,  w:24, h:55, ...FLAT_HINT, opacity:0.5 },
    { type:'custom', label:'FLAT GROUND (shadow)',     layer:'landscape', x:70, y:8,  w:24, h:55, ...FLAT_HINT, opacity:0.5 },

    // ── Card landing zones ──
    { type:'fellowship-zone', label:'Fellowship Zone',  layer:'fellowship', x:6,  y:8,  w:24, h:55, ...Z_FP,     opacity:0.5 },
    { type:'shadow-zone',     label:'Shadow Zone',      layer:'shadow',     x:70, y:8,  w:24, h:55, ...Z_SHADOW, opacity:0.5 },
    { type:'skirmish-left',   label:'Skirmish L',       layer:'neutral',    x:32, y:15, w:16, h:30, ...Z_SKIRM,  opacity:0.3 },
    { type:'skirmish-right',  label:'Skirmish R',       layer:'neutral',    x:52, y:15, w:16, h:30, ...Z_SKIRM,  opacity:0.3 },
    { type:'adventure-path',  label:'Adventure Path',   layer:'neutral',    x:6,  y:66, w:88, h:4,  ...Z_PATH },

    // ── Solid UI ──
    { type:'phase-tracker',   label:'Phase Tracker',    layer:'interface',  x:20, y:0.3,w:56, h:3.5,...UI_PHASE },
    { type:'twilight-pool',   label:'Twilight Pool',    layer:'neutral',    x:44, y:48, w:12, h:10, ...UI_TWIL },
    { type:'pass-btn',        label:'Pass Button',      layer:'interface',  x:40, y:93, w:12, h:4.5,...UI_PASS },
    { type:'action-log',      label:'Action Log',       layer:'interface',  x:70, y:66, w:14, h:5,  ...UI_LOG },

    // ── Piles & ring-bearer ──
    { type:'opp-hand',        label:'Shadow Hand Count', layer:'shadow',    x:91, y:8,  w:3.5,h:5,  ...UI_OPP },
    { type:'opp-piles',       label:'Opp. Piles',       layer:'shadow',     x:91, y:15, w:6,  h:8,  ...UI_PILE_SH },
    { type:'your-piles',      label:'Your Piles',       layer:'fellowship', x:1,  y:66, w:6,  h:8,  ...UI_PILE_FP },
    { type:'ring-spinner',    label:'Ring / RB Portrait',layer:'interface',  x:1,  y:8,  w:5,  h:7,  ...UI_RING },
    { type:'baradur',         label:'Barad-dûr',        layer:'landscape',  x:95, y:20, w:3,  h:12, ...UI_BARAD },

    // ── Hand fan (lower-right) ──
    { type:'hand-fan',        label:'Hand (fan)',        layer:'hand',       x:68, y:76, w:30, h:24, bg:'rgba(0,0,0,0.01)', border:'rgba(186,140,30,0.06)', color:'rgba(200,200,200,0.15)', opacity:0.9 },

    // ── Card shelf (left edge) ──
    { type:'custom',          label:'Card Shelf',        layer:'interface',  x:0,  y:5,  w:5,  h:60, ...UI_SHELF, opacity:0.4 },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LAYOUT C — "Diagonal Frontier"
//
// Fellowship standees in lower-left quadrant.
// Shadow standees in upper-right quadrant.
// The diagonal between them = skirmish zone / contested ground.
// Landscape's dramatic features flow along the other diagonal
// (upper-left sky + lower-right foreground).
//
// Standee silhouettes create a natural battle line along the
// diagonal. Fellowship silhouettes are in the foreground (larger),
// shadow in the background (smaller from perspective).
//
// Flat ground: lower-left and upper-right quadrants.
// Dramatic terrain: upper-left sky/distance + lower-right foreground.
// ═══════════════════════════════════════════════════════════════

const LAYOUT_C = {
  name: 'C — Diagonal Frontier',
  description: 'Fellowship lower-left, shadow upper-right. Diagonal skirmish line. Dramatic landscape in opposite corners. Natural depth from perspective — FP standees bigger in foreground, shadow smaller in back.',
  components: [
    // ── Flat ground hints ──
    { type:'custom', label:'FLAT GROUND (fellowship)', layer:'landscape', x:6,  y:46, w:40, h:22, ...FLAT_HINT, opacity:0.5 },
    { type:'custom', label:'FLAT GROUND (shadow)',     layer:'landscape', x:52, y:6,  w:36, h:20, ...FLAT_HINT, opacity:0.5 },

    // ── Card landing zones ──
    { type:'fellowship-zone', label:'Fellowship Zone',  layer:'fellowship', x:6,  y:46, w:40, h:22, ...Z_FP,     opacity:0.5 },
    { type:'shadow-zone',     label:'Shadow Zone',      layer:'shadow',     x:52, y:6,  w:36, h:20, ...Z_SHADOW, opacity:0.5 },
    { type:'skirmish-left',   label:'Skirmish L',       layer:'neutral',    x:22, y:24, w:24, h:18, ...Z_SKIRM,  opacity:0.3 },
    { type:'skirmish-right',  label:'Skirmish R',       layer:'neutral',    x:48, y:24, w:24, h:18, ...Z_SKIRM,  opacity:0.3 },
    { type:'adventure-path',  label:'Adventure Path',   layer:'neutral',    x:10, y:70, w:78, h:4,  ...Z_PATH },

    // ── Solid UI ──
    { type:'phase-tracker',   label:'Phase Tracker',    layer:'interface',  x:20, y:0.3,w:56, h:3.5,...UI_PHASE },
    { type:'twilight-pool',   label:'Twilight Pool',    layer:'neutral',    x:42, y:30, w:12, h:10, ...UI_TWIL },
    { type:'pass-btn',        label:'Pass Button',      layer:'interface',  x:38, y:93, w:12, h:4.5,...UI_PASS },
    { type:'action-log',      label:'Action Log',       layer:'interface',  x:72, y:42, w:14, h:5,  ...UI_LOG },

    // ── Piles & ring-bearer ──
    { type:'opp-hand',        label:'Shadow Hand Count', layer:'shadow',    x:90, y:6,  w:3.5,h:5,  ...UI_OPP },
    { type:'opp-piles',       label:'Opp. Piles',       layer:'shadow',     x:90, y:13, w:6,  h:8,  ...UI_PILE_SH },
    { type:'your-piles',      label:'Your Piles',       layer:'fellowship', x:6,  y:70, w:6,  h:8,  ...UI_PILE_FP },
    { type:'ring-spinner',    label:'Ring / RB Portrait',layer:'interface',  x:1,  y:8,  w:5,  h:7,  ...UI_RING },
    { type:'baradur',         label:'Barad-dûr',        layer:'landscape',  x:94, y:28, w:3,  h:12, ...UI_BARAD },

    // ── Hand fan (lower-right) ──
    { type:'hand-fan',        label:'Hand (fan)',        layer:'hand',       x:68, y:76, w:30, h:24, bg:'rgba(0,0,0,0.01)', border:'rgba(186,140,30,0.06)', color:'rgba(200,200,200,0.15)', opacity:0.9 },

    // ── Card shelf (left edge) ──
    { type:'custom',          label:'Card Shelf',        layer:'interface',  x:0,  y:5,  w:5,  h:65, ...UI_SHELF, opacity:0.4 },
  ],
};

// ═══════════════════════════════════════════════════════════════

async function renderLayout(page, layout, filename) {
  let nextId = 1;
  const components = layout.components.map(c => ({
    ...c, id: nextId++, visible: true, zIndex: c.zIndex || 0,
    rotation: 0, opacity: c.opacity !== undefined ? c.opacity : 1,
    skewX: 0, skewY: 0, borderRadius: c.borderRadius || '4px', dashed: c.dashed || false,
  }));

  await page.evaluate((comps) => {
    state.components = comps;
    state.selectedIds = [];
    state.nextId = comps.length + 1;
    state.showNegSpace = true;
    renderAll();
  }, components);

  await sleep(300);
  await page.screenshot({ path: path.join(outDir, filename) });
  console.log(`  ✓ ${layout.name} → ${filename}`);

  writeFileSync(path.join(outDir, filename.replace('.png', '.json')), JSON.stringify({
    name: layout.name, description: layout.description, components, boardRatio: '16:9', horizonY: 42,
  }, null, 2));
  console.log(`  ✓ ${layout.name} → ${filename.replace('.png', '.json')}`);
}

(async () => {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`file://${editorPath}`, { waitUntil: 'networkidle0' });
    await sleep(600);
    console.log('\nV3 Layouts (standee-aware, locked constraints)...\n');
    await renderLayout(page, LAYOUT_A, 'v3-a-wide-horizon.png');
    await renderLayout(page, LAYOUT_B, 'v3-b-portrait-stage.png');
    await renderLayout(page, LAYOUT_C, 'v3-c-diagonal-frontier.png');
    console.log(`\nDone. Files in: ${outDir}\n`);
  } finally { await browser.close(); }
})();

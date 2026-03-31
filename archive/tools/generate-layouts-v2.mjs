/**
 * Generate 3 board layout variations — V2
 *
 * This version treats zones correctly: they are TRANSPARENT
 * card landing areas on top of a continuous landscape.
 * Zone borders are barely visible — just enough to indicate
 * where cards can be placed. The landscape shows through everywhere.
 *
 * Zones use:
 *   - Near-zero opacity backgrounds
 *   - Very faint borders (visible when hovered or during relevant phase)
 *   - Dashed outlines to distinguish from solid game elements
 *
 * Solid elements (always opaque):
 *   - Phase tracker, pass button, hand cards, pile stacks
 *   - These are the only things that permanently obscure landscape
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const editorPath = path.join(__dirname, '..', 'LotR_TCG_Board_Editor_v4.html');
const outDir = path.join(__dirname, '..', 'data', 'layouts');

// ─── Shared zone style: nearly invisible ──────────────────────────
// These are card landing zones, NOT visual panels.
// The bg is essentially transparent. The border is a whisper.

const ZONE_FP =     { bg:'rgba(186,140,30,0.03)',  border:'rgba(186,140,30,0.12)',  color:'rgba(186,140,30,0.08)',  dashed:true };
const ZONE_SHADOW = { bg:'rgba(80,50,120,0.03)',    border:'rgba(80,50,120,0.12)',   color:'rgba(80,50,120,0.08)',   dashed:true };
const ZONE_SKIRMISH={ bg:'rgba(200,60,60,0.02)',     border:'rgba(200,80,80,0.08)',   color:'rgba(200,80,80,0.06)',   dashed:true };
const ZONE_NEUTRAL ={ bg:'rgba(255,255,255,0.01)',   border:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.04)', dashed:true };

// ─── Solid elements: actually opaque ──────────────────────────────

const PHASE_TRACKER = { bg:'rgba(8,8,18,0.88)',     border:'rgba(186,140,30,0.2)',   color:'rgba(255,255,255,0.5)' };
const PASS_BTN      = { bg:'rgba(8,8,18,0.85)',     border:'rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.45)' };
const PILE_FP       = { bg:'rgba(20,50,35,0.7)',    border:'rgba(29,158,117,0.4)',   color:'rgba(100,200,150,0.6)' };
const PILE_SHADOW   = { bg:'rgba(40,20,60,0.7)',    border:'rgba(100,60,150,0.4)',   color:'rgba(160,130,200,0.6)' };
const OPP_HAND      = { bg:'rgba(40,20,60,0.7)',    border:'rgba(100,60,150,0.5)',   color:'rgba(180,150,220,0.7)' };
const TWILIGHT      = { bg:'rgba(20,40,80,0.6)',    border:'rgba(55,138,221,0.45)',  color:'rgba(130,190,240,0.8)' };
const LOG           = { bg:'rgba(0,0,0,0.5)',       border:'rgba(255,255,255,0.08)', color:'rgba(100,220,130,0.6)' };
const BARADUR       = { bg:'rgba(30,5,5,0)',        border:'rgba(150,30,30,0.4)',    color:'rgba(200,80,50,0.55)' };
const RING          = { bg:'rgba(0,0,0,0)',         border:'rgba(186,117,23,0.35)',  color:'rgba(186,117,23,0.55)' };

// ═══════════════════════════════════════════════════════════════
// LAYOUT A — "Wide Horizon"
//
// Card traffic pattern: horizontal bands.
// Shadow cards land in the upper band. Fellowship in the lower.
// Skirmish pulls cards to the mid-band. The landscape's
// dramatic center (mountains, waterfalls, towers) is always
// visible between the card bands.
//
// The "quiet corridor" runs horizontally through the middle
// of the screen — this is where the landscape's focal point
// (mountain peak, waterfall, tower) should be composed.
//
// Cards flow: top ↔ middle ↔ bottom
// Landscape focal point: center horizontal band
// ═══════════════════════════════════════════════════════════════

const LAYOUT_A = {
  name: 'Wide Horizon — Horizontal Bands',
  description: 'Cards in horizontal rows. Landscape focal point in the center strip between shadow (top) and fellowship (lower). Skirmish happens in the center.',
  components: [
    // ── Invisible card zones (landscape shows through) ──
    { type:'shadow-zone',    label:'Shadow Zone',          layer:'shadow',    x:2,  y:4,  w:75,  h:12, ...ZONE_SHADOW, opacity:0.6 },
    { type:'fellowship-zone',label:'Fellowship Zone',      layer:'fellowship',x:2,  y:62, w:75,  h:14, ...ZONE_FP, opacity:0.6 },
    { type:'skirmish-left',  label:'Skirmish L',           layer:'neutral',   x:2,  y:30, w:36,  h:16, ...ZONE_SKIRMISH, opacity:0.3 },
    { type:'skirmish-right', label:'Skirmish R',           layer:'neutral',   x:40, y:30, w:36,  h:16, ...ZONE_SKIRMISH, opacity:0.3 },

    // ── Adventure path — subtle ground track ──
    { type:'adventure-path', label:'Adventure Path',       layer:'neutral',   x:5,  y:78, w:72,  h:5,  bg:'rgba(30,20,8,0.3)', border:'rgba(120,80,30,0.2)', color:'rgba(180,140,60,0.3)', dashed:true },

    // ── Solid UI elements (actually opaque) ──
    { type:'phase-tracker',  label:'Phase Tracker',        layer:'interface', x:20, y:0.3,w:60,  h:3.5,...PHASE_TRACKER },
    { type:'twilight-pool',  label:'Twilight Pool',        layer:'neutral',   x:78, y:30, w:8,   h:10, ...TWILIGHT },
    { type:'pass-btn',       label:'Pass Button',          layer:'interface', x:38, y:93, w:10,  h:4.5,...PASS_BTN },

    // ── Card piles (small, solid, edges) ──
    { type:'opp-hand',       label:'Shadow Hand Count',    layer:'shadow',    x:80, y:4,  w:4,   h:5,  ...OPP_HAND },
    { type:'opp-piles',      label:'Opp. Piles',           layer:'shadow',    x:85, y:4,  w:7,   h:8,  ...PILE_SHADOW },
    { type:'your-piles',     label:'Your Piles',           layer:'fellowship',x:85, y:62, w:7,   h:8,  ...PILE_FP },

    // ── Ring-bearer & corruption (right edge) ──
    { type:'ring-spinner',   label:'Ring / RB Portrait',   layer:'interface', x:93, y:4,  w:5,   h:7,  ...RING },
    { type:'baradur',        label:'Barad-dûr Indicator',  layer:'landscape', x:94, y:12, w:3,   h:12, ...BARADUR },

    // ── Hand (bottom — this IS opaque, it's your cards) ──
    { type:'hand-fan',       label:'Hand (fan)',            layer:'hand',      x:50, y:56, w:50,  h:44, bg:'rgba(0,0,0,0.01)', border:'rgba(186,140,30,0.04)', color:'rgba(200,200,200,0.15)', opacity:0.95 },

    // ── Action log (small, translucent) ──
    { type:'action-log',     label:'Action Log',           layer:'interface', x:85, y:20, w:13,  h:5,  ...LOG },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LAYOUT B — "Portrait Stage"
//
// Card traffic pattern: left and right columns.
// Fellowship cards stack on the left. Shadow on the right.
// The center is a vertical "stage" where the landscape's
// focal point lives — and where skirmishes play out.
//
// Cards flow: left ↔ center ↔ right
// Landscape focal point: center vertical column
//
// This layout works especially well with tall landscape
// elements (towers, waterfalls, the Pillars of the Kings)
// because the center column is tall and narrow.
// ═══════════════════════════════════════════════════════════════

const LAYOUT_B = {
  name: 'Portrait Stage — Vertical Columns',
  description: 'Fellowship cards on the left, Shadow on the right. Center column is the landscape stage and skirmish arena. Adventure path runs across the bottom.',
  components: [
    // ── Invisible card zones ──
    { type:'fellowship-zone',label:'Fellowship Zone',      layer:'fellowship',x:1,  y:5,  w:28,  h:55, ...ZONE_FP, opacity:0.5 },
    { type:'shadow-zone',    label:'Shadow Zone',          layer:'shadow',    x:71, y:5,  w:28,  h:55, ...ZONE_SHADOW, opacity:0.5 },
    { type:'skirmish-left',  label:'Skirmish L',           layer:'neutral',   x:30, y:12, w:19,  h:35, ...ZONE_SKIRMISH, opacity:0.3 },
    { type:'skirmish-right', label:'Skirmish R',           layer:'neutral',   x:51, y:12, w:19,  h:35, ...ZONE_SKIRMISH, opacity:0.3 },

    // ── Adventure path — bottom strip ──
    { type:'adventure-path', label:'Adventure Path',       layer:'neutral',   x:5,  y:63, w:90,  h:5,  bg:'rgba(30,20,8,0.3)', border:'rgba(120,80,30,0.2)', color:'rgba(180,140,60,0.3)', dashed:true },

    // ── Solid UI ──
    { type:'phase-tracker',  label:'Phase Tracker',        layer:'interface', x:22, y:0.3,w:56,  h:3.5,...PHASE_TRACKER },
    { type:'twilight-pool',  label:'Twilight Pool',        layer:'neutral',   x:42, y:50, w:16,  h:10, ...TWILIGHT },
    { type:'pass-btn',       label:'Pass Button',          layer:'interface', x:42, y:93, w:16,  h:4.5,...PASS_BTN },

    // ── Piles ──
    { type:'your-piles',     label:'Your Piles',           layer:'fellowship',x:1,  y:62, w:7,   h:8,  ...PILE_FP },
    { type:'opp-piles',      label:'Opp. Piles',           layer:'shadow',    x:92, y:62, w:7,   h:8,  ...PILE_SHADOW },
    { type:'opp-hand',       label:'Shadow Hand Count',    layer:'shadow',    x:92, y:5,  w:4,   h:5,  ...OPP_HAND },

    // ── Ring-bearer & corruption (center top, above the stage) ──
    { type:'ring-spinner',   label:'Ring / RB Portrait',   layer:'interface', x:44, y:5,  w:5,   h:7,  ...RING },
    { type:'baradur',        label:'Barad-dûr Indicator',  layer:'landscape', x:50, y:5,  w:3,   h:10, ...BARADUR },

    // ── Hand ──
    { type:'hand-fan',       label:'Hand (fan)',            layer:'hand',      x:0,  y:58, w:50,  h:42, bg:'rgba(0,0,0,0.01)', border:'rgba(186,140,30,0.04)', color:'rgba(200,200,200,0.15)', opacity:0.95 },

    // ── Log ──
    { type:'action-log',     label:'Action Log',           layer:'interface', x:71, y:60, w:14,  h:5,  ...LOG },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LAYOUT C — "Diagonal Frontier"
//
// Card traffic: diagonal flow from lower-left to upper-right.
// Fellowship settles in the lower-left quadrant. Shadow
// occupies the upper-right. The skirmish zone runs along
// the diagonal where they meet.
//
// The landscape's quiet zones form an L-shape: top-left
// corner (sky/distance) and bottom-right (foreground).
// This naturally matches many landscape compositions where
// terrain rises from lower-left to upper-right.
//
// Hidden gem potential: details in the diagonal corridor
// that are covered during skirmish but revealed after.
//
// Cards flow: lower-left ↔ diagonal center ↔ upper-right
// Landscape focal points: top-left sky + bottom-right foreground
// ═══════════════════════════════════════════════════════════════

const LAYOUT_C = {
  name: 'Diagonal Frontier',
  description: 'Fellowship lower-left, Shadow upper-right, skirmish along the diagonal. Landscape breathes in the opposite corners. Natural good-vs-evil geography.',
  components: [
    // ── Invisible card zones ──
    { type:'fellowship-zone',label:'Fellowship Zone',      layer:'fellowship',x:1,  y:45, w:45,  h:22, ...ZONE_FP, opacity:0.5 },
    { type:'shadow-zone',    label:'Shadow Zone',          layer:'shadow',    x:54, y:5,  w:45,  h:22, ...ZONE_SHADOW, opacity:0.5 },
    { type:'skirmish-left',  label:'Skirmish L',           layer:'neutral',   x:20, y:22, w:28,  h:18, ...ZONE_SKIRMISH, opacity:0.3 },
    { type:'skirmish-right', label:'Skirmish R',           layer:'neutral',   x:50, y:22, w:28,  h:18, ...ZONE_SKIRMISH, opacity:0.3 },

    // ── Adventure path — angled, following the diagonal ──
    { type:'adventure-path', label:'Adventure Path',       layer:'neutral',   x:8,  y:70, w:84,  h:5,  bg:'rgba(30,20,8,0.3)', border:'rgba(120,80,30,0.2)', color:'rgba(180,140,60,0.3)', dashed:true },

    // ── Solid UI ──
    { type:'phase-tracker',  label:'Phase Tracker',        layer:'interface', x:22, y:0.3,w:56,  h:3.5,...PHASE_TRACKER },
    { type:'twilight-pool',  label:'Twilight Pool',        layer:'neutral',   x:44, y:28, w:12,  h:10, ...TWILIGHT },
    { type:'pass-btn',       label:'Pass Button',          layer:'interface', x:42, y:93, w:16,  h:4.5,...PASS_BTN },

    // ── Piles (tucked into their side's corner) ──
    { type:'your-piles',     label:'Your Piles',           layer:'fellowship',x:1,  y:68, w:7,   h:8,  ...PILE_FP },
    { type:'opp-piles',      label:'Opp. Piles',           layer:'shadow',    x:92, y:5,  w:7,   h:8,  ...PILE_SHADOW },
    { type:'opp-hand',       label:'Shadow Hand Count',    layer:'shadow',    x:92, y:14, w:4,   h:5,  ...OPP_HAND },

    // ── Ring-bearer (fellowship side, prominent) ──
    { type:'ring-spinner',   label:'Ring / RB Portrait',   layer:'interface', x:1,  y:5,  w:5,   h:7,  ...RING },
    { type:'baradur',        label:'Barad-dûr Indicator',  layer:'landscape', x:94, y:30, w:3,   h:12, ...BARADUR },

    // ── Hand ──
    { type:'hand-fan',       label:'Hand (fan)',            layer:'hand',      x:0,  y:56, w:50,  h:44, bg:'rgba(0,0,0,0.01)', border:'rgba(186,140,30,0.04)', color:'rgba(200,200,200,0.15)', opacity:0.95 },

    // ── Log ──
    { type:'action-log',     label:'Action Log',           layer:'interface', x:80, y:42, w:14,  h:5,  ...LOG },
  ],
};

// ═══════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════

async function renderLayout(page, layout, filename) {
  let nextId = 1;
  const components = layout.components.map(c => ({
    ...c,
    id: nextId++,
    visible: true,
    zIndex: c.zIndex || 0,
    rotation: 0,
    opacity: c.opacity !== undefined ? c.opacity : 1,
    skewX: 0,
    skewY: 0,
    borderRadius: c.borderRadius || '4px',
    dashed: c.dashed || false,
  }));

  await page.evaluate((comps) => {
    state.components = comps;
    state.selectedIds = [];
    state.nextId = comps.length + 1;
    state.showNegSpace = true;
    renderAll();
  }, components);

  await sleep(300);
  await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
  console.log(`  ✓ ${layout.name} → ${filename}`);

  const jsonFile = filename.replace('.png', '.json');
  writeFileSync(path.join(outDir, jsonFile), JSON.stringify({
    name: layout.name,
    description: layout.description,
    components,
    boardRatio: '16:9',
    horizonY: 42,
  }, null, 2));
  console.log(`  ✓ ${layout.name} → ${jsonFile}`);
}

// ═══════════════════════════════════════════════════════════════

(async () => {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`file://${editorPath}`, { waitUntil: 'networkidle0' });
    await sleep(600);

    console.log('\nGenerating V2 layouts (transparent zones on landscape)...\n');

    await renderLayout(page, LAYOUT_A, 'v2-a-wide-horizon.png');
    await renderLayout(page, LAYOUT_B, 'v2-b-portrait-stage.png');
    await renderLayout(page, LAYOUT_C, 'v2-c-diagonal-frontier.png');

    console.log(`\nDone. Files in: ${outDir}\n`);
  } finally {
    await browser.close();
  }
})();

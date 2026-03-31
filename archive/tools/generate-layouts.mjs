/**
 * Generate 3 board layout variations and screenshot each.
 * Uses the v4 editor as the rendering engine.
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const editorPath = path.join(__dirname, '..', 'LotR_TCG_Board_Editor_v4.html');
const outDir = path.join(__dirname, '..', 'data', 'layouts');

// ═══════════════════════════════════════════════════════════════
// LAYOUT A — "Landscape Dominant"
//
// Philosophy: The cinemagraph IS the experience. Zones are
// minimal, translucent, pushed to the edges. The center of
// the screen is unobstructed landscape. Cards are small and
// peripheral. The board feels like you're looking through
// a window into Middle-earth.
//
// Best for: Sites with dramatic vistas (Rivendell waterfalls,
// Helm's Deep, Black Gate). The landscape does the heavy
// lifting emotionally.
// ═══════════════════════════════════════════════════════════════

const LAYOUT_A = {
  name: 'Landscape Dominant',
  components: [
    // Backgrounds
    { type:'sky-bg',         label:'Sky BG',               layer:'landscape', x:0,  y:0,  w:100, h:35, bg:'rgba(10,8,20,0.7)',      border:'rgba(255,255,255,0.02)', color:'rgba(100,100,180,0.2)', opacity:0.6 },
    { type:'terrain-bg',     label:'Terrain BG',           layer:'landscape', x:0,  y:25, w:100, h:50, bg:'rgba(15,10,5,0.4)',      border:'rgba(255,255,255,0.02)', color:'rgba(150,120,80,0.2)', opacity:0.5 },

    // Top strip — phase tracker (narrow, unobtrusive)
    { type:'phase-tracker',  label:'Phase Tracker',        layer:'interface', x:25, y:0.5,w:50,  h:3.5,bg:'rgba(12,12,28,0.75)',   border:'rgba(255,255,255,0.1)',  color:'rgba(255,255,255,0.5)' },

    // Shadow zone — thin strip at top edge
    { type:'shadow-zone',    label:'Shadow Zone',          layer:'shadow',    x:0,  y:5,  w:78,  h:8,  bg:'rgba(28,12,48,0.25)',    border:'rgba(80,50,120,0.35)',   color:'rgba(160,130,210,0.6)', opacity:0.85 },
    { type:'opp-hand',       label:'Shadow Hand Count',    layer:'shadow',    x:0,  y:5,  w:3,   h:4,  bg:'rgba(50,30,80,0.6)',     border:'rgba(100,60,150,0.5)',   color:'rgba(180,150,220,0.7)' },
    { type:'opp-piles',      label:'Opp. Piles',           layer:'shadow',    x:80, y:5,  w:6,   h:7,  bg:'rgba(50,30,80,0.4)',     border:'rgba(100,60,150,0.35)',  color:'rgba(160,130,200,0.5)' },

    // Fellowship zone — thin strip lower-mid
    { type:'fellowship-zone',label:'Fellowship Zone',      layer:'fellowship',x:0,  y:72, w:78,  h:10, bg:'rgba(80,55,10,0.25)',    border:'rgba(186,140,30,0.35)',  color:'rgba(240,200,100,0.6)', opacity:0.85 },
    { type:'your-piles',     label:'Your Piles',           layer:'fellowship',x:80, y:72, w:6,   h:7,  bg:'rgba(29,80,50,0.4)',     border:'rgba(29,158,117,0.35)',  color:'rgba(100,200,150,0.5)' },

    // Skirmish zones — invisible until needed, center area
    { type:'skirmish-left',  label:'Skirmish L',           layer:'neutral',   x:2,  y:35, w:35,  h:12, bg:'rgba(255,255,255,0.01)', border:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.12)', dashed:true, opacity:0.4 },
    { type:'skirmish-right', label:'Skirmish R',           layer:'neutral',   x:63, y:35, w:35,  h:12, bg:'rgba(255,255,255,0.01)', border:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.12)', dashed:true, opacity:0.4 },

    // Twilight pool — small, center
    { type:'twilight-pool',  label:'Twilight Pool',        layer:'neutral',   x:40, y:35, w:10,  h:10, bg:'rgba(55,138,221,0.2)',   border:'rgba(55,138,221,0.4)',   color:'rgba(130,190,240,0.7)' },

    // Adventure path — narrow strip, lower third
    { type:'adventure-path', label:'Adventure Path',       layer:'neutral',   x:5,  y:84, w:75,  h:5,  bg:'rgba(30,20,8,0.4)',      border:'rgba(120,80,30,0.4)',    color:'rgba(180,140,60,0.45)' },

    // Hand fan — bottom-right corner, compact
    { type:'hand-fan',       label:'Hand (fan)',            layer:'hand',      x:55, y:58, w:45,  h:42, bg:'rgba(15,50,35,0.04)',    border:'rgba(186,140,30,0.08)', color:'rgba(200,200,200,0.3)', opacity:0.9 },

    // Ring-bearer — right edge, small
    { type:'ring-spinner',   label:'Ring / RB Portrait',   layer:'interface', x:88, y:5,  w:4,   h:6,  bg:'rgba(0,0,0,0)',          border:'rgba(186,117,23,0.35)',  color:'rgba(186,117,23,0.5)' },
    { type:'baradur',        label:'Barad-dûr Indicator',  layer:'landscape', x:93, y:2,  w:3,   h:10, bg:'rgba(30,5,5,0)',         border:'rgba(150,30,30,0.4)',    color:'rgba(200,80,50,0.5)' },

    // Pass button
    { type:'pass-btn',       label:'Pass Button',          layer:'interface', x:40, y:92, w:8,   h:4,  bg:'rgba(10,10,22,0.75)',    border:'rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.4)' },

    // Action log — tucked right edge
    { type:'action-log',     label:'Action Log',           layer:'interface', x:88, y:14, w:11,  h:5,  bg:'rgba(0,0,0,0.25)',       border:'rgba(255,255,255,0.06)', color:'rgba(100,220,130,0.6)' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LAYOUT B — "Card Dominant"
//
// Philosophy: This is a card game first. Zones are larger,
// more opaque, and centered. The landscape is visible in
// gaps and borders but zones are the primary visual. Cards
// are easy to read and interact with. The board feels like
// a premium digital card table with Middle-earth seen
// through the gaps.
//
// Best for: Complex board states with many cards in play.
// Readability over atmosphere.
// ═══════════════════════════════════════════════════════════════

const LAYOUT_B = {
  name: 'Card Dominant',
  components: [
    // Backgrounds
    { type:'sky-bg',         label:'Sky BG',               layer:'landscape', x:0,  y:0,  w:100, h:30, bg:'rgba(10,8,20,0.85)',     border:'rgba(255,255,255,0.03)', color:'rgba(100,100,180,0.25)' },
    { type:'terrain-bg',     label:'Terrain BG',           layer:'landscape', x:0,  y:20, w:100, h:45, bg:'rgba(15,10,5,0.65)',     border:'rgba(255,255,255,0.04)', color:'rgba(150,120,80,0.25)' },

    // Phase tracker — wider, more prominent
    { type:'phase-tracker',  label:'Phase Tracker',        layer:'interface', x:15, y:0.5,w:70,  h:5,  bg:'rgba(12,12,28,0.9)',     border:'rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.55)' },

    // Shadow zone — substantial, top area
    { type:'shadow-zone',    label:'Shadow Zone',          layer:'shadow',    x:1,  y:7,  w:98,  h:13, bg:'rgba(28,12,48,0.45)',    border:'rgba(80,50,120,0.55)',   color:'rgba(160,130,210,0.7)' },
    { type:'opp-hand',       label:'Shadow Hand Count',    layer:'shadow',    x:1,  y:7,  w:4,   h:6,  bg:'rgba(50,30,80,0.7)',     border:'rgba(100,60,150,0.6)',   color:'rgba(180,150,220,0.8)' },
    { type:'opp-piles',      label:'Opp. Piles',           layer:'shadow',    x:90, y:7,  w:9,   h:9,  bg:'rgba(50,30,80,0.55)',    border:'rgba(100,60,150,0.45)',  color:'rgba(160,130,200,0.65)' },

    // Skirmish zones — visible, bracketing twilight pool
    { type:'skirmish-left',  label:'Skirmish L',           layer:'neutral',   x:1,  y:22, w:38,  h:14, bg:'rgba(255,255,255,0.03)', border:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.2)', dashed:true },
    { type:'twilight-pool',  label:'Twilight Pool',        layer:'neutral',   x:41, y:22, w:18,  h:14, bg:'rgba(55,138,221,0.3)',   border:'rgba(55,138,221,0.55)',  color:'rgba(130,190,240,0.8)' },
    { type:'skirmish-right', label:'Skirmish R',           layer:'neutral',   x:61, y:22, w:38,  h:14, bg:'rgba(255,255,255,0.03)', border:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.2)', dashed:true },

    // Fellowship zone — substantial, below skirmish
    { type:'fellowship-zone',label:'Fellowship Zone',      layer:'fellowship',x:1,  y:38, w:98,  h:13, bg:'rgba(80,55,10,0.45)',    border:'rgba(186,140,30,0.55)',  color:'rgba(240,200,100,0.7)' },
    { type:'your-piles',     label:'Your Piles',           layer:'fellowship',x:90, y:40, w:9,   h:9,  bg:'rgba(29,80,50,0.55)',    border:'rgba(29,158,117,0.45)',  color:'rgba(100,200,150,0.65)' },

    // Adventure path — wide, prominent
    { type:'adventure-path', label:'Adventure Path',       layer:'neutral',   x:10, y:53, w:80,  h:7,  bg:'rgba(30,20,8,0.55)',     border:'rgba(120,80,30,0.55)',   color:'rgba(180,140,60,0.6)' },

    // Hand fan — full width bottom
    { type:'hand-fan',       label:'Hand (fan)',            layer:'hand',      x:50, y:55, w:50,  h:45, bg:'rgba(15,50,35,0.06)',    border:'rgba(186,140,30,0.1)',  color:'rgba(200,200,200,0.35)' },

    // Ring-bearer and corruption — right edge
    { type:'ring-spinner',   label:'Ring / RB Portrait',   layer:'interface', x:94, y:8,  w:5,   h:7,  bg:'rgba(0,0,0,0)',          border:'rgba(186,117,23,0.4)',   color:'rgba(186,117,23,0.6)' },
    { type:'baradur',        label:'Barad-dûr Indicator',  layer:'landscape', x:95, y:16, w:3,   h:12, bg:'rgba(30,5,5,0)',         border:'rgba(150,30,30,0.5)',    color:'rgba(200,80,50,0.6)' },

    // Pass & log
    { type:'pass-btn',       label:'Pass Button',          layer:'interface', x:44, y:93, w:12,  h:5,  bg:'rgba(10,10,22,0.85)',    border:'rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.45)' },
    { type:'action-log',     label:'Action Log',           layer:'interface', x:80, y:7,  w:18,  h:6,  bg:'rgba(0,0,0,0.35)',       border:'rgba(255,255,255,0.08)', color:'rgba(100,220,130,0.7)' },

    // Docks
    { type:'left-dock',      label:'Left Dock',            layer:'interface', x:0,  y:7,  w:3,   h:45, bg:'rgba(0,0,0,0.01)',       border:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.2)', dashed:true },
    { type:'right-dock',     label:'Right Dock',           layer:'interface', x:97, y:7,  w:3,   h:45, bg:'rgba(0,0,0,0.01)',       border:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.2)', dashed:true },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LAYOUT C — "Asymmetric / Cinematic Split"
//
// Philosophy: The board is split diagonally. Left side is
// the Free Peoples domain (fellowship, hand, your piles).
// Right side is Shadow territory (minions, opponent info).
// The landscape runs through a diagonal corridor between
// them — like a river or mountain pass dividing the board.
//
// This creates natural "geography" on the board itself:
// the good guys are literally on one side, evil on the other,
// with the contested adventure path between them.
//
// Best for: Creating dramatic visual tension. The diagonal
// quiet zone works beautifully with landscapes that have
// a natural left-to-right flow (rivers, roads, mountain ranges).
// ═══════════════════════════════════════════════════════════════

const LAYOUT_C = {
  name: 'Asymmetric Split',
  components: [
    // Backgrounds
    { type:'sky-bg',         label:'Sky BG',               layer:'landscape', x:0,  y:0,  w:100, h:30, bg:'rgba(10,8,20,0.75)',     border:'rgba(255,255,255,0.02)', color:'rgba(100,100,180,0.2)', opacity:0.7 },
    { type:'terrain-bg',     label:'Terrain BG',           layer:'landscape', x:0,  y:20, w:100, h:50, bg:'rgba(15,10,5,0.5)',      border:'rgba(255,255,255,0.03)', color:'rgba(150,120,80,0.2)', opacity:0.6 },

    // Phase tracker — top center
    { type:'phase-tracker',  label:'Phase Tracker',        layer:'interface', x:20, y:0.5,w:60,  h:4,  bg:'rgba(12,12,28,0.85)',    border:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.5)' },

    // ── LEFT SIDE: Fellowship Domain ──
    // Fellowship zone — left, tall
    { type:'fellowship-zone',label:'Fellowship Zone',      layer:'fellowship',x:0,  y:6,  w:35,  h:50, bg:'rgba(80,55,10,0.3)',     border:'rgba(186,140,30,0.4)',   color:'rgba(240,200,100,0.6)', opacity:0.85 },
    { type:'your-piles',     label:'Your Piles',           layer:'fellowship',x:0,  y:58, w:8,   h:8,  bg:'rgba(29,80,50,0.45)',    border:'rgba(29,158,117,0.4)',   color:'rgba(100,200,150,0.55)' },

    // ── RIGHT SIDE: Shadow Domain ──
    // Shadow zone — right, tall
    { type:'shadow-zone',    label:'Shadow Zone',          layer:'shadow',    x:65, y:6,  w:35,  h:50, bg:'rgba(28,12,48,0.3)',     border:'rgba(80,50,120,0.4)',    color:'rgba(160,130,210,0.6)', opacity:0.85 },
    { type:'opp-hand',       label:'Shadow Hand Count',    layer:'shadow',    x:96, y:6,  w:3.5, h:5,  bg:'rgba(50,30,80,0.65)',    border:'rgba(100,60,150,0.55)',  color:'rgba(180,150,220,0.75)' },
    { type:'opp-piles',      label:'Opp. Piles',           layer:'shadow',    x:92, y:58, w:7,   h:7,  bg:'rgba(50,30,80,0.45)',    border:'rgba(100,60,150,0.4)',   color:'rgba(160,130,200,0.55)' },

    // ── CENTER: Contested Ground ──
    // Skirmish — center diagonal band
    { type:'skirmish-left',  label:'Skirmish L',           layer:'neutral',   x:28, y:18, w:22,  h:18, bg:'rgba(255,255,255,0.015)',border:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.15)', dashed:true, opacity:0.6 },
    { type:'skirmish-right', label:'Skirmish R',           layer:'neutral',   x:50, y:18, w:22,  h:18, bg:'rgba(255,255,255,0.015)',border:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.15)', dashed:true, opacity:0.6 },

    // Twilight pool — center between sides
    { type:'twilight-pool',  label:'Twilight Pool',        layer:'neutral',   x:42, y:40, w:16,  h:12, bg:'rgba(55,138,221,0.22)',  border:'rgba(55,138,221,0.45)',  color:'rgba(130,190,240,0.7)' },

    // Adventure path — horizontal strip through the center, below skirmish
    { type:'adventure-path', label:'Adventure Path',       layer:'neutral',   x:10, y:58, w:80,  h:6,  bg:'rgba(30,20,8,0.45)',     border:'rgba(120,80,30,0.45)',   color:'rgba(180,140,60,0.5)' },

    // Hand fan — bottom-left, aligned with fellowship side
    { type:'hand-fan',       label:'Hand (fan)',            layer:'hand',      x:0,  y:55, w:50,  h:45, bg:'rgba(15,50,35,0.05)',    border:'rgba(186,140,30,0.08)', color:'rgba(200,200,200,0.3)', opacity:0.9 },

    // Ring-bearer — between fellowship and center
    { type:'ring-spinner',   label:'Ring / RB Portrait',   layer:'interface', x:36, y:6,  w:5,   h:7,  bg:'rgba(0,0,0,0)',          border:'rgba(186,117,23,0.4)',   color:'rgba(186,117,23,0.6)' },

    // Barad-dûr — right edge, shadow side
    { type:'baradur',        label:'Barad-dûr Indicator',  layer:'landscape', x:96, y:2,  w:3,   h:12, bg:'rgba(30,5,5,0)',         border:'rgba(150,30,30,0.45)',   color:'rgba(200,80,50,0.55)' },

    // Pass button — center bottom
    { type:'pass-btn',       label:'Pass Button',          layer:'interface', x:44, y:93, w:12,  h:5,  bg:'rgba(10,10,22,0.8)',     border:'rgba(255,255,255,0.16)', color:'rgba(255,255,255,0.4)' },

    // Action log — bottom right corner
    { type:'action-log',     label:'Action Log',           layer:'interface', x:65, y:66, w:15,  h:5,  bg:'rgba(0,0,0,0.3)',        border:'rgba(255,255,255,0.07)', color:'rgba(100,220,130,0.6)' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════

async function renderLayout(page, layout, filename) {
  // Build the component array with required defaults
  let nextId = 1;
  const components = layout.components.map(c => ({
    ...c,
    id: nextId++,
    visible: true,
    zIndex: 0,
    rotation: 0,
    opacity: c.opacity !== undefined ? c.opacity : 1,
    skewX: 0,
    skewY: 0,
    borderRadius: c.borderRadius || '4px',
    dashed: c.dashed || false,
  }));

  // Inject layout into editor
  await page.evaluate((comps, name) => {
    state.components = comps;
    state.selectedIds = [];
    state.nextId = comps.length + 1;
    state.showNegSpace = true;
    renderAll();
  }, components, layout.name);

  await sleep(300);

  // Screenshot
  await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
  console.log(`  ✓ ${layout.name} → ${filename}`);

  // Export layout JSON
  const jsonFile = filename.replace('.png', '.json');
  const layoutData = { name: layout.name, components, boardRatio: '16:9', horizonY: 42 };
  writeFileSync(path.join(outDir, jsonFile), JSON.stringify(layoutData, null, 2));
  console.log(`  ✓ ${layout.name} → ${jsonFile}`);
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

(async () => {
  // Ensure output directory exists
  const { mkdirSync, existsSync } = await import('fs');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`file://${editorPath}`, { waitUntil: 'networkidle0' });
    await sleep(600);

    console.log('\nGenerating board layout variations...\n');

    await renderLayout(page, LAYOUT_A, 'layout-a-landscape.png');
    await renderLayout(page, LAYOUT_B, 'layout-b-cards.png');
    await renderLayout(page, LAYOUT_C, 'layout-c-asymmetric.png');

    console.log(`\nAll layouts saved to: ${outDir}\n`);
  } finally {
    await browser.close();
  }
})();

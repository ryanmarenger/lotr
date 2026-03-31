import fs from 'fs';

function comp(id, type, label, layer, x, y, w, h, coverType, opts = {}) {
  return {
    id, type, label, layer, x, y, w, h,
    bg: opts.bg || 'rgba(60,60,60,0.3)',
    border: opts.border || 'rgba(150,150,150,0.4)',
    color: opts.color || 'rgba(200,200,200,0.6)',
    coverType, visible: true,
    rotation: opts.rotation || 0, skewX: opts.skewX || 0, skewY: opts.skewY || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    ...(opts.dashed ? { dashed: true } : {}),
  };
}

const shadow  = { bg:'rgba(40,18,70,0.45)',  border:'rgba(120,80,180,0.7)',  color:'rgba(190,160,240,0.9)' };
const fellow  = { bg:'rgba(100,70,15,0.45)', border:'rgba(220,170,40,0.7)',  color:'rgba(255,220,120,0.9)' };
const twilC   = { bg:'rgba(55,138,221,0.35)',border:'rgba(70,160,240,0.7)',  color:'rgba(150,210,255,0.9)' };
const advC    = { bg:'rgba(40,28,10,0.35)',  border:'rgba(160,110,40,0.5)',  color:'rgba(210,170,80,0.8)' };
const handC   = { bg:'rgba(20,65,45,0.15)',  border:'rgba(100,186,130,0.3)', color:'rgba(200,220,200,0.6)' };
const uiSolid = { bg:'rgba(12,12,28,0.9)',  border:'rgba(255,255,255,0.35)',color:'rgba(255,255,255,0.8)' };
const passC   = { bg:'rgba(10,10,22,0.88)',  border:'rgba(255,255,255,0.35)',color:'rgba(255,255,255,0.7)' };
const oppHand = { bg:'rgba(60,35,100,0.75)', border:'rgba(130,80,190,0.7)', color:'rgba(200,170,240,0.9)' };
const oppPile = { bg:'rgba(60,35,100,0.55)', border:'rgba(130,80,190,0.55)',color:'rgba(190,160,230,0.8)' };
const yrPile  = { bg:'rgba(35,100,65,0.55)', border:'rgba(50,190,140,0.55)',color:'rgba(130,220,180,0.8)' };
const logC    = { bg:'rgba(0,0,0,0.45)',     border:'rgba(255,255,255,0.2)', color:'rgba(120,240,150,0.85)' };
const ringC   = { bg:'rgba(0,0,0,0)',        border:'rgba(220,150,30,0.6)', color:'rgba(220,150,30,0.8)' };
const baradC  = { bg:'rgba(10,3,3,0.12)',    border:'rgba(150,30,30,0.3)',  color:'rgba(230,100,70,0.8)' };
const dockC   = { bg:'rgba(0,0,0,0.08)',     border:'rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.5)', dashed:true };

const layers = [
  {id:'landscape',name:'Landscape',color:'#6B4226',visible:true,expanded:true},
  {id:'shadow',name:'Shadow',color:'#7B2FBE',visible:true,expanded:true},
  {id:'neutral',name:'Neutral',color:'#4A90D9',visible:true,expanded:true},
  {id:'fellowship',name:'Fellowship',color:'#BA8C1E',visible:true,expanded:true},
  {id:'interface',name:'Interface',color:'#888',visible:true,expanded:true},
  {id:'hand',name:'Hand',color:'#2A9E75',visible:true,expanded:true},
];

// ═══════════════════════════════════════════════════════════════
// OPEN FIELD — Lateral
// Low camera across a wide plain. Fellowship left, Shadow right.
// Big open landscape between them. Horizon visible.
// No skirmish zones — just two forces and open terrain.
// ═══════════════════════════════════════════════════════════════
const openField = {
  name: 'Open Field',
  horizonY: 25, boardTiltX: 8, boardTiltY: 0,
  perspectiveDepth: 1200, vanishX: 50, vanishY: 30, boardZoom: 1.0,
  boardRatio: '16:9', layers, nextId: 16, elementConfig: {},
  components: [
    comp(1,  'phase-tracker', 'Phase Tracker', 'interface', 20, 1, 60, 4, 'opaque', uiSolid),
    comp(2,  'shadow-zone', 'Shadow Zone', 'shadow', 58, 30, 38, 22, 'dynamic', shadow),
    comp(3,  'fellowship-zone', 'Fellowship Zone', 'fellowship', 4, 30, 38, 22, 'dynamic', fellow),
    // Twilight pool — no man's land between the forces
    comp(4,  'twilight-pool', 'Twilight Pool', 'neutral', 44, 35, 12, 12, 'opaque', twilC),
    // Adventure path — the road between east and west
    comp(5,  'adventure-path', 'Adventure Path', 'neutral', 5, 55, 88, 6, 'translucent', advC),
    comp(6,  'hand-fan', 'Hand (fan)', 'hand', 55, 60, 45, 40, 'translucent', handC),
    comp(7,  'pass-btn', 'Pass Button', 'interface', 42, 93, 10, 5, 'opaque', passC),
    comp(8,  'opp-hand', 'Shadow Hand Count', 'shadow', 96, 30, 3, 5, 'opaque', oppHand),
    comp(9,  'action-log', 'Action Log', 'interface', 1, 62, 16, 8, 'opaque', logC),
    comp(10, 'opp-piles', 'Opp. Piles', 'shadow', 92, 30, 6, 7, 'opaque', oppPile),
    comp(11, 'your-piles', 'Your Piles', 'fellowship', 2, 55, 6, 7, 'opaque', yrPile),
    comp(12, 'ring-spinner', 'Ring / RB Portrait', 'interface', 94, 1, 5, 7, 'opaque', ringC),
    comp(13, 'baradur', 'Barad-dur', 'landscape', 95, 1, 4, 8, 'translucent', baradC),
    comp(14, 'left-dock', 'Left Dock', 'interface', 0, 28, 3, 32, 'translucent', dockC),
    comp(15, 'right-dock', 'Right Dock', 'interface', 97, 28, 3, 32, 'translucent', dockC),
  ],
};

// ═══════════════════════════════════════════════════════════════
// NARROW PASS — Vertical depth
// Looking down a corridor. Shadow far (top), Fellowship near (bottom).
// Open terrain between them — the landscape IS the battlefield.
// ═══════════════════════════════════════════════════════════════
const narrowPass = {
  name: 'Narrow Pass',
  horizonY: 12, boardTiltX: 18, boardTiltY: 0,
  perspectiveDepth: 900, vanishX: 50, vanishY: 15, boardZoom: 1.05,
  boardRatio: '16:9', layers, nextId: 16, elementConfig: {},
  components: [
    comp(1,  'phase-tracker', 'Phase Tracker', 'interface', 20, 1, 60, 4, 'opaque', uiSolid),
    // Shadow — far end, narrower (distance)
    comp(2,  'shadow-zone', 'Shadow Zone', 'shadow', 15, 15, 70, 14, 'dynamic', shadow),
    // Twilight pool — midpoint of the pass
    comp(3,  'twilight-pool', 'Twilight Pool', 'neutral', 42, 34, 16, 12, 'opaque', twilC),
    // Adventure path — the corridor itself
    comp(4,  'adventure-path', 'Adventure Path', 'neutral', 30, 15, 40, 38, 'translucent', advC),
    // Fellowship — foreground, wide
    comp(5,  'fellowship-zone', 'Fellowship Zone', 'fellowship', 5, 55, 90, 16, 'dynamic', fellow),
    comp(6,  'hand-fan', 'Hand (fan)', 'hand', 55, 62, 45, 38, 'translucent', handC),
    comp(7,  'pass-btn', 'Pass Button', 'interface', 42, 93, 10, 5, 'opaque', passC),
    comp(8,  'opp-hand', 'Shadow Hand Count', 'shadow', 1, 15, 3, 5, 'opaque', oppHand),
    comp(9,  'action-log', 'Action Log', 'interface', 1, 73, 16, 8, 'opaque', logC),
    comp(10, 'opp-piles', 'Opp. Piles', 'shadow', 88, 15, 6, 7, 'opaque', oppPile),
    comp(11, 'your-piles', 'Your Piles', 'fellowship', 92, 55, 6, 7, 'opaque', yrPile),
    comp(12, 'ring-spinner', 'Ring / RB Portrait', 'interface', 94, 1, 5, 7, 'opaque', ringC),
    comp(13, 'baradur', 'Barad-dur', 'landscape', 95, 1, 4, 8, 'translucent', baradC),
    comp(14, 'left-dock', 'Left Dock', 'interface', 0, 15, 3, 56, 'translucent', dockC),
    comp(15, 'right-dock', 'Right Dock', 'interface', 97, 15, 3, 56, 'translucent', dockC),
  ],
};

// ═══════════════════════════════════════════════════════════════
// DEPTHS — Diagonal, top-down
// Underground. No horizon. Fellowship lower-left, Shadow upper-right.
// Huge open diagonal of landscape between them.
// ═══════════════════════════════════════════════════════════════
const depths = {
  name: 'Depths',
  horizonY: -40, boardTiltX: 30, boardTiltY: 0,
  perspectiveDepth: 700, vanishX: 50, vanishY: 50, boardZoom: 1.15,
  boardRatio: '16:9', layers, nextId: 16, elementConfig: {},
  components: [
    comp(1,  'phase-tracker', 'Phase Tracker', 'interface', 20, 1, 60, 4, 'opaque', uiSolid),
    comp(2,  'shadow-zone', 'Shadow Zone', 'shadow', 48, 8, 48, 22, 'dynamic', shadow),
    comp(3,  'fellowship-zone', 'Fellowship Zone', 'fellowship', 4, 46, 48, 22, 'dynamic', fellow),
    comp(4,  'twilight-pool', 'Twilight Pool', 'neutral', 40, 34, 16, 12, 'opaque', twilC),
    // Diagonal path
    comp(5,  'adventure-path', 'Adventure Path', 'neutral', 8, 32, 78, 6, 'translucent', { ...advC, rotation: -10 }),
    comp(6,  'hand-fan', 'Hand (fan)', 'hand', 55, 62, 45, 38, 'translucent', handC),
    comp(7,  'pass-btn', 'Pass Button', 'interface', 42, 93, 10, 5, 'opaque', passC),
    comp(8,  'opp-hand', 'Shadow Hand Count', 'shadow', 96, 8, 3, 5, 'opaque', oppHand),
    comp(9,  'action-log', 'Action Log', 'interface', 2, 70, 16, 8, 'opaque', logC),
    comp(10, 'opp-piles', 'Opp. Piles', 'shadow', 92, 8, 6, 7, 'opaque', oppPile),
    comp(11, 'your-piles', 'Your Piles', 'fellowship', 2, 70, 6, 7, 'opaque', yrPile),
    comp(12, 'ring-spinner', 'Ring / RB Portrait', 'interface', 94, 1, 5, 7, 'opaque', ringC),
    comp(13, 'baradur', 'Barad-dur', 'landscape', 95, 1, 4, 8, 'translucent', baradC),
    comp(14, 'left-dock', 'Left Dock', 'interface', 0, 8, 3, 62, 'translucent', dockC),
    comp(15, 'right-dock', 'Right Dock', 'interface', 97, 8, 3, 62, 'translucent', dockC),
  ],
};

// ═══════════════════════════════════════════════════════════════
// SANCTUARY — Fellowship protected in center
// Shadow looms from above. Fellowship sheltered in the heart.
// Open landscape acts as the buffer/defense between them.
// ═══════════════════════════════════════════════════════════════
const sanctuary = {
  name: 'Sanctuary',
  horizonY: 5, boardTiltX: 20, boardTiltY: 0,
  perspectiveDepth: 800, vanishX: 50, vanishY: 35, boardZoom: 1.08,
  boardRatio: '16:9', layers, nextId: 16, elementConfig: {},
  components: [
    comp(1,  'phase-tracker', 'Phase Tracker', 'interface', 20, 1, 60, 4, 'opaque', uiSolid),
    // Shadow — broad, pressing from the top
    comp(2,  'shadow-zone', 'Shadow Zone', 'shadow', 5, 8, 90, 16, 'dynamic', shadow),
    // Twilight pool — the threshold between shadow and safety
    comp(3,  'twilight-pool', 'Twilight Pool', 'neutral', 40, 28, 16, 12, 'opaque', twilC),
    // Fellowship — center, defended
    comp(4,  'fellowship-zone', 'Fellowship Zone', 'fellowship', 15, 44, 70, 18, 'dynamic', fellow),
    // Adventure path — below the sanctuary
    comp(5,  'adventure-path', 'Adventure Path', 'neutral', 10, 65, 70, 6, 'translucent', advC),
    comp(6,  'hand-fan', 'Hand (fan)', 'hand', 55, 62, 45, 38, 'translucent', handC),
    comp(7,  'pass-btn', 'Pass Button', 'interface', 42, 93, 10, 5, 'opaque', passC),
    comp(8,  'opp-hand', 'Shadow Hand Count', 'shadow', 1, 8, 3, 5, 'opaque', oppHand),
    comp(9,  'action-log', 'Action Log', 'interface', 1, 73, 16, 8, 'opaque', logC),
    comp(10, 'opp-piles', 'Opp. Piles', 'shadow', 92, 8, 6, 7, 'opaque', oppPile),
    comp(11, 'your-piles', 'Your Piles', 'fellowship', 92, 44, 6, 7, 'opaque', yrPile),
    comp(12, 'ring-spinner', 'Ring / RB Portrait', 'interface', 94, 1, 5, 7, 'opaque', ringC),
    comp(13, 'baradur', 'Barad-dur', 'landscape', 95, 1, 4, 8, 'translucent', baradC),
    comp(14, 'left-dock', 'Left Dock', 'interface', 0, 8, 3, 60, 'translucent', dockC),
    comp(15, 'right-dock', 'Right Dock', 'interface', 97, 8, 3, 60, 'translucent', dockC),
  ],
};

fs.writeFileSync('board-editor/open-field.json', JSON.stringify(openField, null, 2));
fs.writeFileSync('board-editor/narrow-pass.json', JSON.stringify(narrowPass, null, 2));
fs.writeFileSync('board-editor/depths.json', JSON.stringify(depths, null, 2));
fs.writeFileSync('board-editor/sanctuary.json', JSON.stringify(sanctuary, null, 2));
console.log('Generated 4 layouts (no skirmish zones).');

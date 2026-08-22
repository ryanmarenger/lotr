import ExcelJS from 'exceljs';
import path from 'path';

const workbook = new ExcelJS.Workbook();
workbook.creator = 'LOTR TCG Digital';
workbook.created = new Date();

const ws = workbook.addWorksheet('Art Checklist', {
  views: [{ state: 'frozen', ySplit: 1 }],
});

// Column definitions
ws.columns = [
  { header: 'Asset #',            key: 'num',         width: 9  },
  { header: 'Filename',           key: 'file',        width: 16 },
  { header: 'Category',           key: 'cat',         width: 16 },
  { header: 'Description',        key: 'desc',        width: 40 },
  { header: 'Purpose',            key: 'purpose',     width: 35 },
  { header: 'Format',             key: 'fmt',         width: 8  },
  { header: 'Dimensions',         key: 'dims',        width: 18 },
  { header: 'Art Direction',      key: 'artdir',      width: 45 },
  { header: 'Completed?',         key: 'done',        width: 12 },
  { header: 'Review',             key: 'review',      width: 10 },
  { header: 'Feedback',           key: 'feedback',    width: 40 },
  { header: 'Questions/Problems', key: 'questions',   width: 40 },
];

// Style header row
const headerRow = ws.getRow(1);
headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D2D2D' } };
headerRow.alignment = { vertical: 'middle', wrapText: true };
headerRow.height = 24;

// Assets data
const assets = [
  // ── 1. Phase Jewel ──
  { num: '1.01', file: '1.01.svg', cat: 'Phase Jewel', desc: 'Center icon: Fellowship phase', purpose: 'Center of phase jewel widget during Fellowship phase', fmt: 'SVG', dims: '48x48', artdir: 'Shield or cloaked travelers. Gold tones (#c9a530). Should read clearly at 24px.' },
  { num: '1.02', file: '1.02.svg', cat: 'Phase Jewel', desc: 'Center icon: Shadow phase', purpose: 'Center of phase jewel widget during Shadow phase', fmt: 'SVG', dims: '48x48', artdir: 'Eye of Sauron or dark presence. Violet tones (#9b5de5). Menacing but elegant.' },
  { num: '1.03', file: '1.03.svg', cat: 'Phase Jewel', desc: 'Center icon: Maneuver phase', purpose: 'Center of phase jewel widget during Maneuver phase', fmt: 'SVG', dims: '48x48', artdir: 'Chess piece or strategic footprints. Teal tones (#45b7aa). Tactical, deliberate.' },
  { num: '1.04', file: '1.04.svg', cat: 'Phase Jewel', desc: 'Center icon: Archery phase', purpose: 'Center of phase jewel widget during Archery phase', fmt: 'SVG', dims: '48x48', artdir: 'Drawn bow or crossed arrows. Green tones (#5aad5a). Tense, aimed.' },
  { num: '1.05', file: '1.05.svg', cat: 'Phase Jewel', desc: 'Center icon: Assignment phase', purpose: 'Center of phase jewel widget during Assignment phase', fmt: 'SVG', dims: '48x48', artdir: 'Pointing gauntlet or opposing shields. Amber tones (#d4893e). Warning, choosing.' },
  { num: '1.06', file: '1.06.svg', cat: 'Phase Jewel', desc: 'Center icon: Skirmish phase', purpose: 'Center of phase jewel widget during Skirmish phase', fmt: 'SVG', dims: '48x48', artdir: 'Crossed swords or blade clash. Red tones (#c43c3c). Violent, decisive.' },
  { num: '1.07', file: '1.07.svg', cat: 'Phase Jewel', desc: 'Center icon: Regroup phase', purpose: 'Center of phase jewel widget during Regroup phase', fmt: 'SVG', dims: '48x48', artdir: 'Campfire or healing star. Silver tones (#b0b8c8). Calm, restorative.' },
  { num: '1.08', file: '1.08.png', cat: 'Phase Jewel', desc: 'Jewel ring: idle (all dim)', purpose: 'Phase jewel ring when no phase is active (between turns, game start)', fmt: 'PNG', dims: '96x96', artdir: '7 jewels arranged in a circle. ALL gray/dim. Dark metallic ring. Transparent center hole for icon overlay. Transparent background.' },
  { num: '1.09', file: '1.09.png', cat: 'Phase Jewel', desc: 'Jewel ring: Fellowship active', purpose: 'Phase jewel ring during Fellowship phase', fmt: 'PNG', dims: '96x96', artdir: 'Gold jewel GLOWS (top position). Other 6 dim. Same ring as 1.08 but with one lit jewel. Transparent bg.' },
  { num: '1.10', file: '1.10.png', cat: 'Phase Jewel', desc: 'Jewel ring: Shadow active', purpose: 'Phase jewel ring during Shadow phase', fmt: 'PNG', dims: '96x96', artdir: 'Violet jewel GLOWS. Gold jewel = trail (colored but not glowing). Others dim. Transparent bg.' },
  { num: '1.11', file: '1.11.png', cat: 'Phase Jewel', desc: 'Jewel ring: Maneuver active', purpose: 'Phase jewel ring during Maneuver phase', fmt: 'PNG', dims: '96x96', artdir: 'Teal jewel GLOWS. Gold + violet = trail. Others dim. Transparent bg.' },
  { num: '1.12', file: '1.12.png', cat: 'Phase Jewel', desc: 'Jewel ring: Archery active', purpose: 'Phase jewel ring during Archery phase', fmt: 'PNG', dims: '96x96', artdir: 'Green jewel GLOWS. Gold + violet + teal = trail. Others dim. Transparent bg.' },
  { num: '1.13', file: '1.13.png', cat: 'Phase Jewel', desc: 'Jewel ring: Assignment active', purpose: 'Phase jewel ring during Assignment phase', fmt: 'PNG', dims: '96x96', artdir: 'Amber jewel GLOWS. 4 trailing. Others dim. Transparent bg.' },
  { num: '1.14', file: '1.14.png', cat: 'Phase Jewel', desc: 'Jewel ring: Skirmish active', purpose: 'Phase jewel ring during Skirmish phase', fmt: 'PNG', dims: '96x96', artdir: 'Red jewel GLOWS. 5 trailing. Silver dim. Transparent bg.' },
  { num: '1.15', file: '1.15.png', cat: 'Phase Jewel', desc: 'Jewel ring: Regroup active', purpose: 'Phase jewel ring during Regroup phase', fmt: 'PNG', dims: '96x96', artdir: 'Silver jewel GLOWS. All 6 others = trail (colored, not glowing). Transparent bg.' },

  // ── 2. Adventure HUD ──
  { num: '2.01', file: '2.01.svg', cat: 'Adventure HUD', desc: 'Adventure/journey icon', purpose: 'Compact site indicator in HUD. Sits next to site counter and name label.', fmt: 'SVG', dims: '48x48', artdir: 'Compass rose, map scroll, or journey symbol. Warm gold/parchment tones. Must read at 24px. Tolkien aesthetic.' },
  { num: '2.02', file: '2.02.svg', cat: 'Adventure HUD', desc: 'Adventure icon: hover/active state', purpose: 'Hover state of adventure icon (optional — can use CSS glow instead)', fmt: 'SVG', dims: '48x48', artdir: 'Same as 2.01 but slightly more ornate or glowing. Optional asset — skip if CSS glow is sufficient.' },

  // ── 3. Hand Thumbs ──
  { num: '3.01', file: '3.01.png', cat: 'Hand Thumb', desc: 'Thumb: Shire / Hobbit', purpose: 'Holds the card fan at lower-right corner. Shown for Shire-majority FP decks.', fmt: 'PNG', dims: '~300px wide', artdir: 'Small, weathered hobbit thumb. Bare, slightly dirty, warm skin. Bottom portion extends off-canvas. Transparent bg. Viewed from slightly above.' },
  { num: '3.02', file: '3.02.png', cat: 'Hand Thumb', desc: 'Thumb: Gondor', purpose: 'Card fan thumb for Gondor-majority decks', fmt: 'PNG', dims: '~300px wide', artdir: 'Mailed gauntlet. Steel plate, leather underneath. Noble, battle-worn. Transparent bg.' },
  { num: '3.03', file: '3.03.png', cat: 'Hand Thumb', desc: 'Thumb: Rohan', purpose: 'Card fan thumb for Rohan-majority decks', fmt: 'PNG', dims: '~300px wide', artdir: 'Leather riding glove. Worn, golden-brown. Horse-lord aesthetic. Transparent bg.' },
  { num: '3.04', file: '3.04.png', cat: 'Hand Thumb', desc: 'Thumb: Elven', purpose: 'Card fan thumb for Elven-majority decks', fmt: 'PNG', dims: '~300px wide', artdir: 'Slender, pale fingers. Elegant, faintly luminous. Otherworldly grace. Transparent bg.' },
  { num: '3.05', file: '3.05.png', cat: 'Hand Thumb', desc: 'Thumb: Dwarven', purpose: 'Card fan thumb for Dwarven-majority decks', fmt: 'PNG', dims: '~300px wide', artdir: 'Thick, calloused thumb. Broad, stone-dust on skin. Miner/smith hands. Transparent bg.' },
  { num: '3.06', file: '3.06.png', cat: 'Hand Thumb', desc: 'Thumb: Sauron (Shadow)', purpose: 'Card fan thumb for Sauron-culture Shadow decks', fmt: 'PNG', dims: '~300px wide', artdir: 'Gnarled orc claw. Dark greenish skin, scarred, clawed nail. Menacing. Transparent bg.' },
  { num: '3.07', file: '3.07.png', cat: 'Hand Thumb', desc: 'Thumb: Isengard (Shadow)', purpose: 'Card fan thumb for Isengard-culture Shadow decks', fmt: 'PNG', dims: '~300px wide', artdir: 'Iron-plated Uruk hand. Black steel, brutal, industrial. Transparent bg.' },
  { num: '3.08', file: '3.08.png', cat: 'Hand Thumb', desc: 'Thumb: Ringwraith (Shadow)', purpose: 'Card fan thumb for Ringwraith-culture Shadow decks', fmt: 'PNG', dims: '~300px wide', artdir: 'Spectral, semi-transparent. Wispy, pale, ghostly. You can faintly see through it. Transparent bg.' },

  // ── 4. Barad-dur Tower ──
  { num: '4.01', file: '4.01.png', cat: 'Barad-dur Tower', desc: 'Tower: distant (0-1 burdens)', purpose: 'Corruption meter at lowest level. Tower small in upper-right of board.', fmt: 'PNG', dims: '200x400', artdir: 'Full tower visible from base to Eye. Small, faint, far away. Straight-on perspective. Transparent bg. Should feel like a distant threat on the horizon.' },
  { num: '4.02', file: '4.02.png', cat: 'Barad-dur Tower', desc: 'Tower: approaching (2-4 burdens)', purpose: 'Corruption meter, early warning', fmt: 'PNG', dims: '200x400', artdir: 'Tower larger, closer. Upper half dominant. Camera edges in. Starting to feel present. Transparent bg.' },
  { num: '4.03', file: '4.03.png', cat: 'Barad-dur Tower', desc: 'Tower: looming (5-7 burdens)', purpose: 'Corruption meter, mid-danger', fmt: 'PNG', dims: '200x400', artdir: 'Tower fills the frame. Camera lifted, looking up at the Eye. Eye clearly visible and active. Oppressive. Transparent bg.' },
  { num: '4.04', file: '4.04.png', cat: 'Barad-dur Tower', desc: 'Tower: oppressive (8-9 burdens)', purpose: 'Corruption meter, high danger', fmt: 'PNG', dims: '200x400', artdir: 'Close-up. Eye is the primary visual. Tower structure drops away below. Camera slightly above eye level. Dread. Transparent bg.' },
  { num: '4.05', file: '4.05.png', cat: 'Barad-dur Tower', desc: 'Tower: consuming (10-11 burdens)', purpose: 'Corruption meter, critical danger', fmt: 'PNG', dims: '200x400', artdir: 'Very close. Eye of Sauron dominates. Looking down at the tower falling away below you. Nearly consumed. Transparent bg.' },
  { num: '4.06', file: '4.06.png', cat: 'Barad-dur Tower', desc: 'Tower: overwhelming (12 burdens)', purpose: 'Corruption meter at max — one step from game loss', fmt: 'PNG', dims: '200x400', artdir: 'Eye fills the entire frame. Tower barely visible. Maximum oppression and dread. The gaze is inescapable. Transparent bg.' },

  // ── 5. Site Landscapes ──
  { num: '5.01', file: '5.01.mp4', cat: 'Site Landscape', desc: 'Hobbiton / Bag End', purpose: 'Background cinemagraph for Hobbiton site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Green hills, round doors, chimney smoke drifting. Warm, peaceful, big sky. Low horizon ~25%. Animate: smoke, garden flutter, cloud shadows.' },
  { num: '5.02', file: '5.02.mp4', cat: 'Site Landscape', desc: 'Shire Countryside', purpose: 'Background for Shire countryside site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Rolling hills, stone walls, distant farmsteads. Gentle, open. Animate: cloud shadows rolling across hills, grass sway.' },
  { num: '5.03', file: '5.03.mp4', cat: 'Site Landscape', desc: 'Buckleberry Ferry', purpose: 'Background for Buckleberry Ferry site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'River crossing at dusk. Fog rolling off water. Wooden ferry. Animate: river flow, fog drift, lantern flicker.' },
  { num: '5.04', file: '5.04.mp4', cat: 'Site Landscape', desc: 'Bree Town', purpose: 'Background for Bree site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Rain-soaked medieval village. Cobblestones, timber buildings, lanterns. Night/dusk. Animate: rain, puddle ripples, lantern flicker.' },
  { num: '5.05', file: '5.05.mp4', cat: 'Site Landscape', desc: 'Forest Road / Trollshaw', purpose: 'Background for forest road site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Dark forest path, filtered light through canopy. Ancient trees. Animate: dappled light movement, leaf sway, mist.' },
  { num: '5.06', file: '5.06.mp4', cat: 'Site Landscape', desc: 'Midgewater Marshes', purpose: 'Background for marsh/moor site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Flat boggy marshland. Mist, still water, dead trees. Dreary. Animate: mist crawl, water surface ripple, insect lights.' },
  { num: '5.07', file: '5.07.mp4', cat: 'Site Landscape', desc: 'Weathertop', purpose: 'Background for Weathertop site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Exposed hilltop ruins against dark sky. Ancient stone circle. Windswept. Animate: wind across ruins, dark cloud churn.' },
  { num: '5.08', file: '5.08.mp4', cat: 'Site Landscape', desc: 'Hollin', purpose: 'Background for Hollin site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Bare hills under grey sky. Treeless, ancient, empty. Birds once sang here. Animate: grey sky drift, grass ripple.' },
  { num: '5.09', file: '5.09.mp4', cat: 'Site Landscape', desc: 'Rivendell', purpose: 'Background for all Rivendell site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Waterfalls, autumn foliage, elven architecture in a valley. Majestic, vertical. Horizon ~30%. Animate: waterfall cascade, autumn leaves drift.' },
  { num: '5.10', file: '5.10.mp4', cat: 'Site Landscape', desc: 'Caradhras', purpose: 'Background for mountain pass site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Snowy mountain pass. Blizzard conditions. Cold, hostile. Horizon ~50%. Animate: blizzard, snow drift, wind.' },
  { num: '5.11', file: '5.11.mp4', cat: 'Site Landscape', desc: 'Moria Entrance / Doors of Durin', purpose: 'Background for Moria entrance site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Dark still lake, ancient stone doors. Moonlight on water. Ominous. Animate: faint water ripple, moonlight shimmer on doors.' },
  { num: '5.12', file: '5.12.mp4', cat: 'Site Landscape', desc: 'Moria Halls / Dwarrowdelf', purpose: 'Background for Moria interior site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Vast underground halls, massive pillars into darkness. Torch light. Horizon ~65%. Animate: torch flicker, dust motes in light shafts.' },
  { num: '5.13', file: '5.13.mp4', cat: 'Site Landscape', desc: "Balin's Tomb", purpose: "Background for Balin's Tomb site card", fmt: 'MP4', dims: '1920x1080', artdir: 'Single shaft of light falling on stone sarcophagus. Dust motes. Intimate, somber. Animate: dust in light shaft, faint flicker.' },
  { num: '5.14', file: '5.14.mp4', cat: 'Site Landscape', desc: 'Bridge of Khazad-dum', purpose: 'Background for Bridge site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Narrow stone bridge over vast chasm. Lava glow far below. Most claustrophobic. Horizon ~65%. Animate: lava glow pulse, rising embers.' },
  { num: '5.15', file: '5.15.mp4', cat: 'Site Landscape', desc: 'Zirakzigil Peak', purpose: 'Background for Zirakzigil site card', fmt: 'MP4', dims: '1920x1080', artdir: 'Mountain peak above clouds. Lightning. Dramatic, exposed. Animate: lightning, cloud churn below.' },
  { num: '5.16', file: '5.16.mp4', cat: 'Site Landscape', desc: 'Dimrill Dale', purpose: 'Background for Dimrill Dale site card', fmt: 'MP4', dims: '1920x1080', artdir: 'Sunlit valley — relief after Moria. Green and gold, breathing room. Horizon ~28%. Animate: sunlight, gentle breeze, water sparkle.' },
  { num: '5.17', file: '5.17.mp4', cat: 'Site Landscape', desc: 'Lothlorien', purpose: 'Background for all Lothlorien site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Mallorn trees, silver-gold light filtering through. Ethereal, otherworldly. Animate: silver-gold leaf shimmer, soft light pulse.' },
  { num: '5.18', file: '5.18.mp4', cat: 'Site Landscape', desc: 'River Anduin', purpose: 'Background for Anduin river site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Wide flowing river, open sky. Journey calm. Lowest horizon area ~22%. Animate: river current, gentle waves, cloud reflection.' },
  { num: '5.19', file: '5.19.mp4', cat: 'Site Landscape', desc: 'Argonath / Pillars of the Kings', purpose: 'Background for Argonath site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Colossal stone king statues flanking river. Monumental, awe. Animate: water flowing past stone feet, mist rising.' },
  { num: '5.20', file: '5.20.mp4', cat: 'Site Landscape', desc: 'Amon Hen', purpose: 'Background for Amon Hen site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Forested hill above lake. Ancient ruins, dappled light. Tension. Horizon ~40%. Animate: forest canopy sway, dappled light.' },
  { num: '5.21', file: '5.21.mp4', cat: 'Site Landscape', desc: 'Rohan Open Plains', purpose: 'Background for Rohan plains site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Endless golden grassland. Maximum spaciousness. Lowest horizon in game ~18%. Animate: grass rippling in wind waves, cloud shadows.' },
  { num: '5.22', file: '5.22.mp4', cat: 'Site Landscape', desc: 'Rohan Camp', purpose: 'Background for Rohan camp site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Tents and campfires on plains. Night/dusk. Army gathering. Animate: campfire flicker, tent flutter, smoke rise.' },
  { num: '5.23', file: '5.23.mp4', cat: 'Site Landscape', desc: 'Edoras / Golden Hall', purpose: 'Background for Edoras site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Hill-top city, Golden Hall gleaming at summit. Windswept. Horizon ~30%. Animate: windswept banners, golden gleam on hall.' },
  { num: '5.24', file: '5.24.mp4', cat: 'Site Landscape', desc: 'Fangorn Forest', purpose: 'Background for Fangorn site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Ancient primeval forest, deep green light. Twisted trees, claustrophobic. Horizon ~60%. Animate: ancient trees swaying slowly, green light filter.' },
  { num: '5.25', file: '5.25.mp4', cat: 'Site Landscape', desc: 'Dunharrow', purpose: 'Background for Dunharrow site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Mountain encampment, rocky plateau. Dark mountain entrance visible. Animate: mountain wind, torch flicker.' },
  { num: '5.26', file: '5.26.mp4', cat: 'Site Landscape', desc: 'Paths of the Dead', purpose: 'Background for Paths of Dead site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Underground, spectral green light. Ghost-haunted passage. Animate: spectral green pulse, ghost-light drift.' },
  { num: '5.27', file: '5.27.mp4', cat: 'Site Landscape', desc: "Helm's Deep Approach", purpose: "Background for Helm's Deep approach cards", fmt: 'MP4', dims: '1920x1080', artdir: 'Valley approach to fortress. Rain, dark sky, distant torches. Animate: rain, distant torch flicker.' },
  { num: '5.28', file: '5.28.mp4', cat: 'Site Landscape', desc: "Helm's Deep Walls", purpose: "Background for Helm's Deep wall/siege cards", fmt: 'MP4', dims: '1920x1080', artdir: 'Fortress under siege. Driving rain on stone, army torches in distance. Horizon ~50%. Animate: rain on stone, torch flicker.' },
  { num: '5.29', file: '5.29.mp4', cat: 'Site Landscape', desc: "Helm's Deep Interior", purpose: "Background for Helm's Deep interior cards", fmt: 'MP4', dims: '1920x1080', artdir: 'Stone halls, armories, torches. Refuge. Animate: torch flicker, stone glisten from moisture.' },
  { num: '5.30', file: '5.30.mp4', cat: 'Site Landscape', desc: 'Isengard / Orthanc', purpose: 'Background for Isengard site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Dark industrial tower, pits, smoke, machinery. Horizon ~40%. Animate: furnace glow, smoke rise, machinery movement.' },
  { num: '5.31', file: '5.31.mp4', cat: 'Site Landscape', desc: 'Isengard Flooded', purpose: 'Background for flooded Isengard cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Water flooding pits, Orthanc standing in water. Ents victory. Animate: water currents, debris drift, Orthanc reflection.' },
  { num: '5.32', file: '5.32.mp4', cat: 'Site Landscape', desc: 'Minas Tirith Exterior', purpose: 'Background for Minas Tirith exterior cards', fmt: 'MP4', dims: '1920x1080', artdir: 'White stone city in tiers. Beacon visible. Horizon ~35%. Animate: banner ripple, beacon glow, wind.' },
  { num: '5.33', file: '5.33.mp4', cat: 'Site Landscape', desc: 'Minas Tirith Interior', purpose: 'Background for Minas Tirith interior cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Grand stone halls, pillars, throne room. Torch-lit. Animate: torch light on stone, dust motes.' },
  { num: '5.34', file: '5.34.mp4', cat: 'Site Landscape', desc: 'Osgiliath', purpose: 'Background for Osgiliath site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Ruined river city, broken bridges, rubble. Fog. Horizon ~50%. Animate: fog under broken bridges, water flow.' },
  { num: '5.35', file: '5.35.mp4', cat: 'Site Landscape', desc: 'Pelennor Fields', purpose: 'Background for Pelennor site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Vast battlefield. Smoke, distant fire, armies. Animate: smoke drift, distant fire glow.' },
  { num: '5.36', file: '5.36.mp4', cat: 'Site Landscape', desc: 'Ithilien', purpose: 'Background for Ithilien site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Green overgrown land, hidden beauty. Rangers territory. Animate: green overgrowth sway, hidden sun patches.' },
  { num: '5.37', file: '5.37.mp4', cat: 'Site Landscape', desc: 'Morgul Vale', purpose: 'Background for Morgul Vale site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Sickly green-white light, dead flowers. Oppressive. Horizon ~55%. Animate: sickly green-white pulse, dead air shimmer.' },
  { num: '5.38', file: '5.38.mp4', cat: 'Site Landscape', desc: 'Cirith Ungol', purpose: 'Background for Cirith Ungol site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Dark mountain pass, stone stairs, spider territory. Animate: faint torchlight flicker, cobweb sway.' },
  { num: '5.39', file: '5.39.mp4', cat: 'Site Landscape', desc: 'Black Gate / Morannon', purpose: 'Background for Black Gate site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Vast dark plain, the Gate. INTENTIONALLY open — terror is vastness, not enclosure. Low horizon ~20%. Animate: ash fall, Eye pulse in far distance.' },
  { num: '5.40', file: '5.40.mp4', cat: 'Site Landscape', desc: 'Mordor Wastes', purpose: 'Background for Mordor waste site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Ashen desolation. Grey-black, no life. Heat shimmer. Animate: heat shimmer, ash drift.' },
  { num: '5.41', file: '5.41.mp4', cat: 'Site Landscape', desc: 'Mount Doom', purpose: 'Background for Mount Doom site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Active volcano, lava rivers, red sky. The end. Animate: lava rivers flow, red sky churn, ember rise.' },
  { num: '5.42', file: '5.42.mp4', cat: 'Site Landscape', desc: 'Grey Havens', purpose: 'Background for Grey Havens site card', fmt: 'MP4', dims: '1920x1080', artdir: 'Elven harbor, golden sunset on water. Bittersweet departure. Animate: gentle waves, golden sunset shimmer on water.' },
  { num: '5.43', file: '5.43.mp4', cat: 'Site Landscape', desc: 'Emyn Muil', purpose: 'Background for Emyn Muil site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Grey rocky maze, jagged, barren. Lost, confusing. Animate: sparse wind, grey sky movement.' },
  { num: '5.44', file: '5.44.mp4', cat: 'Site Landscape', desc: 'Dead Marshes', purpose: 'Background for Dead Marshes site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Stagnant water, ghost-lights beneath surface. Haunted, treacherous. Animate: ghost-light flicker beneath water, mist crawl.' },
  { num: '5.45', file: '5.45.mp4', cat: 'Site Landscape', desc: "Shelob's Lair", purpose: "Background for Shelob's Lair site cards", fmt: 'MP4', dims: '1920x1080', artdir: 'Total darkness, faint web glints catching distant light. Claustrophobic. Animate: faint web glint movement.' },
  { num: '5.46', file: '5.46.mp4', cat: 'Site Landscape', desc: 'Henneth Annun', purpose: 'Background for Henneth Annun site cards', fmt: 'MP4', dims: '1920x1080', artdir: 'Waterfall curtain hiding cave. Hidden beauty, sanctuary. Animate: waterfall curtain flow, hidden cave light.' },

  // ── 6. Tokens ──
  { num: '6.01', file: '6.01.svg', cat: 'Token', desc: 'Wound token', purpose: 'Displayed on wounded characters. Stacked on upper-right of card.', fmt: 'SVG', dims: 'scales 16-32px', artdir: 'Red glowing dot or blood drop. Must read clearly when tiny (16px). Stacks visually when multiples shown.' },
  { num: '6.02', file: '6.02.svg', cat: 'Token', desc: 'Twilight token', purpose: 'Displayed in Twilight Pool zone. Count indicates Shadow resources.', fmt: 'SVG', dims: 'scales 16-32px', artdir: 'Blue-white glowing coin or crescent moon. Mystical, ethereal.' },
  { num: '6.03', file: '6.03.svg', cat: 'Token', desc: 'Burden token', purpose: 'Corruption tracker. Each burden brings Ring-bearer closer to corruption.', fmt: 'SVG', dims: 'scales 16-32px', artdir: 'Dark gold Ring motif. Small, ominous. Each one is a weight on the soul.' },
  { num: '6.04', file: '6.04.svg', cat: 'Token', desc: 'Threat token', purpose: 'Threat tracker for certain game effects', fmt: 'SVG', dims: 'scales 16-32px', artdir: 'Dark fire or ember. Danger indicator.' },
  { num: '6.05', file: '6.05.svg', cat: 'Token', desc: 'Strength modifier (+)', purpose: 'Overlaid on cards with strength bonuses', fmt: 'SVG', dims: 'scales 16-32px', artdir: 'Upward sword or reinforced shield. Positive, empowering.' },
  { num: '6.06', file: '6.06.svg', cat: 'Token', desc: 'Strength modifier (-)', purpose: 'Overlaid on cards with strength penalties', fmt: 'SVG', dims: 'scales 16-32px', artdir: 'Broken shield or downward arrow. Weakened.' },
  { num: '6.07', file: '6.07.svg', cat: 'Token', desc: 'Vitality marker', purpose: 'Shows remaining vitality on characters', fmt: 'SVG', dims: 'scales 16-32px', artdir: 'Heart flame. Life force.' },
  { num: '6.08', file: '6.08.svg', cat: 'Token', desc: 'Exerted marker', purpose: 'Shows character has been exerted (tapped/used)', fmt: 'SVG', dims: 'scales 16-32px', artdir: 'Spiral or exhaustion mark. Spent, tired.' },

  // ── 7. Icons ──
  { num: '7.01', file: '7.01.svg', cat: 'Icon', desc: 'Card type: Companion', purpose: 'Filter UI, card display, deck builder labels', fmt: 'SVG', dims: '24x24', artdir: 'Cloaked traveler figure. Simple silhouette, clear at 16px.' },
  { num: '7.02', file: '7.02.svg', cat: 'Icon', desc: 'Card type: Minion', purpose: 'Filter UI, card display', fmt: 'SVG', dims: '24x24', artdir: 'Armored dark figure. Threatening silhouette.' },
  { num: '7.03', file: '7.03.svg', cat: 'Icon', desc: 'Card type: Ally', purpose: 'Filter UI, card display', fmt: 'SVG', dims: '24x24', artdir: 'Standing figure, non-combatant. Helpful posture.' },
  { num: '7.04', file: '7.04.svg', cat: 'Icon', desc: 'Card type: Artifact', purpose: 'Filter UI, card display', fmt: 'SVG', dims: '24x24', artdir: 'Glowing relic/object. Magical, ancient.' },
  { num: '7.05', file: '7.05.svg', cat: 'Icon', desc: 'Card type: Condition', purpose: 'Filter UI, card display', fmt: 'SVG', dims: '24x24', artdir: 'Scroll or parchment. Ongoing state.' },
  { num: '7.06', file: '7.06.svg', cat: 'Icon', desc: 'Card type: Event', purpose: 'Filter UI, card display', fmt: 'SVG', dims: '24x24', artdir: 'Lightning bolt or burst. Instant, one-time.' },
  { num: '7.07', file: '7.07.svg', cat: 'Icon', desc: 'Card type: Possession', purpose: 'Filter UI, card display', fmt: 'SVG', dims: '24x24', artdir: 'Equipment/backpack. Carried item.' },
  { num: '7.08', file: '7.08.svg', cat: 'Icon', desc: 'Card type: Site', purpose: 'Filter UI, card display', fmt: 'SVG', dims: '24x24', artdir: 'Location pin or castle silhouette. Place.' },
  { num: '7.09', file: '7.09.svg', cat: 'Icon', desc: 'Twilight cost', purpose: 'Card cost display, inline in text', fmt: 'SVG', dims: '24x24', artdir: 'Half-moon coin. Currency of shadow.' },
  { num: '7.10', file: '7.10.svg', cat: 'Icon', desc: 'Strength stat', purpose: 'Card stat display', fmt: 'SVG', dims: '24x24', artdir: 'Fist or shield. Power in combat.' },
  { num: '7.11', file: '7.11.svg', cat: 'Icon', desc: 'Vitality stat', purpose: 'Card stat display', fmt: 'SVG', dims: '24x24', artdir: 'Heart or flame. Life force.' },
  { num: '7.12', file: '7.12.svg', cat: 'Icon', desc: 'Resistance (Ring-bearer)', purpose: 'Ring-bearer resistance stat', fmt: 'SVG', dims: '24x24', artdir: 'Ring inside protective circle. Willpower against corruption.' },
  { num: '7.13', file: '7.13.svg', cat: 'Icon', desc: 'Keyword: Fierce', purpose: 'Card keyword indicator', fmt: 'SVG', dims: '24x24', artdir: 'Two crossed blades. Fights again after normal skirmish.' },
  { num: '7.14', file: '7.14.svg', cat: 'Icon', desc: 'Keyword: Archer', purpose: 'Card keyword indicator', fmt: 'SVG', dims: '24x24', artdir: 'Bow. Deals wounds during archery phase.' },
  { num: '7.15', file: '7.15.svg', cat: 'Icon', desc: 'Keyword: Damage +1', purpose: 'Card keyword indicator', fmt: 'SVG', dims: '24x24', artdir: 'Jagged downward arrow. Extra wound on kill.' },
  { num: '7.16', file: '7.16.svg', cat: 'Icon', desc: 'Unique card marker', purpose: 'Indicates card is unique (limit 1 copy in play)', fmt: 'SVG', dims: '24x24', artdir: 'Star or diamond. Special, one-of-a-kind.' },
  { num: '7.17', file: '7.17.svg', cat: 'Icon', desc: 'Ring-bearer marker', purpose: 'Identifies the Ring-bearer character', fmt: 'SVG', dims: '24x24', artdir: 'Small stylized One Ring. Gold, simple.' },
  { num: '7.18', file: '7.18.svg', cat: 'Icon', desc: 'Site keyword: Sanctuary', purpose: 'Site keyword indicator — healing location', fmt: 'SVG', dims: '24x24', artdir: 'Leaf or protective arch. Safe, healing.' },
  { num: '7.19', file: '7.19.svg', cat: 'Icon', desc: 'Site keyword: Underground', purpose: 'Site keyword indicator — underground location', fmt: 'SVG', dims: '24x24', artdir: 'Downward cave/tunnel. Enclosed, below surface.' },
  { num: '7.20', file: '7.20.svg', cat: 'Icon', desc: 'Site keyword: Battleground', purpose: 'Site keyword indicator — combat-favored location', fmt: 'SVG', dims: '24x24', artdir: 'Crossed swords on ground. Contested, fought-over.' },

  // ── 8. Standee Bases ──
  { num: '8.01', file: '8.01.png', cat: 'Standee Base', desc: 'Base: Shire', purpose: 'Card standee base for Shire culture cards on the board', fmt: 'PNG', dims: '120x40', artdir: 'Warm wood, hobbit-craft. Cozy, rounded edges. Transparent bg. Viewed from player angle.' },
  { num: '8.02', file: '8.02.png', cat: 'Standee Base', desc: 'Base: Gondor', purpose: 'Card standee base for Gondor culture cards', fmt: 'PNG', dims: '120x40', artdir: 'White stone, silver inlay. Noble, clean lines. Transparent bg.' },
  { num: '8.03', file: '8.03.png', cat: 'Standee Base', desc: 'Base: Rohan', purpose: 'Card standee base for Rohan culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Horse-carved wood, golden leather binding. Transparent bg.' },
  { num: '8.04', file: '8.04.png', cat: 'Standee Base', desc: 'Base: Elven', purpose: 'Card standee base for Elven culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Silver-white filigree, faintly luminous. Ethereal elegance. Transparent bg.' },
  { num: '8.05', file: '8.05.png', cat: 'Standee Base', desc: 'Base: Dwarven', purpose: 'Card standee base for Dwarven culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Carved granite, rune-etched. Heavy, ancient. Transparent bg.' },
  { num: '8.06', file: '8.06.png', cat: 'Standee Base', desc: 'Base: Gandalf', purpose: 'Card standee base for Gandalf culture cards', fmt: 'PNG', dims: '120x40', artdir: 'White staff motif, subtle glow. Wizardly, pure. Transparent bg.' },
  { num: '8.07', file: '8.07.png', cat: 'Standee Base', desc: 'Base: Sauron', purpose: 'Card standee base for Sauron culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Black iron, red-hot rivets. Forge-made, evil. Transparent bg.' },
  { num: '8.08', file: '8.08.png', cat: 'Standee Base', desc: 'Base: Isengard', purpose: 'Card standee base for Isengard culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Industrial steel, crude bolts. Mass-produced, brutal. Transparent bg.' },
  { num: '8.09', file: '8.09.png', cat: 'Standee Base', desc: 'Base: Moria', purpose: 'Card standee base for Moria culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Dark stone, goblin scratch-marks. Underground, crude. Transparent bg.' },
  { num: '8.10', file: '8.10.png', cat: 'Standee Base', desc: 'Base: Ringwraith', purpose: 'Card standee base for Ringwraith culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Shadow-metal, spectral wisps rising. Haunted. Transparent bg.' },
  { num: '8.11', file: '8.11.png', cat: 'Standee Base', desc: 'Base: Dunland', purpose: 'Card standee base for Dunland culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Rough hide stretched over bone. Tribal, savage. Transparent bg.' },
  { num: '8.12', file: '8.12.png', cat: 'Standee Base', desc: 'Base: Raider', purpose: 'Card standee base for Raider culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Desert-worn bronze, fabric wrap. Eastern, exotic. Transparent bg.' },
  { num: '8.13', file: '8.13.png', cat: 'Standee Base', desc: 'Base: Men', purpose: 'Card standee base for Men culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Simple iron, weathered. Common, unremarkable. Transparent bg.' },
  { num: '8.14', file: '8.14.png', cat: 'Standee Base', desc: 'Base: Gollum', purpose: 'Card standee base for Gollum culture cards', fmt: 'PNG', dims: '120x40', artdir: 'Wet cave stone, fish bones. Wretched, pitiful. Transparent bg.' },

  // ── 9. The One Ring ──
  { num: '9.01', file: '9.01.png', cat: 'One Ring', desc: 'The One Ring', purpose: 'Assignment waiting screen center spin. Also Ring-bearer UI accent.', fmt: 'PNG', dims: '256x256', artdir: 'The One Ring. Plain gold band with Tengwar inscription visible. Clean, isolated on transparent bg. Code handles rotation animation and glow.' },

  // ── 10. Card Backs ──
  { num: '10.01', file: '10.01.png', cat: 'Card Back', desc: 'Card back: Free Peoples', purpose: 'Shown for face-down FP cards (opponent hand count, draw deck)', fmt: 'PNG', dims: '250x350', artdir: 'FP card back design. Tolkien-esque. Gold/green/white tones. White Tree motif or similar.' },
  { num: '10.02', file: '10.02.png', cat: 'Card Back', desc: 'Card back: Shadow', purpose: 'Shown for face-down Shadow cards (opponent hand count, draw deck)', fmt: 'PNG', dims: '250x350', artdir: 'Shadow card back design. Dark red/black/purple tones. Eye or dark motif.' },

  // ── 11. Screen Backgrounds ──
  { num: '11.01', file: '11.01.png', cat: 'Screen BG', desc: 'Main menu background', purpose: 'Full-screen background for the main menu / title screen', fmt: 'PNG', dims: '1920x1080', artdir: 'Epic Middle-earth vista. Sweeping, beautiful, inviting. Sets the tone for the whole game.' },
  { num: '11.02', file: '11.02.png', cat: 'Screen BG', desc: 'Deck builder background', purpose: 'Background for the deck building screen', fmt: 'PNG', dims: '1920x1080', artdir: "Bilbo's study table or cozy library. Warm, inviting. Cards spread on a wooden table." },
  { num: '11.03', file: '11.03.png', cat: 'Screen BG', desc: 'Victory screen background', purpose: 'Shown when player wins the game', fmt: 'PNG', dims: '1920x1080', artdir: 'Triumphant, hopeful landscape. Light breaking through. The Shire saved, eagles flying.' },
  { num: '11.04', file: '11.04.png', cat: 'Screen BG', desc: 'Defeat screen background', purpose: 'Shown when player loses the game', fmt: 'PNG', dims: '1920x1080', artdir: 'Somber, dark landscape. Mordor victorious. Shadow over Middle-earth.' },
  { num: '11.05', file: '11.05.png', cat: 'Screen BG', desc: 'Loading screen background', purpose: 'Shown during game loading', fmt: 'PNG', dims: '1920x1080', artdir: 'Atmospheric, mysterious. Works with a loading indicator overlay.' },
  { num: '11.06', file: '11.06.png', cat: 'Screen BG', desc: 'Multiplayer lobby background', purpose: 'Shown in multiplayer lobby while waiting for opponent', fmt: 'PNG', dims: '1920x1080', artdir: 'Social/gathering feel. Council of Elrond vibes. TBD — revisit when multiplayer is built.' },

  // ── 12. Event Flash Art ──
  { num: '12.01', file: '12.01.png', cat: 'Event Flash', desc: 'Balrog erupts', purpose: 'Full-screen flash when Balrog enters play', fmt: 'PNG', dims: '1920x1080', artdir: 'Fiery demon erupting from darkness. Dramatic, terrifying. Brief flash overlay (0.5-1s). Transparent/vignette edges for compositing.' },
  { num: '12.02', file: '12.02.png', cat: 'Event Flash', desc: 'Gandalf the White returns', purpose: 'Full-screen flash when Gandalf the White enters play', fmt: 'PNG', dims: '1920x1080', artdir: 'Wizard reborn in blinding white light. Hopeful, powerful. Vignette edges.' },
  { num: '12.03', file: '12.03.png', cat: 'Event Flash', desc: 'Ring temptation', purpose: 'Flash when Ring tempts the bearer (burden added)', fmt: 'PNG', dims: '1920x1080', artdir: 'The Ring calling. Gold corruption, seductive, dangerous. Vignette edges.' },
  { num: '12.04', file: '12.04.png', cat: 'Event Flash', desc: 'Nazgul arrives', purpose: 'Flash when a Nazgul enters play', fmt: 'PNG', dims: '1920x1080', artdir: 'Wraith shriek moment. Dark, spectral, terrifying. Vignette edges.' },
  { num: '12.05', file: '12.05.png', cat: 'Event Flash', desc: 'Ents march on Isengard', purpose: 'Flash for Ent attack events', fmt: 'PNG', dims: '1920x1080', artdir: 'Forest army advancing. Ancient fury. Trees uprooting. Vignette edges.' },
  { num: '12.06', file: '12.06.png', cat: 'Event Flash', desc: 'Rohirrim charge', purpose: 'Flash for Rohirrim cavalry events', fmt: 'PNG', dims: '1920x1080', artdir: 'Cavalry charge at dawn. Horns blowing, sun behind. Epic, hopeful. Vignette edges.' },
  { num: '12.07', file: '12.07.png', cat: 'Event Flash', desc: 'Phial of Galadriel', purpose: 'Flash when Phial is played', fmt: 'PNG', dims: '1920x1080', artdir: 'Pure light piercing absolute darkness. Star-glass. Vignette edges.' },
  { num: '12.08', file: '12.08.png', cat: 'Event Flash', desc: 'Army of the Dead', purpose: 'Flash for Dead army events', fmt: 'PNG', dims: '1920x1080', artdir: 'Spectral green army unleashed. Ghostly wave. Vignette edges.' },
  { num: '12.09', file: '12.09.png', cat: 'Event Flash', desc: 'Barad-dur falls', purpose: 'Flash when Sauron is defeated / game victory', fmt: 'PNG', dims: '1920x1080', artdir: 'Tower collapsing, Eye extinguishing. Massive, cathartic. Vignette edges.' },
  { num: '12.10', file: '12.10.png', cat: 'Event Flash', desc: 'Ring destroyed at Mount Doom', purpose: 'Flash for Ring destruction / ultimate victory', fmt: 'PNG', dims: '1920x1080', artdir: 'Fire and collapse, then breaking light. Sacrifice and triumph. Vignette edges.' },
  { num: '12.11', file: '12.11.png', cat: 'Event Flash', desc: 'Character death (generic)', purpose: 'Flash when any character is killed in play', fmt: 'PNG', dims: '1920x1080', artdir: 'Dark red flash, somber. Generic — works for any character death. Vignette edges.' },
  { num: '12.12', file: '12.12.png', cat: 'Event Flash', desc: 'Ring-bearer corrupted', purpose: 'Flash when Ring-bearer reaches corruption threshold — game loss', fmt: 'PNG', dims: '1920x1080', artdir: 'Total darkness consuming everything. The Eye wins. Gold turning to ash. Maximum dread. Vignette edges.' },
];

// Add data rows
assets.forEach(a => {
  const row = ws.addRow({
    num: a.num,
    file: a.file,
    cat: a.cat,
    desc: a.desc,
    purpose: a.purpose,
    fmt: a.fmt,
    dims: a.dims,
    artdir: a.artdir,
    done: '',
    review: '',
    feedback: '',
    questions: '',
  });
  row.alignment = { vertical: 'top', wrapText: true };
});

// Category separator styling — bold + colored background for first row of each category
let lastCat = '';
ws.eachRow((row, rowNum) => {
  if (rowNum === 1) return;
  const cat = row.getCell('cat').value;
  if (cat !== lastCat) {
    // Category header row — light gold background
    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5ECD7' } };
      cell.font = { ...cell.font, bold: true };
    });
    lastCat = cat;
  }
});

// Completed? and Review columns — center aligned
ws.getColumn('done').alignment = { horizontal: 'center', vertical: 'top' };
ws.getColumn('review').alignment = { horizontal: 'center', vertical: 'top' };

// Add conditional formatting note in a separate info row at top
// (Excel doesn't support true conditional formatting via exceljs easily, so we add a legend)

// Add a second sheet with workflow instructions
const infoSheet = workbook.addWorksheet('Workflow');
infoSheet.columns = [
  { header: 'Item', key: 'item', width: 30 },
  { header: 'Details', key: 'details', width: 80 },
];
const infoHeader = infoSheet.getRow(1);
infoHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
infoHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D2D2D' } };

const workflow = [
  { item: 'YOUR COLUMNS', details: 'Completed? — put X when you finish a rendering. Questions/Problems — write anything you need help with.' },
  { item: 'MY COLUMNS', details: 'Review — I mark OK (accepted) or REDO (needs changes). Feedback — if REDO, I explain exactly what needs fixing.' },
  { item: 'WORKFLOW', details: '1. You create art, save as the filename shown (e.g., 1.01.svg). 2. Mark X in Completed. 3. I implement and test. 4. I mark OK or REDO. 5. If REDO, check Feedback column, fix, overwrite same file, mark X again.' },
  { item: 'FILE LOCATION', details: 'Save all art to: static/art/ — organized by category number (phase=1.xx, adventure=2.xx, etc.). Or save flat — code maps by filename.' },
  { item: 'TRANSPARENT BG', details: 'All PNG/SVG assets MUST have transparent backgrounds unless noted otherwise. Site videos (5.xx) and screen backgrounds (11.xx) are the exceptions.' },
  { item: 'SVG vs PNG', details: 'SVG = icons, tokens, simple graphics (scale perfectly). PNG = complex illustrations, thumbs, standee bases, tower states. MP4 = site cinemagraphs.' },
  { item: 'REVISIONS', details: 'When I mark REDO, the Feedback column will say what is wrong (e.g., "too bright", "needs transparent bg", "wrong aspect ratio"). Fix and overwrite the same filename.' },
  { item: 'PRIORITY ORDER', details: 'Tier 1 (play the game): Tokens (6.xx), Card backs (10.xx), Phase jewel (1.xx), Adventure HUD (2.xx). Tier 2 (look good): Standee bases (8.xx), Sites (5.xx). Tier 3 (polish): Thumbs (3.xx), Tower (4.xx), Events (12.xx), Screens (11.xx).' },
  { item: 'NUMBERING', details: '1.xx = Phase Jewel, 2.xx = Adventure HUD, 3.xx = Hand Thumbs, 4.xx = Barad-dur Tower, 5.xx = Site Landscapes, 6.xx = Tokens, 7.xx = Icons, 8.xx = Standee Bases, 9.xx = One Ring, 10.xx = Card Backs, 11.xx = Screen BGs, 12.xx = Event Flash Art' },
];

workflow.forEach(w => {
  const row = infoSheet.addRow(w);
  row.alignment = { vertical: 'top', wrapText: true };
});

const outPath = path.join('C:', 'projects', 'lotr', 'Art_Checklist.xlsx');
await workbook.xlsx.writeFile(outPath);
console.log(`Written to ${outPath}`);
console.log(`Total assets: ${assets.length}`);

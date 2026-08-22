# LOTR TCG Digital -- Art Direction Guide

> Single reference for all landscape art direction in the digital board game.
> Covers archetype design, variant system, Midjourney workflow, and full card mappings.

---

## 1. Overview

The board game uses **46 unique landscape images** to represent every location in the Lord of the Rings TCG. Each landscape is a 16:9 cinemagraph (a photograph with subtle looping animation) that serves as the playing surface when a site card is active.

**229 site cards** from across all 19 sets are mapped to these 46 landscapes. Cards that represent the same general location share a landscape image (e.g., seven different Pelennor Fields cards all use the same battlefield painting, differentiated only by time-of-day variant).

The landscapes are organized by **9 archetypes** -- families of terrain that share camera angles, zone layouts, and visual grammar. Each archetype defines where the Fellowship and Shadow zones sit on the board, what shape they take, and what story the composition tells.

Time-of-day is handled by **4 CSS filter variants** (Dawn, Day, Dusk, Night) applied at runtime. One landscape image serves all four moods -- no separate art required.

| Stat | Count |
|------|-------|
| Archetypes | 9 |
| Unique landscapes | 46 |
| Site cards mapped | 229 |
| Base variants | 4 |
| Sets covered | 1-18 |

---

## 2. Design Principles

### Camera and Composition
- **Camera tilt**: 8-14 degrees above ground level. Low enough that card standees read clearly against the landscape; high enough to see zone boundaries.
- **Ground plane**: The lower half of every frame is flat, level terrain suitable for placing game pieces. No vertical obstructions in zone areas.
- **Dramatic features**: Mountains, towers, waterfalls, and armies belong in the upper frame and edges -- never in the card placement area.
- **Horizon placement**: Varies by archetype (14-65% from top). Low horizons = epic scale. High horizons = claustrophobia.

### Film Aesthetic
- Every landscape is designed to feel like a still from Peter Jackson's film trilogy. The lighting, color palette, architecture, and atmosphere reference specific scenes.
- Midjourney prompts explicitly include "Lord of the Rings film aesthetic, Peter Jackson production design."
- This is a film-world game board, not a book illustration or generic fantasy setting.

### Technical Constraints
- **CSS filters for time-of-day**: A single base image is tinted at runtime. No separate dawn/dusk/night renders.
- **Cinemagraph animation**: Each landscape has one looping motion element (water, fire, wind, mist) animated via Runway Gen-3. The base MJ image must compose cleanly for this.
- **Zone shapes tell the story**: Hexagons for protected sanctuaries. Circles for torchlight pools. Wide rectangles for open fields. The shape language reinforces the narrative of each archetype.
- **16:9 aspect ratio**: All landscapes are composed for widescreen monitors. The board editor's zone overlay system maps percentage-based coordinates onto this canvas.

---

## 3. The 9 Archetypes

### 3.1 Open Field (43 cards)

**Terrain categories**: Plains/Grassland, Battlefield, Pastoral/Farmland

The open field is the most common archetype and the emotional heart of the game's epic scale. It covers everything from the peaceful Shire countryside to the blood-soaked Pelennor Fields. The defining quality is exposure -- there is nowhere to hide.

**Camera**: Tilt 8-10 degrees. Horizon at 18-28% (very low). Zoom 0.92-1.00. The low horizon gives maximum sky, creating a sense of vast, overwhelming space.

**Zone layout**: A lateral face-off across open ground. The Fellowship occupies a tall vertical strip on the left-center -- a compact warband formation facing a wide front. The Shadow spreads across the right side in one or two rectangular zones, overwhelming in breadth. The empty ground between them IS the threat.

```
+----------------------------------+
|  vast sky, clouds, distant peaks |
|          -- horizon --           |
|  [FP]            [SH primary]   |
|  tall             wide spread   |
|  strip                          |
|               [SH secondary]    |
|  trampled earth / grassland     |
+----------------------------------+
```

**Narrative intent**: Two armies facing across a plain. Wind in the grass. The Pelennor feeling -- small fellowship, vast enemy, nowhere to run.

**Film references**: Rohirrim charge at Pelennor Fields. Plains of Rohan ride (Aragorn/Legolas/Gimli tracking the Uruk-hai). The Wold battlefield. Shire rolling green hills.

**Ground plane**: Flat grassland, trampled earth, or scorched battlefield. Distant mountains, siege towers, or cavalry formations on the horizon. Scattered weapons and banners on battlefield variants.

**Dramatic features**: Mountain ranges on the horizon. Siege towers or army formations at frame edges. Windswept grass. Scattered weapons and banners.

---

### 3.2 City / Urban (45 cards)

**Terrain categories**: City/Urban, Village/Dwelling

The largest archetype by card count. Ranges from cozy Hobbiton to the seven-tiered grandeur of Minas Tirith to the rain-slicked streets of Bree. Architecture channels movement and funnels confrontation.

**Camera**: Tilt 10-14 degrees. Horizon at 30-40% (moderate). Zoom 0.95-1.00. The higher horizon and tighter angle frame buildings on either side, creating a channeled view.

**Zone layout**: Depth separation -- Fellowship holds the foreground (lower-center, wide hexagonal courtyard), Shadow approaches from the background (upper, wide arc looking down a street). You are looking down a corridor of danger.

```
+----------------------------------+
|     [SH: arc-wide-down]         |
|     approaching down the street  |
|     archways, columns, towers    |
|         -- horizon --            |
|   +--------------------------+   |
|   |   Fellowship Zone        |   |
|   |     (hexagon)            |   |
|   +--------------------------+   |
|   cobblestones / flagstones      |
+----------------------------------+
```

**Narrative intent**: Street combat, courtyard defense. Architecture channels movement. The enemy presses in from the alleys and streets above. The Fellowship holds a defensible position.

**Film references**: Bree -- Prancing Pony at night, rain-slicked streets. Edoras -- stone steps to Meduseld, golden hall. Minas Tirith -- white stone tiers, beacon tower. Osgiliath -- broken arches over the river.

**Ground plane**: Cobblestones, flagstones, wooden planks (Bree), or carved stone steps (Minas Tirith). Flat but framed by architectural elements on the sides.

**Dramatic features**: Archways and columns framing the view. Tiered city levels. Lantern/torch light on stone walls. Market stalls, carts, or rubble depending on the location.

---

### 3.3 Dark Domain (32 cards)

**Terrain categories**: Dark Stronghold, Volcanic/Mordor

The enemy's territory. Everything about this archetype communicates oppression, hostility, and hopelessness. The zone layout is deliberately inverted from Sanctuary -- Shadow dominates, Fellowship is crushed into a corner.

**Camera**: Tilt 10-14 degrees. Horizon at 40-55% (high, pressing down). Zoom 1.00-1.10 (slightly tight, claustrophobic). The sky is choked with ash or cloud. Everything presses in.

**Zone layout**: INVERTED from Sanctuary. Shadow owns the center and upper half of the board in a massive rectangle. Fellowship is compressed to the lower-left corner in a small, exposed rectangle. The board itself belongs to the enemy.

```
+----------------------------------+
|  +----------------------------+  |
|  |                            |  |
|  |   SHADOW ZONE (dominant)   |  |
|  |   the board IS the enemy   |  |
|  |                            |  |
|  +----------------------------+  |
|         -- horizon --            |
| [FP]                             |
| tiny   ash / slag / lava         |
+----------------------------------+
```

**Narrative intent**: Survival, not victory. The Fellowship is tiny and exposed in enemy territory. The visual weight of Shadow is overwhelming. This is Mordor, Isengard, Minas Morgul -- places where hope goes to die.

**Film references**: Isengard -- underground pits, furnaces, smoke, deforested ring. Mount Doom -- red/black volcanic slopes, Sammath Naur. Mordor ash plains -- lifeless grey, the Eye in the distance. Black Gate -- massive iron doors, the Teeth towers. Minas Morgul -- green corpse-light, twisted architecture.

**Ground plane**: Ash, slag, scorched stone, industrial metal. Flat but blighted. Cracked earth, pools of lava or toxic runoff.

**Dramatic features**: Lava rivers, smoke plumes, volcanic glow. Industrial machinery (Isengard). The Eye of Sauron on the horizon. Twisted, corrupted architecture.

---

### 3.4 River / Waterway (26 cards)

**Terrain categories**: River/Waterway, Marsh/Swamp

Water defines these landscapes -- as barrier, as transport, as danger. The river divides the board horizontally, creating a natural no-man's-land between the forces.

**Camera**: Tilt 8-12 degrees. Horizon at 22-30% (low). Zoom 0.92-1.00. Low horizon with open sky reflected in the water surface. Serene but exposed.

**Zone layout**: Two parallel horizontal strips separated by water. Fellowship stands on the near bank (lower center), Shadow on the far bank (upper center). The river flows between them. For marshes, zones are adjacent but separated by treacherous ground.

```
+----------------------------------+
|   sky reflected in water         |
|   [SH: far bank strip]          |
|         -- horizon --            |
|  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~    |
|  ~~~~~ water / marsh ~~~~~~~    |
|  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~    |
|   [FP: near bank strip]         |
|   gravel, sand, reeds, boats     |
+----------------------------------+
```

**Narrative intent**: Two sides of a river. The journey on water. The river is both safety (it carries you forward) and danger (it exposes you). For marshes, the water itself is the enemy -- treacherous, haunted, alive.

**Film references**: Anduin boat journey -- elven boats, forested banks. Argonath -- colossal stone kings flanking the river. Buckleberry Ferry -- desperate escape, fog, dark water. Dead Marshes -- corpse-lights, Gollum leading through mist.

**Ground plane**: Riverbank (gravel, sand, reeds) or boat surfaces. Flat and low. Water dominates the center of the frame.

**Dramatic features**: Flowing or still water between zones. Mist at the water surface. Colossal statues (Argonath). Reeds, fallen logs, boats at shore.

---

### 3.5 Mountain / Pass (21 cards)

**Terrain categories**: Mountain/Pass, Hills/Ruins

Vertical terrain. The enemy holds the high ground. The defining dynamic is looking UP at danger -- exposed ridgelines, narrow passes, ancient ruins on windswept summits.

**Camera**: Tilt 10-14 degrees. Horizon at 35-50% (medium-high). Zoom 1.00-1.05. Enough elevation to see the slope, but you feel the rock pressing in.

**Zone layout**: Vertical separation -- Fellowship on a lower plateau (lower foreground, wide rectangle), Shadow on the heights above (upper, narrower arc). The enemy descends or blocks the pass.

```
+----------------------------------+
|   peaks, snow, storm clouds      |
|    +------------------------+    |
|    |  Shadow Zone (arc-down)|    |
|    |  on the heights        |    |
|    +------------------------+    |
|         -- horizon --            |
|  +----------------------------+  |
|  |   Fellowship Zone          |  |
|  |   on the plateau below     |  |
|  +----------------------------+  |
+----------------------------------+
```

**Narrative intent**: The enemy has the high ground. Exposed ridgelines, ancient ruins. The pass must be crossed, but what waits above?

**Film references**: Caradhras -- blinding snow, narrow ledge, Saruman's voice. Weathertop -- ruined ring of stone pillars, night attack. Emyn Muil -- grey rocky maze, sharp edges. Amon Hen -- forested hilltop, ancient stone seat.

**Ground plane**: Rocky terrain -- scree, exposed stone, snow. Flat plateaus within zones, surrounded by slopes and drops.

**Dramatic features**: Snow-capped peaks. Ruined stone structures (Weathertop). Narrow ledge paths. Windswept exposure and dramatic sky.

---

### 3.6 Underground / Cavern (19 cards)

**Terrain categories**: Underground/Cavern

The most atmospherically distinct archetype. No sky, no horizon in the traditional sense. The ceiling presses down. Light comes from torches, shafts from above, or the glow of a Balrog's fire.

**Camera**: Tilt 10-14 degrees. Horizon at 50-65% (very high or invisible). Zoom 1.00-1.10 (tight). Claustrophobic framing -- the space above is ceiling, not sky.

**Zone layout**: Diagonal axis. Two circles of light in darkness -- Fellowship in the lower-left (a torchlight pool), Shadow in the upper-right (emerging from the dark). A chasm, bridge, or void between them. The darkness between the zones is as important as the zones themselves.

```
+----------------------------------+
|   darkness / ceiling             |
|              +----------+        |
|              | SH circle|        |
|              | emerging |        |
|              +----------+        |
|       ~~ chasm / void ~~        |
|  +----------+                    |
|  | FP circle|                    |
|  | torchlit |                    |
|  +----------+                    |
+----------------------------------+
```

**Narrative intent**: Two groups across a narrow bridge or gap. Pools of torchlight in infinite darkness. Echoing halls, dripping water. The darkness itself is the enemy.

**Film references**: Dwarrowdelf -- vast pillared hall, Gandalf's staff illuminating the space. Bridge of Khazad-dum -- narrow stone bridge over infinite chasm, Balrog fire. Balin's Tomb -- cramped chamber, shaft of light from above. Paths of the Dead -- green-tinged, skulls, oppressive low ceiling.

**Ground plane**: Carved dwarven stone, natural cave rock, or bridge surface. Flat within zones but surrounded by darkness, void, and chasm.

**Dramatic features**: Massive carved pillars disappearing into darkness. Chasm or void between zones. Single shaft of light from above. Stalactites, mine carts, carved runes.

---

### 3.7 Forest (15 cards)

**Terrain categories**: Forest

The ambush archetype. Trees limit visibility and create natural barriers. The Fellowship is surrounded, and danger materializes from the treeline on every side.

**Camera**: Tilt 10-14 degrees. Horizon at 45-55% (high -- canopy presses down). Zoom 1.00-1.05. Limited visibility. Enclosed but alive.

**Zone layout**: Fellowship centered in a clearing (hexagonal shape), with Shadow in TWO non-contiguous zones flanking from upper-left and lower-right. Classic ambush positioning -- the trees channel movement, and threats emerge from both sides.

```
+----------------------------------+
| +--------+                       |
| |SH zone |  canopy / treeline    |
| |upper-L |                       |
| +--------+                       |
|       +----------------+         |
|       |  FP (hexagon)  |         |
|       |  in clearing   |         |
|       +----------------+         |
|                    +--------+    |
|   forest floor     |SH zone |   |
|                    |lower-R |   |
+----------------------------------+
```

**Narrative intent**: Surrounded. The forest closes in. Shadow forces materialize between the trunks. Every direction is a threat. The split Shadow zones create palpable tension.

**Film references**: Fangorn Forest -- ancient, deep green, Ents, twisted trunks. Trollshaw Forest -- stone trolls, overgrown path. Ithilien -- overgrown ruins, sunlit glades. Old Forest -- oppressive willows, narrow paths.

**Ground plane**: Forest floor -- roots, moss, leaf litter, ferns. Flat clearings for zones with massive tree trunks at zone edges.

**Dramatic features**: Massive tree trunks framing zones. Dappled light shafts from canopy. Ancient ruins overgrown with vines. Mist at ground level between trees.

---

### 3.8 Fortress / Fortification (14 cards)

**Terrain categories**: Fortress/Fortification

Siege warfare. The wall defines everything. This archetype is almost entirely Helm's Deep, with the stone wall as the dominant visual element dividing defender from attacker.

**Camera**: Tilt 10-14 degrees. Horizon at 35-45% (medium). Zoom 1.00-1.05. Focused on the wall or gate structure. The architecture IS the geography.

**Zone layout**: A wall or gate visually divides the board. Fellowship is compact behind/within it (lower-right rectangle, protected by stone). Shadow masses outside (upper-left, large arc, overwhelming numbers). The wall is the line.

```
+----------------------------------+
|  +------------------------+      |
|  |   Shadow Zone          |      |
|  |   (arc-wide-down)      |      |
|  |   outside the walls    |      |
|  +------------------------+      |
|  ========= WALL =========       |
|         -- horizon --            |
|              +---------------+   |
|              | FP Zone       |   |
|              | behind walls  |   |
|              +---------------+   |
+----------------------------------+
```

**Narrative intent**: Defenders on the wall, attackers below. The wall defines everything. The compact Fellowship zone versus the sprawling Shadow zone tells the story of a desperate few against overwhelming numbers.

**Film references**: Helm's Deep -- rain-soaked walls, Uruk-hai torches, the causeway. Hornburg gate -- battering ram, desperate defense. Deeping Wall -- the explosion, ladders, hand-to-hand. Minas Tirith Great Gates -- Grond, fell beasts overhead.

**Ground plane**: Stone battlements and courtyard (FP side). Muddy, churned field with ladders and siege equipment (SH side). Both relatively flat.

**Dramatic features**: Massive stone wall dividing the board. Siege ladders, battering rams. Torch and fire light on wet stone. Battlements with crenellations silhouetted against the sky.

---

### 3.9 Elven Sanctuary (14 cards)

**Terrain categories**: Elven Sanctuary

The inverse of Dark Domain. Beauty, peace, and otherworldliness. Shadow forces lurk at the borders but cannot dominate the visual space. This is Rivendell, Lothlorien, the Grey Havens -- places where the world is still whole.

**Camera**: Tilt 8-12 degrees. Horizon at 14-28% (very low). Zoom 0.90-0.95 (wide, expansive). Golden or ethereal light. Beauty and peace radiate outward.

**Zone layout**: Fellowship is central and protected in a hexagonal zone (elven geometry). Shadow is pushed to the periphery -- a distant arc in the lower-right, present but diminished. The sanctuary radiates safety.

```
+----------------------------------+
|  waterfalls, golden canopy       |
|  +----------------+              |
|  |  FP (hexagon)  |              |
|  |  sheltered,    |              |
|  |  central       |              |
|  +----------------+              |
|         -- horizon --            |
|  elven stone, reflective pools   |
|              +-----------+       |
|              | SH arc    |       |
|              | peripheral|       |
+----------------------------------+
```

**Narrative intent**: Safety, beauty, otherworldliness. The Fellowship is sheltered in the heart of the sanctuary. Shadow lurks at the borders but cannot penetrate the peace. The visual weight is inverted from Dark Domain -- light and space dominate.

**Film references**: Rivendell -- valley of waterfalls, autumn gold, carved terraces, council courtyard. Lothlorien -- silver mallorn trunks, golden canopy, Galadriel's mirror glade. Grey Havens -- harbor, white ships, endless sea, silver light.

**Ground plane**: Elven stone terraces, garden paths, reflective pools. Smooth, elegant, carved. Mallorn leaf patterns in the stone.

**Dramatic features**: Waterfalls cascading in the background. Mallorn or autumn trees with golden leaves. Elegant carved stone architecture. Reflective water pools catching light.

---

## 4. Variant System

### 4.1 The Four Base Variants

Every landscape has four moods achieved through CSS filters applied to the base cinemagraph image at runtime. No additional art is generated -- one Midjourney image serves all four times of day.

| Variant | Time | Feel | Particle Effect |
|---------|------|------|-----------------|
| **Dawn** | Early morning | Soft, hopeful, waking world. Mist burning off. | Slow mist |
| **Day** | Midday | Clear, neutral, full visibility. The world as it is. | None |
| **Dusk** | Evening | Golden hour fading to purple. Beautiful but ominous. | Ember/firefly |
| **Night** | After dark | Cold, tense, limited visibility. Danger. | Moonbeam shafts |

### 4.2 CSS Filter Stacks

Each variant applies a CSS `filter` to the background element plus an optional gradient overlay:

**Dawn**
```css
filter: brightness(0.9) saturate(0.8) sepia(0.15);
/* overlay: linear-gradient(180deg, rgba(255,160,80,0.08), rgba(255,120,40,0.12)) */
```

**Day**
```css
filter: brightness(1.0) contrast(1.05);
/* no overlay */
```

**Dusk**
```css
filter: brightness(0.75) saturate(1.2) hue-rotate(-10deg);
/* overlay: linear-gradient(180deg, rgba(200,100,40,0.1), rgba(120,40,80,0.15)) */
```

**Night**
```css
filter: brightness(0.4) saturate(0.5) contrast(1.3);
/* overlay: linear-gradient(180deg, rgba(20,30,60,0.25), rgba(10,15,35,0.35)) */
```

### 4.3 Themed Variant Names

Each archetype has evocative names for its four variants:

| Archetype | Dawn | Day | Dusk | Night |
|-----------|------|-----|------|-------|
| Open Field | Morning Mist | High Noon | Golden Hour | Moonlit Plains |
| City | First Light | Market Day | Lamplighter | Curfew |
| Underground | Faint Torchlight | Lantern Bright | Ember Glow | Deep Darkness |
| Forest | Misty Canopy | Dappled Light | Amber Glade | Dark Wood |
| Water | River Mist | Clear Current | Sunset Reflection | Moonwater |
| Mountain | Alpenglow | Summit Clear | Last Light on Stone | Starlit Peak |
| Fortress | Watch Before Dawn | Garrison Noon | Siege Dusk | Night Assault |
| Sanctuary | Silver Dawn | Golden Afternoon | Twilight Glow | Starlit Refuge |
| Dark Domain | Ashen Dawn | Sulfur Haze | Furnace Dusk | Void Night |

### 4.4 Special Overrides

Two archetypes have no real time-of-day and use overrides instead:

**Underground** -- Variants control light source intensity, not sun position. There is no sky.

| Variant | Override | Feel |
|---------|----------|------|
| Dawn | `brightness(0.35) saturate(0.4) sepia(0.2)` | Barely any light. Distant glow. |
| Day | `brightness(0.55) saturate(0.6) contrast(1.1)` | Torches lit. Visible but confined. |
| Dusk | `brightness(0.45) saturate(0.8) sepia(0.1) hue-rotate(10deg)` | Ember glow. Warm orange from dying fires. |
| Night | `brightness(0.2) saturate(0.3) contrast(1.4)` | Near-total darkness. Only the faintest light. |

**Dark Domain** -- Corrupted light. No clean sunlight ever. Variants control the corruption color.

| Variant | Override | Overlay |
|---------|----------|---------|
| Dawn | `brightness(0.5) saturate(0.6) sepia(0.3)` | Warm ochre gradient |
| Day | `brightness(0.6) saturate(0.5) contrast(1.1) hue-rotate(5deg)` | Sickly yellow gradient |
| Dusk | `brightness(0.5) saturate(1.0) hue-rotate(-15deg)` | Deep red gradient |
| Night | `brightness(0.25) saturate(0.3) contrast(1.5)` | Near-black gradient |

### 4.5 Variant Assignment

Each of the 229 site cards has a `defaultVariant` set by narrative context:

| Variant | Cards | Usage Pattern |
|---------|-------|---------------|
| Day | 113 | Safe travel, sanctuaries, open country, the Shire |
| Night | 70 | Underground, Bree, Helm's Deep siege, Isengard, Moria |
| Dusk | 46 | Pelennor siege, Osgiliath, Mordor approaches, Lothlorien |
| Dawn | 0 | Reserved for future special variants |

Dawn is currently unassigned as a default. It exists for gameplay-triggered mood shifts (e.g., "the dawn of a new day" events) or future art direction refinement.

---

## 5. Landscape Index

46 unique landscapes, sorted alphabetically. The "Cards" column shows how many site cards share this landscape. The "Scene" column is a one-sentence description.

| Landscape ID | Location | Archetype | Cards | Default | Scene |
|---|---|---|---|---|---|
| aglarond-caves | Glittering Caves of Aglarond | underground | 4 | night | Crystal caverns behind Helm's Deep, prismatic reflections in still pools. |
| amon-hen | Amon Hen (Hill of Sight) | forest/mountain | 3 | day | Ancient ruined stone seat on a wooded hilltop, Numenorean ruins among beech trees. |
| anduin-river | The Great River Anduin | water | 11 | day | Wide majestic river between forested banks, gentle current, reeds and willows. |
| argonath | The Argonath (Pillars of the Kings) | water | 3 | day | Two colossal stone king statues flanking the river, mist and spray. |
| black-gate | The Black Gate (Morannon) | dark-domain | 4 | dusk | Enormous iron gate between the Towers of the Teeth, scorched killing field. |
| bree-outskirts | Bree Outskirts and Chetwood | forest | 3 | night | Dark overgrown forest road, moonlight through broken cloud, mist on the floor. |
| bree-town | Bree | city | 5 | night | Medieval village at night in rain, cobblestone streets, Prancing Pony. |
| cirith-ungol | Cirith Ungol | dark-domain | 2 | night | Sinister dark watchtower on a narrow mountain pass, cobwebs and sickly moonlight. |
| dead-marshes | The Dead Marshes | water | 1 | night | Stagnant swamp with ghostly pale lights beneath black water, fog and dread. |
| dimrill-dale | Dimrill Dale (Azanulbizar) | open-field | 1 | day | Mountain valley emerging from cave mouths into harsh daylight, crystal lake. |
| dol-guldur | Dol Guldur | dark-domain | 1 | night | Ruined dark fortress on a bare hill, dead forest, shadow pouring like liquid. |
| dunharrow | Dunharrow and White Mountains | mountain | 5 | day | Mountain plateau with carved stone figures, road to the Dimholt gap. |
| edoras-city | Edoras, Capital of Rohan | city | 13 | day | Fortified hilltop with golden-roofed Meduseld, timber buildings, horse banners. |
| emyn-muil | Emyn Muil | mountain | 6 | day | Jagged grey limestone maze, razor-sharp ridges, overcast and bleak. |
| eregion-hills | Eregion and Misty Mountain Passes | mountain | 7 | day | High mountain pass with snow-covered peaks, ancient ruins, harsh cold light. |
| ettenmoors | Ettenmoors | open-field | 2 | day | Vast empty moorland, heather and coarse grass, scattered boulders, isolation. |
| fangorn-forest | Fangorn Forest | forest | 3 | day | Impossibly ancient primeval forest, sleeping-giant trees, moss and lichen. |
| grey-havens | The Grey Havens (Mithlond) | sanctuary | 1 | day | Elegant elven harbor at sunset, white stone towers, calm golden water. |
| helms-deep-interior | Helm's Deep Interior | fortress | 4 | night | Cavernous stone hall carved from rock, iron torch sconces, last refuge. |
| helms-deep-walls | Helm's Deep Outer Walls | fortress | 10 | night | Massive stone fortress wall in driving rain, lightning, torchlight on wet stone. |
| henneth-annun | Henneth Annun (Window on the West) | underground | 1 | dusk | Hidden cave behind a waterfall, golden sunset refracting through the water curtain. |
| isengard-fortress | Isengard and Orthanc | dark-domain | 13 | night | Black tower surrounded by forge pits and furnaces, smoke and orange fire. |
| isengard-ruined | Isengard Flooded and Ruined | dark-domain | 2 | day | Flooded circular fortress, Orthanc standing in a lake, wreckage and steam. |
| ithilien-forest | Ithilien | forest | 3 | day | Beautiful temperate forest, Mediterranean quality, cedar and pine, clear streams. |
| lothlorien | Lothlorien (Caras Galadhon) | sanctuary | 6 | dusk | Ethereal silver-barked trees with golden leaves, elven lanterns, reflective pool. |
| midgewater-marshes | Midgewater Marshes | water | 4 | dusk | Desolate marshland at twilight, stagnant pools, dead trees, fog. |
| minas-tirith-circles | Minas Tirith Lower Circles | city | 4 | dusk | Narrow winding streets between white stone buildings, dusk amber light. |
| minas-tirith-gates | Minas Tirith Great Gate | city | 7 | dusk | Colossal stone gatehouse in towering white wall, siege fire reflections. |
| minas-tirith-upper | Minas Tirith Upper Circles | city | 7 | day | White marble upper levels, Tower of Ecthelion, dead white tree courtyard. |
| mordor-wastes | Mordor Wastelands | dark-domain | 4 | dusk | Volcanic wasteland under ash-choked sky, cracked earth, distant red glow. |
| morgul-vale | Morgul Vale (Minas Morgul) | dark-domain | 2 | night | Twisted city with sickly green glow, phosphorescent toxic water, dread. |
| moria-bridge | Bridge of Khazad-dum | underground | 2 | night | Narrow bridge over an impossibly deep chasm, faint orange-red glow from below. |
| moria-entrance | West Gate of Moria | underground/water | 4 | night | Ancient stone doorway in cliff face, dark lake, moonlit carved door. |
| moria-halls | Halls of Moria (Dwarrowdelf) | underground | 9 | night | Vast underground dwarven hall, massive columns, single shaft of pale light. |
| mount-doom | Mount Doom (Orodruin) | dark-domain | 4 | dusk | Active volcano with lava rivers, fire and black smoke, path to the crack. |
| nen-hithoel | Nen Hithoel and Tol Brandir | water | 3 | day | Narrow mountain lake, rocky island, massive waterfall, pebbly shore. |
| osgiliath-ruins | Osgiliath Ruins | city | 5 | dusk | Ruined river city, broken stone bridges, shattered Gondorian architecture. |
| paths-of-dead | Paths of the Dead | underground | 1 | night | Narrow passage filled with green phosphorescent mist, floor of skulls and bones. |
| pelennor-fields | Pelennor Fields | open-field | 7 | dusk | Vast flat battlefield before a walled white city, siege fires, smoke. |
| rivendell | Rivendell (Imladris) | sanctuary | 8 | day | Hidden elven valley in autumn, carved stone terraces, waterfalls, golden light. |
| rohan-camp | Rohirrim War Camp | open-field | 7 | night | Military encampment on grassland at night, scattered campfires, smoke. |
| rohan-plains | The Plains of Rohan | open-field | 17 | day | Immense flat grassland to the horizon, golden-green grass in strong wind. |
| shire-countryside | The Shire Countryside | open-field | 6 | day | Rolling green hills and golden wheat fields, dirt lane, hedgerows, wildflowers. |
| shire-hobbiton | Hobbiton, The Shire | city | 9 | day | Cozy hobbit village, round doors in grassy mounds, party tree, flower gardens. |
| trollshaw-forest | Trollshaw Forest | forest | 3 | day | Ancient dense forest, massive moss-covered trunks, god-rays, crumbling stone. |
| weathertop-ruins | Weathertop (Amon Sul) | mountain | 2 | night | Ruined circular watchtower on windswept hilltop, storm sky, exposed stone. |

---

## 6. Card-to-Landscape Mapping

All 229 cards grouped by archetype. Format: `Blueprint ID` -- Title -- Landscape -- Variant.

### Open Field (43 cards)

| ID | Title | Landscape | Variant |
|----|-------|-----------|---------|
| 1_320 | East Road | shire-countryside | day |
| 1_321 | Farmer Maggot's Fields | shire-countryside | day |
| 1_323 | Green Hill Country | shire-countryside | day |
| 1_325 | Shire Lookout Point | shire-countryside | day |
| 1_326 | Westfarthing | shire-hobbiton | day |
| 1_331 | Ettenmoors | ettenmoors | day |
| 1_333 | Midgewater Moors | midgewater-marshes | dusk |
| 1_350 | Dimrill Dale | dimrill-dale | day |
| 1_357 | Brown Lands | anduin-river | day |
| 2_115 | Hobbiton Party Field | shire-hobbiton | day |
| 2_119 | Hollin | eregion-hills | day |
| 4_323 | East Wall of Rohan | rohan-plains | day |
| 4_324 | Eastemnet Downs | rohan-plains | day |
| 4_325 | Eastemnet Gullies | rohan-plains | day |
| 4_326 | Horse-country | rohan-plains | day |
| 4_327 | Plains of Rohan | rohan-plains | day |
| 4_328 | The Riddermark | rohan-plains | day |
| 4_331 | Eastfold | rohan-plains | day |
| 4_333 | Plains of Rohan Camp | rohan-camp | night |
| 4_335 | Uruk Camp | rohan-camp | night |
| 4_336 | Wold of Rohan | rohan-plains | day |
| 4_342 | Westemnet Plains | rohan-plains | day |
| 4_344 | Westemnet Hills | rohan-plains | day |
| 6_116 | Westfold | rohan-plains | day |
| 7_332 | Rohirrim Road | rohan-plains | day |
| 7_335 | King's Tent | rohan-camp | night |
| 7_336 | Rohirrim Camp | rohan-camp | night |
| 7_337 | West Road | rohan-plains | day |
| 7_343 | Pelennor Plain | pelennor-fields | dusk |
| 7_345 | Pelennor Flat | pelennor-fields | dusk |
| 7_354 | Pelennor Grassland | pelennor-fields | dusk |
| 8_119 | Crashed Gate | minas-tirith-gates | dusk |
| 10_118 | Pelennor Prairie | pelennor-fields | dusk |
| 11_237 | Ettenmoors | ettenmoors | day |
| 11_240 | Flats of Rohan | rohan-plains | day |
| 11_243 | Harrowdale | rohan-plains | day |
| 11_253 | Pelennor Fields | pelennor-fields | dusk |
| 11_254 | Pelennor Flat | pelennor-fields | dusk |
| 11_257 | Rohan Uplands | rohan-plains | day |
| 12_190 | Northern Pelennor | pelennor-fields | dusk |
| 12_194 | Wold Battlefield | rohan-camp | night |
| 13_193 | Isenwash | rohan-camp | night |
| 15_190 | East Wall of Rohan | rohan-plains | day |

### City / Urban (45 cards)

| ID | Title | Landscape | Variant |
|----|-------|-----------|---------|
| 1_319 | Bag End | shire-hobbiton | day |
| 1_322 | Green Dragon Inn | shire-hobbiton | day |
| 1_324 | The Prancing Pony | bree-town | night |
| 1_327 | Bree Gate | bree-town | night |
| 1_328 | Bree Streets | bree-town | night |
| 2_117 | Town Center | shire-hobbiton | day |
| 4_334 | Rohirrim Village | edoras-city | day |
| 4_337 | Barrows of Edoras | edoras-city | day |
| 4_338 | Golden Hall | edoras-city | day |
| 4_339 | Stables | edoras-city | day |
| 4_340 | Streets of Edoras | edoras-city | day |
| 4_341 | Throne Room | edoras-city | day |
| 6_117 | Meduseld | edoras-city | day |
| 7_330 | Edoras Hall | edoras-city | day |
| 7_333 | Sleeping Quarters | edoras-city | day |
| 7_334 | Steps of Edoras | edoras-city | day |
| 7_338 | Beacon of Minas Tirith | minas-tirith-upper | day |
| 7_339 | Hall of the Kings | minas-tirith-upper | day |
| 7_340 | Tower of Ecthelion | minas-tirith-upper | day |
| 7_342 | Osgiliath Fallen | osgiliath-ruins | dusk |
| 7_344 | City Gates | minas-tirith-gates | dusk |
| 7_346 | Minas Tirith Fifth Circle | minas-tirith-upper | day |
| 7_347 | Minas Tirith First Circle | minas-tirith-circles | dusk |
| 7_348 | Minas Tirith Fourth Circle | minas-tirith-circles | dusk |
| 7_349 | Minas Tirith Second Circle | minas-tirith-circles | dusk |
| 7_350 | Minas Tirith Seventh Circle | minas-tirith-upper | day |
| 7_351 | Minas Tirith Sixth Circle | minas-tirith-upper | day |
| 7_352 | Minas Tirith Third Circle | minas-tirith-circles | dusk |
| 7_353 | Osgiliath Crossing | osgiliath-ruins | dusk |
| 7_355 | Ruined Capitol | osgiliath-ruins | dusk |
| 8_120 | Osgiliath Channel | osgiliath-ruins | dusk |
| 10_119 | Steward's Tomb | minas-tirith-gates | dusk |
| 11_230 | Buckland Homestead | shire-hobbiton | day |
| 11_242 | Green Dragon Inn | shire-hobbiton | day |
| 11_252 | Osgiliath Reclaimed | osgiliath-ruins | dusk |
| 11_256 | The Prancing Pony | bree-town | night |
| 11_259 | Stables | edoras-city | day |
| 11_264 | Westemnet Village | edoras-city | day |
| 12_189 | Hobbiton Market | shire-hobbiton | day |
| 13_187 | City of Kings | minas-tirith-gates | dusk |
| 13_188 | Courtyard Parapet | minas-tirith-gates | dusk |
| 15_189 | City Gates | minas-tirith-gates | dusk |
| 15_194 | Westfold Village | edoras-city | day |
| 18_139 | Steward's Tomb | minas-tirith-gates | dusk |
| 18_140 | Streets of Bree | bree-town | night |

### Dark Domain (32 cards)

| ID | Title | Landscape | Variant |
|----|-------|-----------|---------|
| 4_358 | Ring of Isengard | isengard-fortress | night |
| 4_359 | Wizard's Vale | isengard-fortress | night |
| 4_360 | Fortress of Orthanc | isengard-fortress | night |
| 4_361 | Orthanc Balcony | isengard-fortress | night |
| 4_362 | Orthanc Library | isengard-fortress | night |
| 4_363 | Palantir Chamber | isengard-fortress | night |
| 5_119 | Nan Curunir | isengard-fortress | night |
| 5_120 | Caverns of Isengard | isengard-fortress | night |
| 6_119 | Valley of Saruman | isengard-fortress | night |
| 6_120 | Saruman's Laboratory | isengard-fortress | night |
| 7_331 | Isengard Ruined | isengard-ruined | day |
| 7_357 | Morgul Vale | morgul-vale | night |
| 7_358 | Morgulduin | morgul-vale | night |
| 7_360 | Dagorlad | mordor-wastes | dusk |
| 7_361 | Haunted Pass | black-gate | dusk |
| 7_362 | Narchost | black-gate | dusk |
| 7_363 | Slag Mounds | mordor-wastes | dusk |
| 10_120 | Watchers of Cirith Ungol | cirith-ungol | night |
| 11_241 | Fortress of Orthanc | isengard-fortress | night |
| 11_244 | Heights of Isengard | isengard-fortress | night |
| 11_258 | Slag Mounds | mordor-wastes | dusk |
| 11_262 | Watch-tower of Cirith Ungol | cirith-ungol | night |
| 12_192 | Slopes of Orodruin | mount-doom | dusk |
| 15_188 | Breeding pit of Isengard | isengard-fortress | night |
| 15_191 | Gate of Mordor | black-gate | dusk |
| 15_192 | Isengard Ruined | isengard-ruined | day |
| 15_193 | Mount Doom | mount-doom | dusk |
| 17_145 | Dol Guldur | dol-guldur | night |
| 17_148 | Nurn | mordor-wastes | dusk |
| 18_134 | Doorway to Doom | mount-doom | dusk |
| 18_135 | Foot of Mount Doom | mount-doom | dusk |
| 18_137 | Morannon Plains | black-gate | dusk |

### River / Waterway (26 cards)

| ID | Title | Landscape | Variant |
|----|-------|-----------|---------|
| 1_330 | Buckleberry Ferry | shire-countryside | day |
| 1_332 | Midgewater Marshes | midgewater-marshes | dusk |
| 1_338 | Ford of Bruinen | rivendell | day |
| 1_346 | Moria Lake | moria-entrance | night |
| 1_353 | Anduin Confluence | anduin-river | day |
| 1_354 | Anduin Wilderland | anduin-river | day |
| 1_355 | Silverlode Banks | anduin-river | day |
| 1_356 | Anduin Banks | anduin-river | day |
| 1_358 | Pillars of the Kings | argonath | day |
| 1_359 | Shores of Nen Hithoel | nen-hithoel | day |
| 1_363 | Tol Brandir | nen-hithoel | day |
| 3_118 | The Great River | anduin-river | day |
| 3_117 | Gates of Argonath | argonath | day |
| 7_341 | Anduin Banks | anduin-river | day |
| 11_227 | Anduin Banks | anduin-river | day |
| 11_228 | Anduin Confluence | anduin-river | day |
| 11_235 | Dammed Gate-stream | moria-entrance | night |
| 11_238 | Expanding Marshland | midgewater-marshes | dusk |
| 11_246 | Mere of Dead Faces | dead-marshes | night |
| 11_249 | Neekerbreekers' Bog | midgewater-marshes | dusk |
| 11_250 | North Undeep | anduin-river | day |
| 12_191 | Shores of Nen Hithoel | nen-hithoel | day |
| 13_190 | Doors of Durin | moria-entrance | night |
| 13_191 | Fords of Isen | rohan-camp | night |
| 15_187 | Anduin River | anduin-river | day |
| 17_146 | Falls of Rauros | argonath | day |

### Mountain / Pass (21 cards)

| ID | Title | Landscape | Variant |
|----|-------|-----------|---------|
| 1_335 | Weatherhills | weathertop-ruins | night |
| 1_336 | Weathertop | weathertop-ruins | night |
| 1_348 | Pass of Caradhras | eregion-hills | day |
| 1_360 | Emyn Muil | emyn-muil | day |
| 1_362 | Summit of Amon Hen | amon-hen | day |
| 3_116 | Eregion Hills | eregion-hills | day |
| 3_120 | Wastes of Emyn Muil | emyn-muil | day |
| 4_329 | Western Emyn Muil | emyn-muil | day |
| 4_343 | Ered Nimrais | dunharrow | day |
| 4_345 | White Mountains | dunharrow | day |
| 6_115 | Rocks of Emyn Muil | emyn-muil | day |
| 7_329 | Dunharrow Plateau | dunharrow | day |
| 10_117 | Base of Mindolluin | minas-tirith-upper | day |
| 11_229 | Barazinbar | eregion-hills | day |
| 11_234 | Crags of Emyn Muil | emyn-muil | day |
| 11_255 | Pinnacle of Zirakzigil | eregion-hills | day |
| 12_187 | Emyn Muil | emyn-muil | day |
| 12_188 | Hill of Sight | amon-hen | day |
| 12_193 | Starkhorn | dunharrow | day |
| 13_194 | Redhorn Pass | eregion-hills | day |
| 18_138 | Sirannon Ruins | eregion-hills | day |

### Underground / Cavern (19 cards)

| ID | Title | Landscape | Variant |
|----|-------|-----------|---------|
| 1_343 | Balin's Tomb | moria-halls | night |
| 1_344 | Dwarrowdelf Chamber | moria-halls | night |
| 1_345 | Mithril Mine | moria-halls | night |
| 1_347 | Moria Stairway | moria-halls | night |
| 1_349 | The Bridge of Khazad-dum | moria-bridge | night |
| 2_118 | Great Chasm | moria-halls | night |
| 4_352 | Caves of Aglarond | aglarond-caves | night |
| 4_355 | Cavern Entrance | aglarond-caves | night |
| 8_117 | The Dimholt | dunharrow | day |
| 8_118 | City of the Dead | paths-of-dead | night |
| 11_232 | Cavern Entrance | aglarond-caves | night |
| 11_233 | Chamber of Mazarbul | moria-halls | night |
| 11_247 | Moria Guardroom | moria-halls | night |
| 11_248 | Moria Stairway | moria-halls | night |
| 11_263 | West Gate of Moria | moria-entrance | night |
| 11_265 | Window on the West | henneth-annun | dusk |
| 12_186 | The Bridge of Khazad-dum | moria-bridge | night |
| 13_185 | Abandoned Mine Shaft | moria-halls | night |
| 13_186 | Caves of Aglarond | aglarond-caves | night |

### Forest (15 cards)

| ID | Title | Landscape | Variant |
|----|-------|-----------|---------|
| 1_329 | Breeland Forest | bree-outskirts | night |
| 1_334 | Trollshaw Forest | trollshaw-forest | day |
| 1_361 | Slopes of Amon Hen | amon-hen | day |
| 2_116 | Hobbiton Woods | shire-hobbiton | day |
| 4_330 | Derndingle | fangorn-forest | day |
| 4_332 | Fangorn Forest | fangorn-forest | day |
| 7_356 | Cross Roads | ithilien-forest | day |
| 7_359 | Northern Ithilien | ithilien-forest | day |
| 11_236 | East Road | trollshaw-forest | day |
| 11_239 | Fangorn Glade | fangorn-forest | day |
| 11_251 | Old Forest Road | bree-outskirts | night |
| 11_260 | Trollshaw Forest | trollshaw-forest | day |
| 11_266 | Woody-End | shire-countryside | day |
| 12_185 | The Angle | bree-outskirts | night |
| 13_189 | Crossroads of the Fallen Kings | ithilien-forest | day |

### Fortress / Fortification (14 cards)

| ID | Title | Landscape | Variant |
|----|-------|-----------|---------|
| 4_346 | White Rocks | helms-deep-walls | night |
| 4_347 | Deep of Helm | helms-deep-walls | night |
| 4_348 | Deeping Wall | helms-deep-walls | night |
| 4_349 | Helm's Gate | helms-deep-walls | night |
| 4_350 | Hornburg Courtyard | helms-deep-walls | night |
| 4_351 | Hornburg Parapet | helms-deep-walls | night |
| 4_353 | Great Hall | helms-deep-interior | night |
| 4_354 | Hornburg Armory | helms-deep-interior | night |
| 4_356 | Hornburg Causeway | helms-deep-walls | night |
| 4_357 | King's Room | helms-deep-interior | night |
| 5_118 | Hornburg Wall | helms-deep-walls | night |
| 6_118 | Hornburg Hall | helms-deep-interior | night |
| 11_245 | Helm's Gate | helms-deep-walls | night |
| 13_192 | The Great Gates | helms-deep-walls | night |

### Elven Sanctuary (14 cards)

| ID | Title | Landscape | Variant |
|----|-------|-----------|---------|
| 1_337 | Council Courtyard | rivendell | day |
| 1_339 | Frodo's Bedroom | rivendell | day |
| 1_340 | Rivendell Terrace | rivendell | day |
| 1_341 | Rivendell Valley | rivendell | day |
| 1_342 | Rivendell Waterfall | rivendell | day |
| 1_351 | Galadriel's Glade | lothlorien | dusk |
| 1_352 | Lothlorien Woods | lothlorien | dusk |
| 2_120 | Valley of the Silverlode | lothlorien | dusk |
| 3_119 | House of Elrond | rivendell | day |
| 3_115 | Caras Galadhon | lothlorien | dusk |
| 11_231 | Caras Galadhon | lothlorien | dusk |
| 11_261 | Valley of the Silverlode | lothlorien | dusk |
| 17_147 | Imladris | rivendell | day |
| 18_136 | Mithlond | grey-havens | day |

---

## 7. MJ Prompt Workflow

### 7.1 Asset Pipeline Overview

```
Board Editor (composition guide)
        |
        v
MJ Prompt (3-layer template)
        |
        v
Midjourney (16:9 base image)
        |
        v
Runway Gen-3 (cinemagraph loop)
        |
        v
Game Engine (CSS variant filters at runtime)
```

### 7.2 Board Editor Composition Guides

The board editor (`board-editor/LotR_TCG_Board_Editor_v4.html`) produces visual composition guides for each archetype. These guides show:

- Exact zone positions and shapes at percentage coordinates on a 16:9 canvas
- Where the ground plane must be flat
- Where dramatic features should go (upper frame, edges)
- Camera tilt angle reference lines

Export the composition guide as an image and attach it to Midjourney as a reference alongside the text prompt.

### 7.3 Prompt Template Structure

Every MJ prompt follows a three-layer structure:

**Layer 1 -- Scene Description**
The specific location: what you see, the key landmark, the distinctive feature. This is the unique part of each prompt.

> *"a vast flat grassland stretching to the horizon under a dramatic sky, tall golden-green grass rippling in strong wind like ocean waves..."*

**Layer 2 -- Film Aesthetic Lock**
Constant across all prompts. Locks the output to PJ's visual language:

> *"Lord of the Rings film aesthetic, Peter Jackson production design, cinematic composition, atmospheric lighting..."*

**Layer 3 -- Game Board Constraints**
Constant across all prompts. Ensures the image works as a playing surface:

> *"16:9 aspect ratio, highly detailed environment, no characters no people no creatures no text, flat level [surface type] filling the lower half of the frame for game piece placement, low angle camera approximately [N] degrees above ground level looking [direction]..."*

**Parameters**: All prompts use `--ar 16:9 --style raw --v 6.1`.

### 7.4 Negative Space for Game Pieces

The critical constraint in every prompt: **the lower half of the frame must be flat, level, unobstructed terrain**. This is where card standees and game tokens are placed. Vertical obstructions (trees, pillars, characters) in this area make the board unplayable.

The upper half is where dramatic visual elements go -- mountains, towers, waterfalls, approaching armies, storm clouds. This split (utility below, drama above) is the fundamental composition rule.

### 7.5 Cinemagraph Animation

After generating the base MJ image, each landscape gets one looping motion element via Runway Gen-3 Alpha:

- **Water**: Rivers flowing, waterfalls cascading, rain falling, marsh bubbling
- **Fire**: Forge glow pulsing, lava flowing, torchlight flickering, siege fires
- **Wind**: Grass rippling, banners snapping, leaves drifting, clouds streaming
- **Atmosphere**: Mist drifting, smoke rising, dust motes, snow falling

The animation element is specified in each prompt's `Cinemagraph Element` field. The base image should compose cleanly for seamless looping of that element.

### 7.6 Post-Processing Checklist

For each landscape:

1. Generate MJ image with composition guide reference
2. Upscale to production resolution (minimum 3840x2160 for 4K displays)
3. Verify flat ground plane in lower half -- reject and regenerate if obstructed
4. Run through Runway Gen-3 for cinemagraph animation loop
5. Export as looping video (WebM or MP4)
6. Test all 4 CSS variant filters on the base image to ensure they read well
7. Load into game engine and verify zone overlays align with the terrain

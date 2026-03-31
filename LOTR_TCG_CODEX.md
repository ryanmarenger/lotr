# LOTR TCG Digital — Master Project Codex
### Claude Code Handoff Document · Compiled March 2026

---

## EXECUTIVE SUMMARY

A solo developer is building a **fully-featured personal digital implementation** of the Lord of the Rings Trading Card Game (Decipher, 2001–2007). This is a passion project, not commercial. The engine is being built with IP as a swappable data layer — intentionally architected so that the entire LOTR skin can eventually be replaced with original IP without rebuilding the engine.

**Current state:** Planning and tooling phase complete. Six-milestone roadmap finalized. All UX decisions documented (8 remain open). Complete visual asset catalog created. Cinemagraph production pipeline defined. Interactive board layout editor (v3) built and delivered. Card data and image sources identified. Ready to begin Milestone 1 implementation.

**The developer:** Works late-night sessions. Comfortable in HTML/CSS/JS. Not a Python programmer. Deeply familiar with LOTR TCG rules — do not explain game mechanics unless asked. AI is the sole art, sound, and coding assistant. Decisive — treat all documented decisions as locked.

---

## PART 1 — PROJECT SCOPE & ARCHITECTURE

### 1.1 Core Specification

| Parameter | Value |
|-----------|-------|
| Game | Lord of the Rings TCG by Decipher |
| Format | Expanded (all 19 sets legal) |
| Players | Online two-player (primary), AI opponent (high priority) |
| Rule enforcement | Full automated — no honor system |
| Board resolution | 1920×1080 (16:9) |
| Aesthetic | Cinematic living board — Peter Jackson film aesthetic |

### 1.2 The Six-Milestone Roadmap

**Milestone 1 — Card Database & Deck Builder**
- Import all ~3,500 card definitions from GEMP HJSON source
- Card images from lotrtcgwiki.com / Internet Archive RAR archive
- Searchable deck builder: filter by culture, card type, cost, keyword
- Export/import deck lists

**Milestone 2 — Local Two-Player Game, Basic Rules**
- Functional game loop: Fellowship phase → Shadow phase → Maneuver → Archery → Assignment → Skirmish → Regroup → Site advance
- Both players on same machine to validate rules
- Adventure path (9 sites), twilight pool, basic card play, hand management

**Milestone 3 — Full Card Effect Engine**
- Automated resolution of all ~3,500 card effects
- Keywords: Fierce, Damage+, Ranger, Ambush, Enduring, Archer, Unique, etc.
- Edge cases: site replacement, burden/threat interactions, Ring-bearer death, Frodo/Sam swap

**Milestone 4 — Cinematic Living Board & Full Sound Design**
- Site-specific cinemagraph backgrounds (looping MP4 via HTML5 `<video>`)
- Culture-specific card shimmer/glow on playable cards
- Howard Shore OST from local files
- ~50 battle/event SFX (Freesound, Mixkit)
- ~20–25 character voice catchphrases (ElevenLabs preferred)

**Milestone 5 — Online Multiplayer**
- Real-time two-player sync
- Lobby/matchmaking/waiting state
- Opponent's perspective mirrored correctly

**Milestone 6 — AI Opponent**
- AI plays a legal shadow deck vs. human fellowship player
- **Priority note:** This was ranked above multiplayer polish by the developer

### 1.3 Critical Architectural Principle — IP Data Layer

The entire LOTR IP must live in the **data/asset layer**, never hardcoded into the engine. Card names, images, flavor text, sounds, and location names are loaded from config/files. This is both good engineering and intentional future-proofing: if the engine is ever reskinned with original IP (a stated long-term interest), it becomes a reskin, not a rebuild. The GEMP card data is already structured this way.

---

## PART 2 — DATA SOURCES

### 2.1 Card Data — GEMP Repository

- **Source:** `github.com/PlayersCouncil/gemp-lotr`
- **Format:** HJSON card definitions
- **Coverage:** All 19 sets, full game text, all card effects
- **Use:** This is the authoritative card data source. Parse HJSON → internal card objects.
- **Note:** The GEMP project is a live Java-based LOTR TCG server. We are only borrowing its card data, not its engine.

### 2.2 Card Images

- **Primary:** `lotrtcgwiki.com` — fan wiki, nearly 3,500 cards organized by set
- **Secondary:** `wiki.lotrtcgpc.net` — Player's Council wiki
- **Bulk download:** Internet Archive RAR archive — all 19 sets, ~267MB total
- **Naming convention:** Consistent with GEMP card IDs

### 2.3 Rules Reference

- **Comprehensive Rules 4.1:** `wiki.lotrtcgpc.net/wiki/Comprehensive_Rules_4.1`
- This is the definitive rules document. The engine must comply with it.

---

## PART 3 — CONFIRMED UX DECISIONS

### 3.1 Cards in Hand

- Displayed as a **flat horizontal row of thumbnails** along the bottom of screen
- Cards **lift and expand on hover** for inspection
- Cards are **played by dragging** from hand onto the board

### 3.2 Playable Card Indication — Culture-Specific Shimmer

Playable cards glow with a culture-specific color. Unplayable cards show a tooltip explaining the missing requirement + failure sound. Tooltips are togglable in settings.

| Culture | Glow Color |
|---------|------------|
| Shire / Hobbit | Warm green |
| Gondor | Silver-white |
| Rohan | Gold / wheat |
| Elven | Pale silver-blue |
| Dwarven | Deep orange-bronze |
| Gandalf | Pure white / grey |
| Sauron | Dark red / black |
| Ringwraith | Deep indigo / void |
| Isengard | Cold iron grey |
| Moria / Uruk-hai | Sickly green |

### 3.3 Discard Pile

- Side panel showing last 5–7 cards
- **Card-flip animation** on open
- Scrollable via mouse wheel or arrow keys
- Both players can inspect each other's discard piles (rules-legal)

### 3.4 Rules System — Three Layers

1. **Separate searchable rulebook window** — full Comprehensive Rules 4.1
2. **Right-click card-specific rulings** — card text, keyword interactions, errata
3. **Clickable keywords inline on card text** — hover/click for keyword definition

### 3.5 Assignment Phase

- **Location-dependent mist or atmospheric overlay** rolls in
- **Drag-to-assign** mechanic — drag minion to companion to assign
- **Auto-assign button** available as fallback

### 3.6 Phase Tracker

- **Persistent icon/symbol bar** — always visible
- Inactive phases **grayed out**; active phase **lights up** with animation
- **Hover tooltips** on each icon explaining what happens in that phase
- **Style:** Illuminated manuscript / ornate fantasy — not generic UI

**8 Phase Icons:**

| # | Phase | Icon Description |
|---|-------|-----------------|
| 1 | Fellowship | Walking figure / One Ring motif |
| 2 | Shadow | Dark eye / lurking shadow |
| 3 | Maneuver | Crossed swords / footprint |
| 4 | Archery | Drawn bow and arrow |
| 5 | Assignment | Opposing shields / pointing hand |
| 6 | Skirmish | Two figures clashing / burst |
| 7 | Regroup | Healing hand / campfire |
| 8 | Move / Site Advance | Winding road with milestone marker |

### 3.7 Board Layout

- **16:9 widescreen** (1920×1080 target)
- Cinemagraph backgrounds fill the full screen
- Card zones are **semi-transparent overlays** on top of landscape
- **Multiple layout variations** — card zones positioned in compositionally "quiet" areas so dramatic landscape features remain visible
- Goal: no two site backgrounds are covered the same way

### 3.8 Board Zone Inventory

These zones must exist on the board (position is variable by layout):

| Zone | Description |
|------|-------------|
| Fellowship Zone | Companions in play — Free Peoples player |
| Shadow Zone | Minions in play — Shadow player |
| Adventure Path | 9 site cards in sequence (horizontal strip) |
| Hand | Current player's cards (bottom of screen) |
| Draw Deck | Face-down stack |
| Discard Pile | Face-down with side-panel browser |
| Dead Pile | Dead companions |
| Support Area | Conditions, allies, artifacts on board (not attached to characters) |
| Twilight Pool | Coin/token display |
| Ring-bearer Portrait | Frodo (or Sam) with burden counter |
| Threat/Burden Tracker | Visual display of corruption level |

---

## PART 4 — OPEN UX QUESTIONS (8 Unanswered)

These were raised but never resolved. Claude Code should prompt the developer for answers before implementing the relevant systems:

1. **Wound tokens** — how displayed on companions? (stacked counters? numeric badge? visual marker on card?)
2. **Twilight pool** — exact visual treatment? (physical coins? glowing orbs? just a number?)
3. **Multiplayer waiting state** — what does the screen show while waiting for opponent?
4. **Game log** — yes or no? What does it show? Where does it live on screen?
5. **Fellowship position indicator** — how is current site number/progress shown? (minimap? icon on adventure path?)
6. **Character death animation** — what happens visually when a companion is killed?
7. **Passing priority** — how is "I pass" communicated between players?
8. **Ring-bearer corruption urgency** — how is high burden (e.g., 10+) signaled beyond the token count? (screen color shift? sound? Barad-dûr rising?)

---

## PART 5 — VISUAL ASSETS CATALOG

### 5.1 Site Backgrounds — All Blocks

All backgrounds are **cinemagraphs**: still images with one looping animated element. Implemented as looping HTML5 `<video>` tags behind card zones.

**Production pipeline:** Midjourney (base image, `--ar 16:9 --style raw`) → Runway Motion Brush (mask one element, add motion) → download MP4 → use in-game.

**Midjourney prompt template:**
```
isometric fantasy landscape, [location], Lord of the Rings film aesthetic, Peter Jackson, painterly, cinematic, atmospheric lighting, wide aspect ratio, highly detailed, no characters --ar 16:9 --style raw
```

#### Fellowship Block
| Site | Location | Cinemagraph Element |
|------|----------|---------------------|
| 1 | The Shire / Bag End | Chimney smoke drifting |
| 2 | Road to Bree | Rain on cobblestones / swinging inn sign |
| 3 | Rivendell | Cascading waterfalls |
| 4 | Caradhras / Moria Entrance | Blizzard OR black lake ripple |
| 5 | Bridge of Khazad-dûm | Lava flow + rising embers |
| 6 | Dimrill Dale / Lothlórien | Silver leaf shimmer on mallorn trees |
| 7 | River Anduin | River current and reeds |
| 8 | Pillars of the Kings | Mist drifting across Nen Hithoel |
| 9 | Amon Hen | Rauros waterfall in distance |

#### Towers Block
| Site | Location | Cinemagraph Element |
|------|----------|---------------------|
| 1 | Eastern Rohan | Tall grass rolling in waves |
| 2 | Fangorn Forest | Ancient trees breathing / green light shaft |
| 3 | Edoras / Golden Hall | Rohan banners snapping in wind |
| 4 | Rohan Plains / Dunharrow | Horse mane in wind / campfire |
| 5–7 | Helm's Deep | Driving rain on stone + army torches |
| 8–9 | Isengard / Orthanc | Furnace glow + flooding water + crows circling |

#### King Block
| Site | Location | Cinemagraph Element |
|------|----------|---------------------|
| 1–2 | Dunharrow / Paths of Dead | Ghost-light pulse in mountain passage |
| 3–6 | Minas Tirith (7 circle variants) | Beacon fire + Gondor banners |
| 7 | Osgiliath | River fog under broken bridge |
| 8 | Ithilien / Morgul Vale | Morgul-light pulse from the tower |
| 9 | Black Gate / Mordor | Ash falling + Eye of Sauron pulse |

**Mood arc:** Fellowship Block = water (wonder/beauty) → Towers Block = fire/wind (war arriving) → King Block = unnatural light (wrong/ominous)

**Note:** Sites sharing a location reuse the same background video. Card mechanics change, visual environment does not.

#### Runway Motion Prompt Cheat Sheet
| Element | Runway prompt |
|---------|--------------|
| Waterfall | "water flowing downward continuously, mist rising at base" |
| Lava | "molten rock flowing slowly, glowing orange, heat shimmer" |
| Falling leaves | "leaves gently falling, slow drift, slight rotation" |
| Torch / fire | "flame flickering naturally in a breeze" |
| Mist / fog | "fog drifting slowly left to right, wispy" |
| Rain | "rain falling diagonally, streaks, wet surface ripples" |
| Smoke | "smoke rising slowly, dispersing, dark grey" |
| River | "water flowing slowly downstream, gentle surface movement" |
| Embers | "glowing embers rising upward, floating, orange sparks" |
| Banners | "fabric banner rippling and snapping in the wind" |

#### HTML5 Video Implementation
```html
<video
  src="sites/rivendell.mp4"
  autoplay loop muted playsinline
  style="position:absolute; width:100%; height:100%; object-fit:cover;"
></video>
```
`muted` is required for browser autoplay. Howard Shore soundtrack plays on a separate audio track.

### 5.2 Culture Shimmer Overlays (10 assets)

PNG border frames at card dimensions with animated glowing edge. One per culture. Colors defined in section 3.2.

### 5.3 Phase Tracker Icons (8 icons × 2 states = 16 assets)

- **Dimensions:** 48×48px
- **Style:** Ornate line-art, illuminated manuscript
- **States:** Active (lit) and Inactive (grayed out)
- Icons described in section 3.6

### 5.4 Game Tokens (~10 assets)

Circular/shield-shaped tokens, 3 sizes:

| Token | Description |
|-------|-------------|
| Wound token | Red/crimson — placed on wounded companions |
| Twilight token | Blue-white glowing coin |
| Burden / corruption token | Dark gold Ring motif |
| Vitality marker | Heartbeat / flame |
| Strength modifier | Fist / shield with +/- number |
| Exerted state | Rotated indicator (card is exhausted) |
| Dead pile marker | Skull / gravestone |
| Fellowship position indicator | Milestone marker on path |
| Ring-bearer portrait frame | Ornate gold frame |

### 5.5 Screen Backgrounds (~8 assets)

| Screen | Description |
|--------|-------------|
| Main menu | Epic wide landscape |
| Deck builder | Bilbo's study table |
| Rulebook | Parchment texture |
| Card inspect overlay | Dark vignette frame |
| Victory screen | Light/heroic |
| Defeat screen | Dark/somber |
| Loading screen | Rotating Ring with Tengwar inscription |
| Multiplayer lobby | (Visual TBD — open UX question #3) |

### 5.6 Card Type & Keyword Icons (~20 icons)

**Dimensions:** 16–24px inline

| Icon | Description |
|------|-------------|
| Companion | Cloaked traveler figure |
| Minion | Armored dark figure |
| Ally | Standing figure, non-combatant |
| Artifact | Glowing object/relic |
| Condition | Scroll / ongoing parchment |
| Event | Lightning bolt / burst |
| Possession | Backpack / equipment |
| Site | Location pin / castle silhouette |
| Twilight cost | Half-moon coin |
| Strength | Fist or shield |
| Vitality | Heart or flame |
| Resistance (Ring-bearer) | Ring inside fire |
| Damage +1/+2 | Jagged downward arrow with number |
| Fierce | Two crossed blades |
| Ambush | Figure behind rock |
| Ranger | Leaf pin / green cloak clasp |
| Ring-bearer | Small stylized Ring |
| Archer | Bow |
| Unique | Star or diamond |
| Draw | Card stack with upward arrow |

### 5.7 Event Flash Art (~12 assets)

Full-bleed dramatic illustrations for major game events:

1. Balrog erupts from Moria
2. Gandalf returns as White
3. One Ring tempts (corruption screen)
4. Nazgûl shriek
5. Ents march on Isengard
6. Rohirrim charge at Pelennor
7. Phial of Galadriel
8. Paths of the Dead open
9. Sauron's tower falls
10. Sam carries Frodo up Mt. Doom
11. Character death flash (generic)
12. Priority passing icon

---

## PART 6 — SOUND DESIGN PLAN

### 6.1 Music

- **Source:** Howard Shore OST — developer owns local files, plays from local path
- **Implementation:** Separate audio track, site-specific or phase-specific cues
- **Note:** Not a streaming/CDN asset — loaded from `music/` folder

### 6.2 Sound Effects

- **Source:** Freesound.org + Mixkit (free tier)
- **Quantity:** ~50 battle and event sounds
- **Triggered by:** Card plays, phase transitions, skirmish outcomes, burden increase, site advance

### 6.3 Voice Catchphrases

- **Characters:** ~20–25 named characters
- **Preferred source:** ElevenLabs AI voice generation
- **Fallback:** Manually clip from fan sites
- **Film clip extraction workflow (if needed):**
  1. ScreenApp — find timestamp of specific dialogue in film
  2. LALAL.AI — isolate dialogue from background score
  3. Export clean audio clip

---

## PART 7 — BOARD LAYOUT EDITOR (BUILT)

### 7.1 What Exists

**File:** `LotR_TCG_Board_Editor_v3.html` — fully functional standalone HTML tool

This is a design tool for the developer to compose board layouts. It is NOT the game itself.

### 7.2 Features

- **Board canvas:** Scales to fit window, respects aspect ratio (16:9, 2:1, 16:10)
- **Component system:** All game zones as draggable, resizable, rotatable components
- **Layer system:** 6 layers (Landscape, Shadow, Neutral, Fellowship, Interface, Hand) with visibility toggle
- **Negative space canvas:** Golden glow overlay shows uncovered landscape — helps place zones to preserve scenic areas
- **Horizon line:** Draggable line to mark where sky meets terrain
- **Grid overlay:** Rule-of-thirds + center crosshair
- **3D perspective tilt:** Board X/Y tilt + depth controls (for visualizing camera angle)
- **Toybox:** Shapes, site card placeholders, icons, labels to add freely
- **Undo/redo:** Full stack (Cmd+Z / Cmd+Shift+Z)
- **Alignment tools:** Left/right/top/bottom/center H/center V/distribute H/distribute V (multi-select)
- **Per-component controls:** Rotation, skewX, skewY, opacity, layer, bg color, border color, text color
- **Fellowship/Shadow view toggle:** Highlights the active player's zones
- **Burden slider:** Simulates burden count — updates Barad-dûr indicator and twilight pool live
- **Save/Load:** Export as HTML (self-contained with state baked in) or JSON
- **Keyboard:** Arrow keys nudge (0.1% / 0.5% with Shift), Delete removes, Escape deselects, Cmd+D duplicates

### 7.3 Pre-Built Zone Components

These are defined in `COMP_TEMPLATES`:

- Phase Tracker (7-phase dot bar)
- Shadow Zone
- Fellowship Zone
- Skirmish Left / Skirmish Right
- Twilight Pool (live coin display)
- Adventure Path
- Hand Fan (arc of 8 card backs)
- Pass Button
- Opponent Hand Count
- Action Log
- Left Dock / Right Dock (side panels)
- Barad-dûr Indicator (rises with burdens)
- Opp. Piles / Your Piles (draw + discard stacks)
- Ring-bearer / Ring Spinner
- Terrain BG / Sky BG blocks
- Custom Zone (blank)

### 7.4 Specialized Renderers

- `renderPhaseTracker()` — animated dot bar with labels
- `renderTwilightPool()` — live coin grid keyed to burden slider
- `renderFanArc()` — SVG arc of card backs with culture-specific shimmer on some
- `renderBaradur()` — tower that grows with burden count, with glow effect
- `renderRingSpinner()` — rotating Ring SVG with RB label
- `renderSVGIcon()` — inline SVG library: ring, eye, sword, shield, mountain, tree, flame, tower, crown

---

## PART 8 — IP & LEGAL CONTEXT

**For Claude Code's awareness only — not an active concern for implementation:**

- Decipher Inc. dissolved ~2007. No company to sell to or negotiate with.
- LOTR IP (characters, locations, names) is held by Middle-earth Enterprises / Saul Zaentz Company (Tolkien licensing chain).
- Card artwork: fan-sourced, not owned by developer.
- Howard Shore music: Warner/New Line.
- **As a personal non-commercial project:** standard fan project — very low risk.
- **Game mechanics are not copyrightable.** The twilight pool system, fellowship/shadow structure, and all mechanical systems are legally free for anyone to use.
- **The developer's engine code, UI design, and original work are fully owned by the developer.**
- **Long-term:** The IP layer is intentionally thin and swappable. If this ever goes commercial, a full IP reskin (original universe, rewritten card text, new artwork) is the path — not licensing LOTR.

---

## PART 9 — SITE BLOCK STRUCTURE (LOTR TCG EXPANDED FORMAT)

For the adventure path and site card logic:

| Block | Sets | Sites |
|-------|------|-------|
| Fellowship Block | Sets 1–3 | Shire → Amon Hen (9 sites) |
| Towers Block | Sets 4–6 | Eastern Rohan → Isengard (9 sites) |
| King Block | Sets 7–9 | Dunharrow → The Black Gate (9 sites) |
| Shadows+ | Sets 10–19 | Unnumbered sites, flexible path construction |

In Expanded format, all 19 sets are legal. Site path construction varies by block rules.

---

## PART 10 — WHAT CLAUDE CODE SHOULD DO NEXT

In order of priority:

### Immediate — Milestone 1 Foundation

1. **Set up project structure**
   - `/cards/` — parsed card data (JSON from GEMP HJSON)
   - `/images/cards/` — organized by set, named by card ID
   - `/sites/` — cinemagraph MP4s (placeholder until produced)
   - `/music/` — local Howard Shore files (path reference)
   - `/sounds/` — SFX files
   - `/voices/` — character catchphrases

2. **Parse GEMP HJSON card data**
   - Clone `github.com/PlayersCouncil/gemp-lotr`
   - Locate HJSON card definition files
   - Write parser to normalize into clean JSON card objects
   - Fields needed: id, name, culture, type, twilight cost, strength, vitality, resistance, keywords[], game text, set number, image URL

3. **Build deck builder UI**
   - Grid of cards with image + stats
   - Filter bar: culture, type, cost, keyword, text search
   - Deck list panel (companion count enforcement, shadow deck limits)
   - Save/load deck as JSON

### Before Milestone 2

4. **Resolve the 8 open UX questions** (section 4) — prompt developer for answers

5. **Define game state model** — the single source of truth object that captures the entire game state at any moment (required for multiplayer sync and AI)

### Architecture Guidance for Claude Code

- Keep all LOTR IP in data files, never in engine logic
- Game state must be serializable (JSON) for multiplayer
- Card effects should be a data-driven system, not 3,500 individual functions
- Build for one-player view (online perspective) from the start — don't design for shared-screen local play
- The board editor (`LotR_TCG_Board_Editor_v3.html`) is a design tool, not game code — treat its zone positions as a design spec to implement

---

## APPENDIX A — KEY URLS

| Resource | URL |
|----------|-----|
| GEMP card data | `github.com/PlayersCouncil/gemp-lotr` |
| Card images (wiki) | `lotrtcgwiki.com` |
| Card images (PC) | `wiki.lotrtcgpc.net` |
| Card images (bulk) | Internet Archive RAR (~267MB, all 19 sets) |
| Comprehensive Rules | `wiki.lotrtcgpc.net/wiki/Comprehensive_Rules_4.1` |
| Midjourney | `midjourney.com` |
| Runway Motion Brush | `runwayml.com` |
| Kling AI (alt) | `klingai.com` |
| ElevenLabs (voice) | `elevenlabs.io` |
| ScreenApp (film clips) | `screenapp.io` |
| LALAL.AI (audio isolation) | `lalal.ai` |
| Freesound (SFX) | `freesound.org` |
| Mixkit (SFX) | `mixkit.co` |

---

## APPENDIX B — DECISIONS THAT ARE LOCKED (DO NOT RE-LITIGATE)

- All 19 sets, Expanded format ✓
- GEMP HJSON as card data source ✓
- lotrtcgwiki / Internet Archive for images ✓
- 1920×1080 16:9 board ✓
- Midjourney → Runway → MP4 cinemagraph pipeline ✓
- Howard Shore OST from local files ✓
- ElevenLabs for voice (preferred) ✓
- Cards played by drag ✓
- Culture-specific shimmer on playable cards ✓
- Flat horizontal hand row ✓
- Discard pile as side panel with flip animation ✓
- Three-layer rules system ✓
- Atmospheric mist overlay for Assignment phase ✓
- Persistent phase tracker icon bar ✓
- Online two-player multiplayer ✓
- AI opponent (high priority, ranked above multiplayer polish) ✓
- IP as swappable data layer ✓

---

*End of codex. All information compiled from lotr-01 through lotr-05 project conversations.*

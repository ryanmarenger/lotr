# LOTR TCG Digital — Living Plan

> This document tracks progress, decisions, todos, and errors. Updated after every work session.
> Last updated: 2026-04-03

---

## Current Status
**Milestone 2 — Local Two-Player Game**
**Phase: Board UI art production (2.7)**

---

## Milestone 1 — Card Database & Deck Builder

### Tasks

- [x] **1.1 Project scaffold** — SvelteKit + TypeScript project initialized, dependencies installed
- [x] **1.2 Clone GEMP data** — Sparse checkout of PlayersCouncil/gemp-lotr, 225 HJSON files
- [x] **1.3 HJSON parser** — `tools/parse-gemp.ts` → 3,089 cards, zero errors, 20 set files + combined files
  - Fixed: `Wraith` → `Ringwraith` culture mapping, added `Follower` card type
  - Output: `data/cards/all-cards.json` (3.5 MB), `all-cards-summary.json` (1.6 MB)
- [x] **1.4 Card image pipeline** — `tools/map-images.ts` → 3,070/3,089 images mapped (99.4%), symlinks created
  - 19 missing: set 14 (naming convention differs), 3 set 15 alt-art cards
- [x] **1.5 Card data API** — SvelteKit server routes: `/api/cards` (search), `/api/cards/[id]`, `/api/cards/filters`
- [x] **1.6 Deck builder UI (v1)** — Card grid, filter bar (6 dropdowns + text search), card detail panel
  - Card grid: auto-fill grid, culture-colored titles, twilight cost, unique markers, hover effects
  - Filter bar: text search (debounced), side/culture/type/race/rarity/set dropdowns
  - Detail panel: full card image, stats, game text with bold formatting, set/rarity info
  - Pagination: 60 cards per page, prev/next navigation
- [x] **1.7 Deck list panel** — Double-click to add, deck sidebar with 4 sections (RB+Ring, FP, Shadow, Adventure), remove cards, card counts, sorted entries, culture-colored names, toast notifications
- [x] **1.8 Deck validation** — Live validation: RB required, One Ring required, FP min 30, Shadow min 30, Adventure exactly 9, unique card limits (1), non-unique limits (4)
- [x] **1.9 Deck persistence** — JSON export/import via deck panel buttons, deck rename, clear deck

### Completed
- 1.1 through 1.9 (2026-03-27) — MILESTONE 1 COMPLETE

---

## Milestone 2 — Local Two-Player Game
**Phase: In progress — game state model complete**

- [x] 2.1 Game state model (typed interfaces for full game snapshot)
  - `src/lib/types/game.ts` — GameState, CardInGame, Player, Skirmish, GameAction, ClientGameView, all zones/phases/enums
  - `src/lib/engine/state.ts` — createGameState(), 20+ query helpers, client view filtering, stat calculations
- [x] 2.2 Phase state machine (8 phases with transition rules)
  - `src/lib/engine/phases.ts` — Full turn engine: startTurn, advancePhase, moveFellowship, resolveCurrentSkirmish
  - All 7 phases with proper transitions and sub-steps
  - Priority passing system (both pass → advance)
  - Movement: site placement, twilight generation (site cost + companion count)
  - Archery: archer keyword counting, wound totals
  - Assignment: shadow assigns minions → FP assigns defenders
  - Skirmish: strength comparison, overwhelm, damage bonus, wound distribution
  - Fierce round loop (re-assignment + skirmish for fierce minions)
  - Regroup: minion discard, reconcile, move-again decision
  - Win conditions checked at every state change (corruption, RB death, fellowship victory)
- [x] 2.3 Card play validation (twilight cost, site control, uniqueness)
- [x] 2.4 Adventure path (9 sites, movement logic)
- [x] 2.5 Basic combat (strength comparison, overwhelm, wounds)
- [x] 2.6 Hand management (draw, discard, mulligan)
  - `src/lib/engine/actions.ts` — Complete action dispatch and validation engine
  - executeAction: main entry point, dispatches all 12 action types
  - Card play: phase restrictions, uniqueness check, twilight cost (FP adds, Shadow removes), roaming penalty, item class uniqueness, target validation for attachments
  - Card placement: companions → fellowship, minions → shadow, possessions/artifacts → attached, events → discard, conditions → attached or support
  - Movement: auto-selects site from adventure deck, delegates to moveFellowship
  - Assignment: shadow assigns minions, FP assigns defenders, fierce round support
  - Archery: wound assignment to companions or minions
  - Hand management: mulligan (return + shuffle + redraw), reconcile (discard to 8), keep hand
  - Concede: instant game over
- [ ] 2.7 Game board UI (zones from board editor layout)
  - **Current: Art production for border frame elements (Midjourney)**
  - Reference template: `board-editor/border-reference-1920x1080.html` — pixel-perfect 1920×1080 reference with mask/annotated/export modes, uses identical clip-path algorithm as board editor v4
  - Three separate border structures to produce as art:
    - **L-Border Frame** — left spine + top shelf + brackets (concave arcs) + bottom shelves + strip + horn bracket. Bounding box: (0,0)→(953,1080). 7 inset cutout areas (Twilight Pool, Adventure HUD, Phase Jewel, Doors of Durin, Palantír, Red Book, Horn of Gondor)
    - **Narsil Shelf** — top center display shelf with quarter-circle end caps. Bounding box: (670,0)→(1515,84), 845×84px. Contains Narsil Shards decorative area
    - **Portrait Bracket** — right edge bracket with 2 portrait frame cutouts. Bounding box: (1798,375)→(1920,613), 122×238px
  - Concave arc shapes are quarter-circle clip-paths (N=40 segments, unit circle centered on opposite corner of bbox), rendered as elliptical arcs because bboxes aren't square
  - After art production: composite into SvelteKit game board, build functional inset components
- [ ] 2.8 Turn flow UI (phase indicator, action prompts)

---

## Design Decisions — Board Perspective & Card Presentation

### Card Tilt & Readability Strategy

Cards sit on the isometric landscape at an angle matching the scene's perspective. This makes them feel *in* the world but creates a readability tradeoff. Three-layer solution:

### Card Presentation: Standees on Landscape

Cards are presented as **board game standees** — upright cards in heavy stone/metal bases that sit on the landscape surface. Not flat, not floating. Physical objects in the world.

**Default state:** Cards face the imaginary player (angled slightly away from the camera, like real standees on a table you're sitting at). Culture-colored card borders, twilight cost badge, and card art visible at a glance.

**Placement:** When a card enters play, the standee drops onto the board with weight. A **site-specific particle burst** erupts from the base: dust on plains, mud at Bree, stone chips in Moria, embers in Mordor, golden leaves in Lothlórien. [SOUND] socket fires here.

**Wound markers:** Red glowing dots stacked on the upper-right corner of the card. Visible at all zoom levels.

**Three interaction layers:**
1. **Hover** — Card rotates to face the user directly + lifts slightly + stat badges appear overhead (name, strength, vitality). Smooth 0.35s transition.
2. **Click** — Card slides into the **card shelf** (see below) for side-by-side comparison at readable size. Multiple cards can be shelved simultaneously.
3. **Double-click** — Full isolated 2D inspection: full art, game text, rulings, errata. Blurred backdrop overlay.

### Card Shelf (the "Fore")

A semi-transparent comparison column along the **left edge** of the screen. Cards clicked from the board slide into this shelf at readable size, stacked vertically. Left edge chosen because: the player sits lower-right with the hand fan — the left side is the free edge, and placing cards there is like setting them aside away from your active hand. Used for:
- Comparing your companion's strength vs an assigned minion
- Reviewing multiple cards' game text for combo planning
- Examining attached possessions alongside their bearer

Behavior:
- Invisible when empty (zero visual weight)
- Appears when first card is clicked into it
- Holds 3-4 cards stacked vertically, slight overlap if more
- Click a card in the shelf to dismiss it back to the board
- Shelf sits above the board layer, below the inspect overlay

### Phase-Aware Card Mode (Immersive ↔ Tactical)

The board has two card display modes that **auto-switch based on game phase**, with manual override (Tab key):

| Mode | Cards | Landscape | When |
|------|-------|-----------|------|
| **Immersive** | Smaller, face the player (angled away), sit low to board. Atmospheric. | Dominant — full cinemagraph experience. | Fellowship, Shadow, Regroup phases |
| **Tactical** | Larger, rotate to face user, stats visible on all cards simultaneously. | Recedes — still visible but cards take priority. | Assignment, Skirmish phases |

**Transition:** When skirmish begins, all cards smoothly rotate to face the user over ~0.5s. The board "focuses" for combat. After regroup, cards ease back to immersive orientation. The shift is cinematic, not jarring — like the camera is "leaning in" for the fight.

**Manual override:** Tab toggles between modes at any time. Player preference persists until the next auto-switch. Settings option to disable auto-switch entirely.

### Hand Fan — Realistic Card Hold

The player's hand is NOT a spread-out display of full cards. It's a **realistic fan** of overlapping cards, like holding physical cards:

- Cards overlap significantly — only the top ~30% of each card is visible (enough to see art, cost badge, and title)
- The arc's bottom edge extends **off-screen** — the "wrist" and lower cards disappear below the viewport
- A **visible thumb** holds the fan at the lower-right corner, peeking up from the screen edge
- Hover a card in the fan → it lifts out of the fan, fully visible, readable
- Click to play (drag to board zone)

**Thumb variants by race/culture (thematic hand holding the cards):**

| Player Side | Thumb/Hand | Description |
|-------------|-----------|-------------|
| Shire | Small, weathered hobbit thumb | Bare, slightly dirty, warm skin |
| Gondor | Mailed gauntlet | Steel plate, leather underneath |
| Rohan | Leather riding glove | Worn, golden-brown |
| Elven | Slender, pale fingers | Elegant, faintly luminous |
| Dwarven | Thick, calloused thumb | Broad, stone-dust |
| Shadow (Sauron) | Gnarled orc claw | Dark, scarred, clawed nail |
| Shadow (Isengard) | Iron-plated Uruk hand | Black steel, brutal |
| Shadow (Ringwraith) | Spectral, semi-transparent | Wispy, pale, ghostly |

**Which thumb appears:** Determined by the player's deck culture majority, or the Ring-bearer's race for FP player. Shadow player thumb matches their dominant shadow culture. This is a subtle, delightful detail — it tells you who you ARE without any text.

**Space impact:** The fan occupies roughly 25% width × 12-15% height in the lower-right corner. Much smaller than a full card display. The landscape is barely obstructed.

### Assignment Phase — Separate View

Assignment is NOT played on the board. It gets its own dedicated UI:

**Shadow player's view:**
- Two horizontal rows presented face-on (no isometric tilt):
  - **Top row:** Shadow player's minions currently in play
  - **Bottom row:** Fellowship companions currently in play
- Shadow player drags/clicks minions to assign them to companions (visual link/arrow appears)
- "Confirm Assignments" button when done
- After confirmation, cards animate back onto the board and slide into their assigned skirmish positions

**Fellowship player's view (while waiting):**
- The One Ring spins slowly at center screen
- Poignant, inspiring, iconic quotations from the books cycle through:
  - "Even the smallest person can change the course of the future." — Galadriel
  - "There is some good in this world, and it's worth fighting for." — Sam
  - "All we have to decide is what to do with the time that is given us." — Gandalf
  - "I would rather share one lifetime with you than face all the ages of this world alone." — Arwen
  - (Full quote library to be curated — 30-50 quotes from the books)
- Subtle atmospheric background (dark, moody, the calm before storm)
- This waiting state builds tension — you know minions are being assigned but don't know how

### Per-Site Arc Layout (Gentle / Moderate / Steep)

Each site has its own `arcLayout` profile in `src/lib/data/site-cameras.ts`, driven by the location's character — not its position in a sequence:

| Arc Layout | Feel | Tilt Range | Zone Spread | Sites |
|------------|------|-----------|-------------|-------|
| **Gentle** | Open, spacious, wide sky | 12-16° | Wide arcs, thin bands | Shire, Lothlórien, Anduin, E. Rohan, Rohan Plains, **Black Gate** |
| **Moderate** | Balanced, vertical features | 18-25° | Medium arcs | Bree, Rivendell, Pillars, Amon Hen, Edoras, Helm's Deep (outer), Isengard, Minas Tirith (lower) |
| **Steep** | Enclosed, claustrophobic | 28-35° | Narrow arcs, compressed | Caradhras, Khazad-dûm, Fangorn, Helm's Deep (deep/hornburg), Dunharrow, Paths of Dead, Minas Tirith (upper/citadel), Osgiliath, Morgul Vale |

**Black Gate is intentionally gentle** — the terror is the vastness, not the enclosure.

**Helm's Deep progressively steepens** across 3 sites (moderate → steep → steep) as the siege tightens.

**The variety is driven by narrative**, not formula. Each site's arc layout is a design decision about how that location should feel.

### Player Position & Radial Zone Layout

**The player sits at the lower-right**, looking toward a focal point at approximately **(33%, 33%)** of the screen — slightly more than a third from the upper-left corner.

All zones radiate outward from the player's position as **arc segments**, not rectangles:

| Zone | Arc Position | Distance from Player |
|------|-------------|---------------------|
| Hand fan | Touching player (off-screen edge) | Closest |
| Fellowship zone | Inner arc | Near |
| Skirmish zone | Middle arc | Mid |
| Shadow zone | Outer arc | Far |
| Adventure path | Arc or line cutting across | Varies by layout |

**Why arcs, not rectangles:** When you sit at a table and spread cards, they naturally curve in front of you. The zones follow the curvature of the player's reach. This creates an organic, table-game feel where everything is oriented toward the player — angled, possibly curved, all player-facing.

The player's focal point (33%, 33%) means:
- Cards near the player (lower-right) appear larger (perspective)
- Cards at the far arc (upper-left) appear smaller
- The landscape's dramatic focal point should be composed near the player's gaze target
- The Barad-dûr / corruption indicator naturally sits in the far distance (upper area)

### Standee Ground Requirements

Standee bases MUST sit on flat terrain. This is a **composition constraint for landscape art**:
- Fellowship zone, shadow zone, AND skirmish zone areas must be composed as relatively flat ground in the cinemagraph
- Variation in isometric height between standees is fine (slight undulation, stepped terrain)
- But each individual base sits on a level surface — no cards perched on cliff edges or steep slopes
- Midjourney prompts should specify flat ground areas in the zones where cards will land
- Dramatic terrain (cliffs, waterfalls, towers) should be in the landscape's quiet zones where no cards sit

### Skirmish View Shift

During assignment phase, assigned cards slide into the skirmish zone. When skirmish resolves, the view shifts toward a **more top-down angle** for combat readability — you need to clearly see strength values and wound counts. After skirmish, the camera eases back to the site's normal perspective. This creates a natural cinematic rhythm: landscape → tighten for combat → release back to landscape.

### Per-Site Camera Profiles

Each site defines not just a background video but a **camera profile**: horizon height, tilt angle, and mood. The perspective itself is a narrative tool — you *feel* the space of each location through the camera, not just the image.

| Parameter | Low Value | High Value |
|-----------|-----------|------------|
| **Horizon** (0-100%) | Low = vast sky, open world | High = ground-heavy, enclosed |
| **Tilt X** (0-40°) | 0 = flat/top-down | 40 = steep isometric |
| **Mood** | warm/expansive | cold/oppressive |

#### Fellowship Block — Camera Profiles
| Site | Location | Horizon | Tilt | Feel |
|------|----------|---------|------|------|
| 1 | The Shire | 25% | 15° | Low horizon, gentle tilt. Open, peaceful. Big sky. The world is kind. |
| 2 | Road to Bree | 35% | 20° | Slightly tighter. Rain closes the world in. Road narrows. |
| 3 | Rivendell | 30% | 18° | Open but vertical — waterfalls need height. Majestic, not cramped. |
| 4 | Caradhras / Moria Entrance | 50% | 28° | Horizon rises. Mountains pressing in. Cold. The pass is failing. |
| 5 | Bridge of Khazad-dûm | 65% | 35° | Almost top-down. Underground — no sky. Tight, lava below. Most claustrophobic Fellowship site. |
| 6 | Dimrill Dale / Lothlórien | 28% | 16° | Horizon drops — sky returns. Relief after Moria. Ethereal, breathing room. |
| 7 | River Anduin | 22% | 14° | Very low horizon. Wide river, open sky. Journey's calm before the storm. |
| 8 | Pillars of the Kings | 30% | 20° | Medium — tall statues need vertical space. Monumental. |
| 9 | Amon Hen | 40% | 25° | Trees closing in. Decision point. Tension rising. |

#### Towers Block — Camera Profiles
| Site | Location | Horizon | Tilt | Feel |
|------|----------|---------|------|------|
| 1 | Eastern Rohan | 18% | 12° | Lowest horizon in the game. Endless grassland. Maximum spaciousness. |
| 2 | Fangorn Forest | 60% | 30° | Trees closing overhead. Compressed, ancient, watchful. |
| 3 | Edoras / Golden Hall | 30% | 20° | Open hilltop, but focused on the hall. Rohan's last stand. |
| 4 | Rohan Plains / Dunharrow | 25% | 15° | Open again. Muster of the Rohirrim. Army needs space. |
| 5-7 | Helm's Deep | 45→55→60% | 25→30→35° | Progressive compression over 3 sites. The siege tightens. |
| 8-9 | Isengard / Orthanc | 40% | 25° | Industrial. Orthanc tower needs height. Smoke and machinery. |

#### King Block — Camera Profiles
| Site | Location | Horizon | Tilt | Feel |
|------|----------|---------|------|------|
| 1-2 | Dunharrow / Paths of Dead | 60% | 32° | Mountain passage. Underground ghost-light. Enclosed. |
| 3-6 | Minas Tirith | 35→40% | 20→25° | City rising in tiers. Needs vertical space for the 7 circles. Progressively tighter as siege closes. |
| 7 | Osgiliath | 50% | 28° | Ruined city. Broken. Claustrophobic rubble. |
| 8 | Ithilien / Morgul Vale | 55% | 30° | Oppressive. Morgul-light from above presses down. |
| 9 | Black Gate / Mordor | 20% | 15° | *Surprise*: horizon drops. The vast plain before the Gate. Terrifyingly open — the army is tiny against the scale of Mordor. Awe, not claustrophobia. |

**Design note on site 9:** The instinct is to make Mordor claustrophobic, but Peter Jackson did the opposite — the final stand at the Black Gate is about the enormity of the enemy. A low horizon with a vast dark sky is more terrifying than a cramped frame. The smallness of the fellowship against the infinite dark.

### Card Grounding on Landscape

Cards must feel rooted in the landscape, not floating above it. Layered approach:

1. **Contact shadow** (always) — Soft elliptical shadow beneath each card, on the landscape surface
2. **Ring ripples** (always, subtle) — Culture-colored concentric ellipses pulsing from card base. Power rippling through Middle-earth.
3. **Culture glow** (contextual) — Brighter glow for key moments: card entry, playable card shimmer, Ring-bearer
4. **Entry animation** — Cards materialize upward from the landscape, not slide in. Bright flash settling into resting state.
5. **Ground tint** (reserved for special moments) — Full landscape tint for dramatic cards: Balrog, Gandalf the White, Ring-bearer corruption

See `card-grounding-prototype.html` for visual reference of all techniques.

### Board Zones as Transparent Card Traffic Areas

Zones (fellowship, shadow, skirmish) are NOT opaque UI panels. They are invisible logical areas where cards land on the landscape. The landscape is always visible through zones. Only cards and solid UI elements (phase tracker, piles, pass button) obscure the landscape. Zone boundaries are ghost-faint dashed lines, visible only when contextually relevant (e.g., skirmish boundaries appear during assignment phase, fade during fellowship phase).

**Hidden gems concept**: The landscape artist can place subtle details in areas frequently covered by cards (shadow zone, fellowship zone) that are revealed when cards leave play — rewarding observant players.

---

### Tactical Mode — Eliminated
- **No tactical mode needed.** Both combat phases (Assignment, Skirmish) now have their own dedicated UIs off the board. All remaining phases (Fellowship, Shadow, Maneuver, Archery, Regroup) are atmospheric — cards stay in immersive standee orientation at all times on the board.
- The original concern about mass-rotating 15+ cards simultaneously at 60fps is moot.

### Skirmish Overlay Transition — Two Variants

**Standard skirmish:**
1. Board dims (non-combatant standees fade to low opacity)
2. Combatant standees glow briefly, then fade to silhouette
3. Overlay slides/fades in with the same cards rendered **flat and readable from scratch** (no 3D rotation — a film-style dissolve cut between two separate renderings)
4. On exit: overlay fades, standees rematerialize on bases with subtle glow

**Ring-bearer skirmish (when RB is a combatant):**
1. Gold/white pulse radiates from Ring-bearer's board position
2. All combatant standees flash bright, then fade
3. Overlay appears with faint Ring watermark behind combatants, gold-tinted border
4. If Ring-bearer has high burdens: flash shifts from gold to sickly red — corruption bleeds into the UI chrome itself
5. On exit: same as standard

**Key insight:** The overlay renders cards independently from the board. Visual continuity comes from recognizing the card art, not from animating a physical rotation between views. Two different rendering contexts, dissolve between them.

### Art Pipeline
- **User creates ALL custom art** — phase jewel icons, jewel ring states, adventure HUD icon, hand thumbs, Barad-dur tower, standee bases, cinemagraphs, tokens, event flash art, screen backgrounds, card backs, etc.
- **Claude implements code** that references art by filename from `static/art/{category}/`
- **Full art manifest:** `ART_MANIFEST.md` — every asset with naming convention, filenames, descriptions, and counts (~140 total assets)
- **CSS/programmatic effects** (not art): culture ripples, corruption filters, particles, shadows, glow, weather

---

## Milestone 3 — Full Card Effect Engine
_(not started)_

## Milestone 4 — Cinematic Living Board & Sound
_(not started)_

## Milestone 5 — Online Multiplayer
_(not started)_

## Milestone 6 — AI Opponent
_(not started)_

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-27 | SvelteKit + Fastify + TypeScript | Compiled reactivity for 60fps animations, Fastify for speed, TS for type safety across 3,500 card effects |
| 2026-03-27 | Socket.IO for multiplayer | Battle-tested real-time, handles reconnection/rooms |
| 2026-03-27 | SQLite for persistence | Lightweight, no server needed for local play, portable |
| 2026-03-27 | MCTS for AI opponent | Proven for card games with hidden information, runs on same TS engine |
| 2026-03-27 | Card effects as data-driven interpreter | Scalable to 3,500 effects without 3,500 handler functions |
| 2026-04-01 | UI elements inset into ornate border frame pieces | Each piece is a Tolkien object matching its function (palantír=seeing, horn=action, etc.) — functional UI IS the thematic decoration |
| 2026-04-01 | Adventure HUD click opens Middle-earth map overlay | Nodes + travel lines on Tolkien's actual maps; dynamic path per deck; zoom for nearby sites |
| 2026-04-01 | Burden tracker = Barad-dûr (not a border piece) | Already designed as 6-keyframe cinematic board overlay; One Ring already used for assignment waiting screen |
| 2026-04-01 | SVG path-based border shapes | Resolution-independent, serializable, import from Inkscape/Figma as phase 1 |
| 2026-04-01 | Game log = Doors of Durin, NOT Palantír | Palantír = pile browser only. Doors of Durin = ithildin glow → doors open → log revealed. Thematic separation of "seeing things" vs "seeing history" |
| 2026-04-01 | L-shaped border frame finalized (TEMPLATE v5) | One sculptural piece: left spine + top shelf + two concave brackets + bottom shelf + horn bracket. Narsil shelf separate across top. Right side intentionally open. |

## Errors & Issues Log

| Date | Issue | Resolution |
|------|-------|------------|
| _(none yet)_ | | |

---

## Session Log

### Session 6 — 2026-06-11
- **User instruction: "open the board"** — get the game board rendering at `/game`
- GameBoard.svelte imported 11 components but only 3 existed (GameBoard, BoardFrame, TwilightPool) — route was broken since April 3 session ended mid-scaffold
- Building the 9 missing inset components with placeholder art (swapped for user art as it lands in `static/art/`): PhaseJewel, AdventureHUD, Palantir, DrawDeck, GameLog (Doors of Durin), PassButton (Horn of Gondor), BurdenTracker (Barad-dûr), NarsilShards, OpponentHand

### Session 1 — 2026-03-27
- Reviewed board editor v3 (1,610 lines, 20 zone templates, full design tool)
- Reviewed master codex
- Established tech stack: SvelteKit + Fastify + TypeScript + Socket.IO + SQLite
- Defined roles: user = art director, Claude = full-stack developer
- Created CLAUDE.md and PLAN.md
- **MILESTONE 1 COMPLETE**: All 9 tasks done in a single session
  - Project scaffold, GEMP data clone, HJSON parser (3,089 cards), image pipeline (3,070 mapped)
  - Card search API (text + 6 filters + pagination)
  - Deck builder UI: card grid, filter bar, card detail panel, deck list panel
  - Deck state: reactive store (Svelte 5 runes), 4-section deck (RB/Ring, FP, Shadow, Adventure)
  - Deck validation: live error checking for all LOTR TCG deck construction rules
  - Deck persistence: JSON export/import
- Dev server running at http://localhost:5174
- **Next: Milestone 2 — Local Two-Player Game (task 2.1: Game state model)**

### Session 2 — 2026-03-27
- **Task 2.1 COMPLETE: Game state model**
  - `src/lib/types/game.ts` — Full type system: GameState, CardInGame (mutable card instances), Player, Skirmish, GameLogEntry, GameAction (player inputs), ClientGameView (hidden info filtering), all zones/phases/enums/constants
  - `src/lib/engine/state.ts` — Game factory (createGameState from two decks), 20+ query helpers (zone queries, stat calculations, keyword resolution), client view generation, win condition checks
  - Key design decisions:
    - Cards as Record<string, CardInGame> (serializable, O(1) lookup by ID)
    - Zone on each card instance (single source of truth, query by filter)
    - Card definitions (Card) immutable, CardInGame has mutable game state (wounds, modifiers, attachments)
    - PhaseStep sub-states for fine-grained flow control within phases
    - GameAction union type for all player inputs — server validates and applies
    - ClientGameView strips hidden info (opponent hand, draw decks, adventure decks)
- **Task 2.2 COMPLETE: Phase state machine**
  - `src/lib/engine/phases.ts` — Full turn engine (500+ lines)
  - startTurn, advancePhase, moveFellowship, resolveCurrentSkirmish, assignMinion
  - All 7 phases with sub-steps, priority passing, fierce skirmish loop
  - Win condition checks at every state change
- **Board Editor v4 COMPLETE: Full overhaul**
  - `LotR_TCG_Board_Editor_v4.html` — new version with intuitive UX
  - Right-click context menus replaced button clutter (component menu: opacity slider, duplicate, delete, layer move, z-order; board menu: add zone, toggle guides, select all)
  - Comprehensive game elements checklist (54 items across 10 categories: Board Zones, Cards & Piles, Ring-bearer, Phase & Turn, Tokens & Markers, Adventure, Combat, Interface, Audio & Effects, Multiplayer)
  - Checklist: hover fly-out from left edge, placed/unplaced status indicators, right-click to set display type (Board Zone, HUD, Sidebar, Modal, Settings, Hidden)
  - Open UX questions flagged with ⚠ in checklist
  - Minimal topbar (title, ratio, undo/redo, save/load only)
  - Perspective/tilt/burdens moved to properties panel
- **Tasks 2.3-2.6 COMPLETE: Action validation & execution engine**
  - `src/lib/engine/actions.ts` — 12 action types, card play validation, twilight cost, placement
- **Event Bus COMPLETE**
  - `src/lib/engine/events.ts` — 40+ typed events, handler registration, debug mode, coverage diagnostics, placeholder handlers for sound/animation/screen effects
- **Board Layout Variations — 3 designs generated**
  - `data/layouts/layout-a-landscape.json` — Landscape Dominant: zones at edges, huge open center
  - `data/layouts/layout-b-cards.json` — Card Dominant: larger zones, readability over atmosphere
  - `data/layouts/layout-c-asymmetric.json` — Asymmetric Split: FP left, Shadow right, diagonal corridor
- **Next: User reviews layouts → choose direction → build game board component**

### Session 3 — 2026-03-28
**User feedback on Board Editor v4:**
1. **Zones too dark / invisible** — Objects on the board are nearly invisible against the dark background. Zones like Skirmish L/R, Hand, Left/Right Dock have extremely low opacity backgrounds (0.025, 0.01, 0.08) and borders (0.07, 0.12) that disappear entirely. ALL zones must be clearly visible at all times, not just when selected.
2. **Objects need to be more luminous** — Backgrounds, borders, and labels all need higher opacity/brightness so the editor is usable as a design tool.
3. **Barad-dûr tower grows with burdens** — The tower is not a static indicator. It is a cinematic corruption meter:
   - **0 burdens**: Tower is small, faint, far away. Full tower visible from base to Eye. Camera is straight-on, distant.
   - **As burdens accumulate**: Tower grows larger on the board. View zooms in. Camera lifts upward and pushes closer — like slowly craning up toward the Eye.
   - **Max burdens (1 away from corruption)**: Camera is slightly above eye level, very close. Looking down — the tower drops away below, but the Eye of Sauron fills the view as the primary focus.
   - The effect is the corruption *approaching you* — Sauron's gaze growing inescapable. The board itself becomes more oppressive.
   - In the editor: burden slider in properties panel to preview all states.
4. **Board editor background — solid color** — Remove the sky/terrain gradient split. Board canvas should be one solid color so zones and objects are clearly visible against a uniform backdrop.
6. **Remove Terrain BG and Sky BG** — Vestigial components from the old painted landscape. Horizon line is sufficient.
7. **Slider precision** — All sliders for angle/skew/rotate need a key-in text field so you can type exact values, not just drag.
8. **Context menus must stay on screen** — If a right-click is near the edge, the menu should reposition to stay fully visible.
9. **Isometric camera controls** — Want to raise/lower/tilt the camera with visual feedback. Need a vanishing point visualizer — see the convergence point on the board, and be able to set/move it.
10. **Zone opacity classification** — Visual distinction between 3 types of board elements:
    - **Opaque** — Solid UI elements (phase tracker, pass button, piles). Landscape never visible through them.
    - **Dynamic** — Zones with cards that move in/out (fellowship, shadow, skirmish). Landscape sometimes visible when cards leave.
    - **Translucent** — Always-transparent areas where landscape shows through (hand fan, adventure path, docks).
11. **Reset to Default Layout per variant** — When a layout is loaded (gentle/moderate/steep), "Reset to Default Layout" should reset to that variant's saved state, not the hardcoded default.
12. **Editor opens empty** — No scenario loaded by default. Blank board, user loads a layout or starts fresh.
13. **Save As** — Separate from Save. Prompts for a filename so you can save variants without overwriting the original.
14. **Complete layout redesign — 4 views with spatial intent**
    Key principles:
    - More enclosed/hemmed-in = more top-down camera, closer zoom, horizon off-page
    - Open landscapes = lower camera, visible horizon, wider zoom
    - Shadow forces must NEVER float above the horizon — everything grounded on terrain
    - Zone arrangement should feel like natural landscape clearings, not UI bands
    - Camera angle, zoom, and horizon work together to sell the spatial metaphor

    Four layouts:
    a. **Open Field** (lateral) — Fellowship left, Shadow right, facing each other across a wide battlefield. Low camera, horizon visible ~25%. Like Shire/Grassy Plain. Zoom 1.0.
    b. **Narrow Pass** (vertical/depth) — Fellowship foreground (bottom), Shadow background (top, but BELOW horizon). Looking down a road/corridor. Horizon ~12%. Moderate tilt. Zoom 1.05.
    c. **Depths** (diagonal) — Near top-down. Fellowship lower-left, Shadow upper-right, diagonal tension. Horizon off-page (-40%). Steep angle. Zoom 1.15. Like Khazad-dûm, Underground Mine.
    d. **Sanctuary** (new, fellowship protected) — Fellowship center, protected by landscape. Shadow surrounding at edges. Like Fangorn clearing — fellowship in a natural haven. Horizon ~5%. Zoom 1.08.

15. **Add zoom/scale to editor** — Camera zoom control that works with tilt/horizon to create the spatial feel.
17. **Editor UX fixes (queued)**:
    a. Gridline checkboxes in the topbar header (not buried in properties)
    b. Context menu: "Center Horizontally" / "Center Vertically" for selected object
    c. Right panel should slide out on hover like the left checklist panel, not always visible
    d. Context menu doesn't close on click outside — must close on next click anywhere outside it
    e. MJ Guide export: the gold/brown "open landscape" label text isn't visible on the exported PNG — fix rendering
18. **Landscape Focus Mode** — Toggle in topbar to gray out all non-landscape items (UI elements, piles, hand, phase tracker, etc.). Only Fellowship Zone, Shadow Zone, Adventure Path, Twilight Pool, and Barad-dur remain fully visible. Focus on getting the landscapes right without distraction.
16. **Skirmish zone rethink** — User questioning whether skirmish needs dedicated board real estate. Considering:
    - Archery phase: happens at distance (arrows fly across the landscape between zones — visual effect, not a zone)
    - Skirmish phase: pop-up overlay — background darkens, flat top-down card matchup view appears
    - This would free up ~30% of the board for more landscape/atmosphere
    - **DECIDED: Remove skirmish zones from board.** Archery = visual effect across landscape. Skirmish = pop-up overlay.
    - Board zones now: Fellowship, Shadow, Twilight Pool + UI elements. More landscape visible.
19. **Adventure Path redesign — compact HUD widget, not a board zone**
    - The adventure path is NOT a row of 9 site cards on the board. It's a small, opaque UI element.
    - **Icon**: Map or compass rose
    - **Counter**: Site progress (e.g. "3/9")
    - **Label**: Current site name
    - **Hover**: Card image preview floats up
    - **Click**: Full-size card inspection
    - The landscape cinemagraph already communicates where you are — no need to duplicate that with a card row.
    - Frees up significant board real estate for landscape/atmosphere.
    - Classification: **Opaque** UI element (not transparent, not a landscape zone).
20. **Phase tracker redesign — compact jeweled icon, not a wide bar**
    - The phase tracker is NOT a 60%-width bar across the top. It's a small circular jeweled widget.
    - **Center symbol**: Morphs per phase (shield=Fellowship, eye=Shadow, chess piece=Maneuver, bow=Archery, crossed swords=Assignment, sword=Skirmish, star=Regroup)
    - **7 jewels** arranged in a circle around the center symbol, colors:
      - Fellowship=Gold, Shadow=Violet, Maneuver=Teal, Archery=Green, Assignment=Amber, Skirmish=Red, Regroup=Silver
    - **Active jewel pulses/glows**, completed jewels leave dim afterglow trail, inactive jewels dim
    - **Hover**: Popover listing all 7 phases in order with explanations
    - Classification: **Opaque** HUD element
    - Consider clustering with Adventure HUD as a unified "game status" widget group.

### Site Card Inventory & Landscape Strategy
- **229 total site cards**, **204 unique names**, across 15 sets
- **9 keywords**: Sanctuary(35), Plains(33), River(28), Battleground(26), Underground(22), Forest(18), Mountain(14), Dwelling(8), Marsh(7)
- **10 regions**: Shire/Bree(19), Wilderness/Eriador(15), Rivendell(7), Moria/Underground(21), Lothlorien(8), Anduin/River(23), Rohan(49), Isengard(15), Gondor/Minas Tirith(32), Mordor/Shadow(18)
- **46 unique base landscapes** (see site-landscapes.md for full mapping)
- **Corruption = progressive visual degradation** (not just a red tint — see below)
- **Time/weather = CSS filter treatments** on the same base image (dawn/dusk/night/rain/fog/storm)

#### Layout × Camera = Maximum Variation from Minimum Configs
- **3 spatial arrangements** (lateral, vertical, diagonal) define zone placement
- **Camera presets** (zoom, tilt, horizon) create the feel per-site
- Same layout + different camera = completely different atmosphere
- Each of the 46 landscapes maps to: arrangement + camera preset
- **Midjourney composition templates**: editor exports a visual guide showing zone positions, flat-ground-needed areas, horizon, camera notes, mood keywords
- **Base scale = 1.0** defined as medium preset (tilt 14°, zoom 1.0×, horizon 12%, depth 1000). All site cameras described relative to this. E.g., "Moria halls = 1.25× base" means 25% closer/tighter.

#### Corruption Visual Progression (all CSS/SVG — zero extra images)
The world doesn't just get redder — it gets *wrong*. Psychologically disturbing visual decay:
- **0–3 burdens**: Clean. The world as it should be.
- **4–6**: Contrast sharpens. Shadows deepen to near-black. Colors become unnervally vivid, oversaturated — beauty becoming poisonous. Faint chromatic aberration (RGB split 1-2px).
- **7–9**: Colors drain unevenly — greens and blues fade, reds and oranges survive. Pulsing vignette (darkness breathes at edges). Chromatic aberration increases. Film grain/noise appears. Slight bloom on light sources (overexposed, painful).
- **10–11**: Heavy contrast. Most color gone except sickly warm tones. Visible chromatic aberration (3-5px). Grain intensifies. Micro-jitter on the landscape (subtle shake). Vignette pulses faster. The image feels like it's degrading, like film melting.
- **12**: Near monochrome. Maximum aberration. Screen pulses. The Eye dominates. The landscape is barely holding together.
5. **Hand fan arc — cards follow the quarter-circle edge** — Cards must sit along the actual arc curve (the quarter-circle boundary), not clustered in the interior. Cards should be larger, overlapping, and arranged so they follow the curved edge like a real hand fan.

### Session 4 — 2026-03-31
- **Landscape Focus Mode COMPLETE** — "Landscape Only" toggle in topbar now fully functional:
  - Board: Non-landscape components (Phase Tracker, Action Log, Pass Button, Hand fan, Shadow Hand Count, Opp/Your Piles, Ring/RB Portrait) dim to 12% opacity + grayscale. Landscape zones (Fellowship Zone, Shadow Zone, Adventure Path, Twilight Pool, Barad-dûr) remain fully visible and interactive.
  - Checklist panel: Non-landscape items grayed out, non-interactive. Category headers gray out when ALL items in category are non-landscape. Landscape-relevant items (Board Zones core, Support Areas, Burden Tracker, Site Background, Adventure items) stay bright and clickable.
  - Layers panel: Non-landscape components within each layer are grayed. Layer headers gray when all layer components are non-landscape.
  - Master List modal: Same graying treatment applied.
  - Toggle rebuilds checklist on change for instant visual feedback.
- **Next: User reviews landscape mode → continue landscape composition work**

### Session 5 — 2026-04-01
- **Context menu viewport clamping fixed** — Right-click menus now always appear fully on-screen:
  - Main menu: renders off-screen first, forces reflow, measures, then clamps to viewport with 8px padding all edges
  - Submenus: switched from CSS `position: absolute` to JS-positioned `position: fixed`, flip left when right edge would overflow, clamp top/bottom
- **Border Piece UI System — Design Decisions**
  All major UI elements are inset into decorative border frame pieces (SVG path-based, ornate metalwork aesthetic). The border is not just decoration — it's the functional UI frame.

  **Complete Border Inventory:**

  | Border Location | Tolkien Object | UI Function |
  |---|---|---|
  | **Upper-left** | Phase Jewel | 7 jeweled circle + morphing center symbol, phase tracking |
  | **Upper-left** (paired) | Adventure HUD (map/compass icon) | Site counter + name; **click opens Middle-earth map overlay** |
  | **Upper area** | Mirror of Galadriel | Twilight pool — dark water surface with token count |
  | **Lower-left** | Palantír | Pile browser (discard, dead, deck count, adventure deck) + game log |
  | **Lower-center/edge** | Horn of Gondor | Pass/Done action |
  | **Lower-right area** | Red Book of Westmarch | Draw deck — pages remaining = cards remaining |
  | **Frame decoration** | Shards of Narsil → Andúril | Non-functional atmosphere — blade reassembles as fellowship advances through sites |

  **Non-border board elements (already designed):**
  - Barad-dûr tower (board overlay, upper-right, 6-keyframe cinematic corruption meter)
  - One Ring (spins during shadow assignment waiting screen)
  - Corruption CSS filters (global, escalates with burdens)

  **Palantír menu contents** (pile browser only — game log moved to Doors of Durin):
  - Discard pile (browsable + count)
  - Dead pile (browsable + count)
  - Draw deck count (display only)
  - Adventure deck remaining (display only)
  - Opponent piles accessible too (discard/dead are public info) — FP/Shadow toggle or two sections

  **Border piece implementation approach:**
  - SVG path-based shapes — resolution-independent, serialize to JSON
  - Phase 1: Import pre-made SVG border pieces (designed in Inkscape/Figma, exported as path data)
  - Phase 2 (optional): In-editor point-editing to tweak imported shapes
  - Each piece is a component type in the board editor with position, scale, rotation, opacity, SVG path data

- **Adventure HUD — Middle-earth Map Overlay**
  Clicking the Adventure HUD opens a full map of Middle-earth (Tolkien's actual maps as base images). The map shows:
  - **Nodes** at geographic positions corresponding to the 9 adventure deck sites
  - **Dotted travel lines** connecting nodes in site order — the fellowship's chosen path
  - **Visited nodes** glow/fill in, **current node** pulses, **future nodes** dim/unfilled
  - **Hover** over any node shows the site card
  - **Map style**: Tolkien's own hand-drawn cartography aesthetic (parchment, ink, calligraphic labels)
  - **Zoom**: Pan and zoom on the map to resolve nearby sites. Detailed regional maps may be sourced for areas where many sites cluster (Moria interior, Minas Tirith tiers, Helm's Deep progression). If the base map resolution is sufficient, zoom alone may handle this.
  - **Dynamic path**: Since adventure decks are player-built (9 from 229 possible sites), the map plots YOUR chosen journey, not a fixed route. Different decks draw different paths across the same base map.
  - **Art source**: Tolkien's original maps (base images to be sourced by user). Potentially multiple detail levels — full Middle-earth overview + regional close-ups for dense areas.

- **Doors of Durin — Game Log**
  Game log is NOT in the Palantír. It has its own thematic object: the Doors of Durin (gates of Moria, ithildin inscription that glows in moonlight).
  - **Trigger**: Small tome/scroll icon inset in the lower-left spine of the L-border
  - **Idle**: Faint, barely-visible arch outline — ithildin invisible, just aged stone contour
  - **Hover**: Moonlight effect — ithildin lines trace themselves in silver-blue, revealing the full door design (two trees, crown, star, anvil). Inscription appears: "Speak, friend, and enter."
  - **Click/Open**: Doors crack apart, light spills from behind, game log revealed as dark interior — text scrolls upward like carved Dwarvish records on stone walls
  - **Close**: Doors swing shut, ithildin fades to invisible
  - Palantír handles pile browsing ONLY (discard, dead, draw count, adventure deck remaining). Game log is Doors of Durin only.

- **Border Layout — Finalized (TEMPLATE v5)**
  The board frame is an **L-shaped border** wrapping the left edge and bottom, with a separate **Narsil shelf** across the top center. NOT full-length panels — organic stone/metal brackets with concave arch cutouts.

  **L-Border Frame** (one continuous sculptural piece):
  - Left Spine: full-height strip (x=0, w=3) — backbone
  - Top Shelf: extends right from spine top (x=2.7, w=22, h=9) — houses Twilight Pool → Adventure HUD → Phase Jewel
  - Upper Bracket: corner-tl shape (x=3, y=9) with concave inner arch
  - [Landscape arch opening: y≈35 to y≈65 — visible through the border]
  - Lower Bracket: corner-bl shape (x=3, y=65) with concave inner arch
  - Bottom Shelf: connector pieces extending rightward (y≈82-91)
  - Bottom Strip: base running along bottom (y=91, h=9) with Horn Bracket extension
  
  **6 Tolkien objects inset in L-Border:**
  1. Twilight Pool (Mirror of Galadriel) — top shelf, left
  2. Adventure HUD (Map/Compass) — top shelf, center
  3. Phase Jewel — top shelf, right (circle)
  4. Doors of Durin (Game Log trigger) — lower-left spine, small tome/scroll
  5. Palantír (Pile Browser) — bottom shelf, large circle
  6. Red Book of Westmarch (Draw Deck) — bottom shelf, right

  **Horn of Gondor (Pass/Done)** — inset in the Horn Bracket, extending from the bottom strip

  **Narsil Shelf** (separate piece, top center):
  - Left cap (quarter-bl), main shelf (rect), right cap (quarter-br)
  - Narsil Shards float within — blade reassembles as sites advance

  **Floating elements** (no border backing):
  - Opp Hand Count — top-right badge
  - Barad-dûr — board overlay, top-right (grows with burdens)
  - One Ring — modal overlay during assignment phase
  - Hand Fan — lower-right quarter-circle

  **CRITICAL RULE: Fixed vs. Camera-Affected Elements**
  - **Fixed** (never change size/position across layouts): ALL border pieces, ALL Tolkien insets (Twilight Pool, Adventure HUD, Phase Jewel, Doors of Durin, Palantír, Red Book, Horn of Gondor, Narsil), Opp Hand Count, Hand Fan, Barad-dûr, Ring Spinner
  - **Camera-affected** (change per layout): Fellowship Zone, Shadow Zone positions/sizes, and the landscape cinemagraph (zoom, tilt, horizon)
  - The border frame is the SAME in every layout. Only the landscape and card zones shift.

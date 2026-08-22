# LOTR TCG Digital — Art Asset Manifest

> All hand-crafted visual assets needed for the game. User creates all art; code references these by filename.
>
> **Naming convention:** `{number}.{ext}` (e.g., `1.01.svg`, `5.23.mp4`)
> - Category = first digit(s), asset = decimal digits
> - Save all files to `static/art/`
> - **Excel checklist:** `Art_Checklist.xlsx` — the living two-way tracker between art director and developer
>
> **Last updated:** 2026-03-31

---

## Numbering Key

| # Range | Category | Count | Format |
|---------|----------|-------|--------|
| 1.01–1.15 | Phase Jewel (7 center icons + 8 ring states) | 15 | SVG/PNG |
| 2.01–2.02 | Adventure HUD | 2 | SVG |
| 3.01–3.08 | Hand Thumbs | 8 | PNG |
| 4.01–4.06 | Barad-dur Tower (6 keyframes, code interpolates) | 6 | PNG |
| 5.01–5.46 | Site Landscapes (cinemagraphs) | 46 | MP4 |
| 6.01–6.08 | Tokens | 8 | SVG |
| 7.01–7.20 | Card Type & Keyword Icons | 20 | SVG |
| 8.01–8.14 | Standee Bases (1 per culture) | 14 | PNG |
| 9.01 | The One Ring | 1 | PNG |
| 10.01–10.02 | Card Backs (FP + Shadow) | 2 | PNG |
| 11.01–11.06 | Screen Backgrounds | 6 | PNG |
| 12.01–12.12 | Event Flash Art | 12 | PNG |
| **TOTAL** | | **140** | |

## Workflow

1. **You** create art, save as `{number}.{ext}` in `static/art/`, mark **X** in Completed column of `Art_Checklist.xlsx`
2. **Claude** implements in code, marks **OK** or **REDO** in Review column
3. If **REDO**: Feedback column explains what's wrong. Fix, overwrite same file, mark X again.
4. **Questions/Problems** column: you write anything you need help with during creation. Claude reads it next session.
| **TOTAL** | | **~140** | |

---

## 1. Phase Jewel Widget — `phase/` (15 assets)

### Center Phase Icons (7)

Symbol that sits in the middle of the jewel ring. Morphs when phase changes.

| # | Filename | Phase | Symbol Concept |
|---|----------|-------|----------------|
| 1 | `phase/phase-icon-fellowship.svg` | Fellowship | Shield / cloaked travelers |
| 2 | `phase/phase-icon-shadow.svg` | Shadow | Eye of Sauron / dark presence |
| 3 | `phase/phase-icon-maneuver.svg` | Maneuver | Chess piece / footprints |
| 4 | `phase/phase-icon-archery.svg` | Archery | Drawn bow / crossed arrows |
| 5 | `phase/phase-icon-assignment.svg` | Assignment | Pointing gauntlet / opposing shields |
| 6 | `phase/phase-icon-skirmish.svg` | Skirmish | Crossed swords / blade clash |
| 7 | `phase/phase-icon-regroup.svg` | Regroup | Campfire / healing star |

### Jewel Ring States (8)

The ring of 7 jewels surrounding the center icon. Each state shows which phase is active (bright + glowing) and which are completed (colored but not glowing = trail). Jewels not yet reached this turn are dim/gray.

| # | Filename | State | Description |
|---|----------|-------|-------------|
| 0 | `phase/phase-ring-00-idle.png` | No phase active | All 7 jewels dim/gray. Game not in progress or between turns. |
| 1 | `phase/phase-ring-01-fellowship.png` | Fellowship active | Gold jewel glows. Others dim. |
| 2 | `phase/phase-ring-02-shadow.png` | Shadow active | Violet glows. Gold = trail (lit, not glowing). Others dim. |
| 3 | `phase/phase-ring-03-maneuver.png` | Maneuver active | Teal glows. Gold + violet = trail. Others dim. |
| 4 | `phase/phase-ring-04-archery.png` | Archery active | Green glows. Gold + violet + teal = trail. Others dim. |
| 5 | `phase/phase-ring-05-assignment.png` | Assignment active | Amber glows. 4 trailing. Others dim. |
| 6 | `phase/phase-ring-06-skirmish.png` | Skirmish active | Red glows. 5 trailing. Silver dim. |
| 7 | `phase/phase-ring-07-regroup.png` | Regroup active | Silver glows. All 6 others = trail. |

**Jewel color key:**
- Fellowship = Gold (#c9a530)
- Shadow = Violet (#9b5de5)
- Maneuver = Teal (#45b7aa)
- Archery = Green (#5aad5a)
- Assignment = Amber (#d4893e)
- Skirmish = Red (#c43c3c)
- Regroup = Silver (#b0b8c8)

**Compositing:** Code overlays the center icon on top of the ring. These are two separate layers so any icon can sit on any ring state.

---

## 2. Adventure HUD — `adventure/` (2 assets)

| # | Filename | Description |
|---|----------|-------------|
| 1 | `adventure/adventure-icon.svg` | Map, compass rose, or journey symbol. Static icon next to the site counter and name. |
| 2 | `adventure/adventure-icon-hover.svg` | Hover/active variant — slightly more ornate or glowing. Optional; can use CSS glow instead. |

**Compositing:** Code renders the counter ("3/9") and site name label next to the icon. Hover shows the site card image as a floating preview.

---

## 3. Hand Fan Thumbs — `thumbs/` (8 assets)

Realistic illustration of a thumb/hand peeking up from the bottom-right screen edge, holding the card fan. Determined by the player's deck culture majority.

| # | Filename | Culture | Description |
|---|----------|---------|-------------|
| 1 | `thumbs/thumb-shire.png` | Shire | Small, weathered hobbit thumb. Bare, slightly dirty, warm skin. |
| 2 | `thumbs/thumb-gondor.png` | Gondor | Mailed gauntlet. Steel plate, leather underneath. |
| 3 | `thumbs/thumb-rohan.png` | Rohan | Leather riding glove. Worn, golden-brown. |
| 4 | `thumbs/thumb-elven.png` | Elven | Slender, pale fingers. Elegant, faintly luminous. |
| 5 | `thumbs/thumb-dwarven.png` | Dwarven | Thick, calloused thumb. Broad, stone-dust. |
| 6 | `thumbs/thumb-sauron.png` | Sauron | Gnarled orc claw. Dark, scarred, clawed nail. |
| 7 | `thumbs/thumb-isengard.png` | Isengard | Iron-plated Uruk hand. Black steel, brutal. |
| 8 | `thumbs/thumb-ringwraith.png` | Ringwraith | Spectral, semi-transparent. Wispy, pale, ghostly. |

**Size:** ~300px wide, transparent background. Bottom portion extends off-canvas.

---

## 4. Barad-dur Tower — `tower/` (6 keyframe assets)

Progressive corruption meter. Code interpolates between keyframes using CSS transforms (scale, translate, opacity) for smooth transitions across all 13 burden levels (0–12).

| # | Filename | Burden Range | Camera / Composition |
|---|----------|-------------|----------------------|
| 0 | `tower/tower-00-distant.png` | 0–1 | Full tower visible, small, faint, far away. Straight-on, distant. |
| 1 | `tower/tower-01-approaching.png` | 2–4 | Tower larger, camera edges closer. Upper half of tower dominant. |
| 2 | `tower/tower-02-looming.png` | 5–7 | Tower fills right side. Camera lifted, looking up. Eye visible. |
| 3 | `tower/tower-03-oppressive.png` | 8–9 | Close-up. Eye prominent. Tower drops away below. Pressing in. |
| 4 | `tower/tower-04-consuming.png` | 10–11 | Very close. Eye of Sauron is the primary focus. Camera above eye level. |
| 5 | `tower/tower-05-overwhelming.png` | 12 | Eye fills frame. Tower barely visible below. Maximum dread. |

**Compositing:** Transparent background. Code positions in the board's upper-right area and crossfades between keyframes as burdens change. CSS corruption filters (aberration, grain, desaturation) are applied globally on top — not baked into these images.

---

## 5. Site Landscapes (Cinemagraphs) — `sites/` (46 MP4 videos)

Looping video backgrounds, one per unique site location. 16:9, 1920x1080.

**Production pipeline:** Midjourney (base image) --> Runway Gen-3 Motion Brush (animate) --> MP4

| # | Filename | Location | Key Animation Element |
|---|----------|----------|----------------------|
| 01 | `sites/site-hobbiton.mp4` | Hobbiton / Bag End | Chimney smoke, garden flutter |
| 02 | `sites/site-shire-country.mp4` | Shire Countryside | Rolling hills, cloud shadows |
| 03 | `sites/site-buckleberry.mp4` | Buckleberry Ferry | River flow, fog drift |
| 04 | `sites/site-bree.mp4` | Bree Town | Rain on cobblestones, lantern flicker |
| 05 | `sites/site-forest-road.mp4` | Forest Road / Trollshaw | Filtered light, leaf sway |
| 06 | `sites/site-midgewater.mp4` | Midgewater Marshes | Mist crawl, still water ripple |
| 07 | `sites/site-weathertop.mp4` | Weathertop | Wind across ruins, dark sky churn |
| 08 | `sites/site-hollin.mp4` | Hollin | Barren hills, grey sky drift |
| 09 | `sites/site-rivendell.mp4` | Rivendell | Waterfall cascade, autumn leaves |
| 10 | `sites/site-caradhras.mp4` | Caradhras | Blizzard, snow drift |
| 11 | `sites/site-moria-entrance.mp4` | Moria Entrance / Doors of Durin | Still lake, faint ripple |
| 12 | `sites/site-moria-halls.mp4` | Moria Halls / Dwarrowdelf | Torch flicker, dust motes in light shafts |
| 13 | `sites/site-balins-tomb.mp4` | Balin's Tomb | Single light shaft, dust |
| 14 | `sites/site-bridge-khazaddum.mp4` | Bridge of Khazad-dum | Lava glow below, rising embers |
| 15 | `sites/site-zirakzigil.mp4` | Zirakzigil Peak | Lightning, cloud churn |
| 16 | `sites/site-dimrill-dale.mp4` | Dimrill Dale | Sunlight, gentle breeze |
| 17 | `sites/site-lothlorien.mp4` | Lothlorien | Silver-gold leaf shimmer, ethereal glow |
| 18 | `sites/site-anduin-river.mp4` | River Anduin | River current, gentle waves |
| 19 | `sites/site-argonath.mp4` | Argonath / Pillars of the Kings | Water flowing past stone feet, mist |
| 20 | `sites/site-amon-hen.mp4` | Amon Hen | Forest canopy sway, dappled light |
| 21 | `sites/site-rohan-plains.mp4` | Rohan Open Plains | Grass rippling in wind waves |
| 22 | `sites/site-rohan-camp.mp4` | Rohan Camp | Campfire flicker, tent flutter |
| 23 | `sites/site-edoras.mp4` | Edoras / Golden Hall | Windswept banner, golden gleam |
| 24 | `sites/site-fangorn.mp4` | Fangorn Forest | Deep green light, ancient sway |
| 25 | `sites/site-dunharrow.mp4` | Dunharrow | Mountain wind, torch flicker |
| 26 | `sites/site-paths-of-dead.mp4` | Paths of the Dead | Spectral green pulse, ghost light |
| 27 | `sites/site-helms-deep-approach.mp4` | Helm's Deep Approach | Rain, distant torches |
| 28 | `sites/site-helms-deep-walls.mp4` | Helm's Deep Walls | Driving rain on stone, army torches |
| 29 | `sites/site-helms-deep-interior.mp4` | Helm's Deep Interior | Torch flicker, stone glisten |
| 30 | `sites/site-isengard.mp4` | Isengard / Orthanc | Furnace glow, smoke rise, machinery |
| 31 | `sites/site-isengard-flooded.mp4` | Isengard Flooded | Water currents, debris drift |
| 32 | `sites/site-minas-tirith-exterior.mp4` | Minas Tirith Exterior | Banner ripple, beacon glow |
| 33 | `sites/site-minas-tirith-interior.mp4` | Minas Tirith Interior | Torch light on stone pillars |
| 34 | `sites/site-osgiliath.mp4` | Osgiliath | Fog under broken bridges, rubble |
| 35 | `sites/site-pelennor.mp4` | Pelennor Fields | Smoke drift, distant fire |
| 36 | `sites/site-ithilien.mp4` | Ithilien | Green overgrowth sway, hidden sun |
| 37 | `sites/site-morgul-vale.mp4` | Morgul Vale | Sickly green-white pulse, dead air |
| 38 | `sites/site-cirith-ungol.mp4` | Cirith Ungol | Faint torchlight, cobweb sway |
| 39 | `sites/site-black-gate.mp4` | Black Gate / Morannon | Ash fall, Eye pulse in distance |
| 40 | `sites/site-mordor-wastes.mp4` | Mordor Wastes | Heat shimmer, ash drift |
| 41 | `sites/site-mount-doom.mp4` | Mount Doom | Lava rivers, red sky churn |
| 42 | `sites/site-grey-havens.mp4` | Grey Havens | Golden sunset on water, gentle waves |
| 43 | `sites/site-emyn-muil.mp4` | Emyn Muil | Grey rock, sparse wind |
| 44 | `sites/site-dead-marshes.mp4` | Dead Marshes | Ghost-light flicker beneath water |
| 45 | `sites/site-shelobs-lair.mp4` | Shelob's Lair | Darkness, faint web glint |
| 46 | `sites/site-henneth-annun.mp4` | Henneth Annun | Waterfall curtain, hidden cave light |

**Note:** Time-of-day and weather variants are CSS filter treatments on the same video — no extra video assets needed.

---

## 6. Game Tokens — `tokens/` (8 assets)

| # | Filename | Token | Appearance |
|---|----------|-------|------------|
| 1 | `tokens/token-wound.svg` | Wound | Red glowing dot / blood drop |
| 2 | `tokens/token-twilight.svg` | Twilight | Blue-white glowing coin / crescent |
| 3 | `tokens/token-burden.svg` | Burden | Dark gold Ring motif |
| 4 | `tokens/token-threat.svg` | Threat | Dark fire / ember |
| 5 | `tokens/token-strength-up.svg` | Strength +N | Upward sword / shield |
| 6 | `tokens/token-strength-down.svg` | Strength -N | Broken shield / downward |
| 7 | `tokens/token-vitality.svg` | Vitality | Heart flame |
| 8 | `tokens/token-exerted.svg` | Exerted | Spiral / exhaustion mark |

**Sizing:** SVG scales to any size. Code renders at 16px, 24px, or 32px as needed.

---

## 7. Card Type & Keyword Icons — `icons/` (20 assets)

Small inline icons used in card text, filters, and UI labels.

| # | Filename | Meaning |
|---|----------|---------|
| 01 | `icons/icon-companion.svg` | Companion card type |
| 02 | `icons/icon-minion.svg` | Minion card type |
| 03 | `icons/icon-ally.svg` | Ally card type |
| 04 | `icons/icon-artifact.svg` | Artifact card type |
| 05 | `icons/icon-condition.svg` | Condition card type |
| 06 | `icons/icon-event.svg` | Event card type |
| 07 | `icons/icon-possession.svg` | Possession card type |
| 08 | `icons/icon-site.svg` | Site card type |
| 09 | `icons/icon-twilight.svg` | Twilight cost |
| 10 | `icons/icon-strength.svg` | Strength stat |
| 11 | `icons/icon-vitality.svg` | Vitality stat |
| 12 | `icons/icon-resistance.svg` | Ring-bearer resistance |
| 13 | `icons/icon-fierce.svg` | Fierce keyword |
| 14 | `icons/icon-archer.svg` | Archer keyword |
| 15 | `icons/icon-damage.svg` | Damage bonus keyword |
| 16 | `icons/icon-unique.svg` | Unique card marker |
| 17 | `icons/icon-ring-bearer.svg` | Ring-bearer marker |
| 18 | `icons/icon-sanctuary.svg` | Sanctuary site keyword |
| 19 | `icons/icon-underground.svg` | Underground site keyword |
| 20 | `icons/icon-battleground.svg` | Battleground site keyword |

---

## 8. Standee Bases — `standees/` (14 assets)

Culture-specific card bases. Each card "stands" in a base matching its culture.

| # | Filename | Culture | Material/Feel |
|---|----------|---------|---------------|
| 01 | `standees/base-shire.png` | Shire | Warm wood, hobbit-craft |
| 02 | `standees/base-gondor.png` | Gondor | White stone, silver inlay |
| 03 | `standees/base-rohan.png` | Rohan | Horse-carved wood, golden leather |
| 04 | `standees/base-elven.png` | Elven | Silver-white filigree, luminous |
| 05 | `standees/base-dwarven.png` | Dwarven | Carved granite, rune-etched |
| 06 | `standees/base-gandalf.png` | Gandalf | White staff motif, subtle glow |
| 07 | `standees/base-sauron.png` | Sauron | Black iron, red-hot rivets |
| 08 | `standees/base-isengard.png` | Isengard | Industrial steel, crude bolts |
| 09 | `standees/base-moria.png` | Moria | Dark stone, goblin scratch-marks |
| 10 | `standees/base-ringwraith.png` | Ringwraith | Shadow-metal, spectral wisps |
| 11 | `standees/base-dunland.png` | Dunland | Rough hide, bone ornament |
| 12 | `standees/base-raider.png` | Raider | Desert-worn bronze, fabric wrap |
| 13 | `standees/base-men.png` | Men | Simple iron, weathered |
| 14 | `standees/base-gollum.png` | Gollum | Wet cave stone, fish bones |

**Size:** ~120x40px, transparent background. Viewed from the player's perspective angle.

---

## 9. The One Ring — `ring/` (1 asset)

| # | Filename | Use | Description |
|---|----------|-----|-------------|
| 1 | `ring/ring-one.png` | Assignment waiting screen, Ring-bearer UI | The One Ring. Gold, Tengwar inscription. Used for slow-spin animation at center screen during FP player's wait. |

**Compositing:** Code handles rotation animation and glow effects via CSS.

---

## 10. Card Backs — `cards/` (2 assets)

| # | Filename | Side | Description |
|---|----------|------|-------------|
| 1 | `cards/card-back-fp.png` | Free Peoples | Card back design for FP deck |
| 2 | `cards/card-back-shadow.png` | Shadow | Card back design for Shadow deck |

**Size:** Standard card ratio (~250x350px base, rendered at various sizes).

---

## 11. Screen Backgrounds — `screens/` (6 assets)

| # | Filename | Screen | Description |
|---|----------|--------|-------------|
| 1 | `screens/screen-menu.png` | Main menu | Epic Middle-earth vista |
| 2 | `screens/screen-deckbuilder.png` | Deck builder | Bilbo's study / cozy library |
| 3 | `screens/screen-victory.png` | Victory | Triumphant, hopeful landscape |
| 4 | `screens/screen-defeat.png` | Defeat | Somber, dark landscape |
| 5 | `screens/screen-loading.png` | Loading | Atmospheric, mysterious |
| 6 | `screens/screen-lobby.png` | Multiplayer lobby | TBD — social/gathering feel |

**Size:** 1920x1080, 16:9.

---

## 12. Event Flash Art — `events/` (12 assets)

Full-screen dramatic illustrations for major game moments. Brief flash overlay with fade.

| # | Filename | Trigger | Subject |
|---|----------|---------|---------|
| 01 | `events/event-balrog.png` | Balrog enters play | Fiery demon erupting from darkness |
| 02 | `events/event-gandalf-white.png` | Gandalf the White enters | Wizard reborn in blinding light |
| 03 | `events/event-ring-tempts.png` | Ring temptation | The Ring calling, gold corruption |
| 04 | `events/event-nazgul.png` | Nazgul enters play | Wraith shriek, terror |
| 05 | `events/event-ents-march.png` | Ents attack | Forest army advancing |
| 06 | `events/event-rohirrim-charge.png` | Rohirrim charge | Cavalry charge at dawn |
| 07 | `events/event-phial.png` | Phial of Galadriel played | Light piercing darkness |
| 08 | `events/event-dead-army.png` | Army of the Dead | Spectral army unleashed |
| 09 | `events/event-tower-falls.png` | Sauron defeated | Barad-dur collapsing |
| 10 | `events/event-mount-doom.png` | Ring destroyed | Fire and collapse, then light |
| 11 | `events/event-death.png` | Character death | Generic dark/red flash |
| 12 | `events/event-corruption.png` | Ring-bearer corrupted | Total darkness, Eye wins |

**Size:** 1920x1080, 16:9. Transparent edges for vignette compositing.

---

## NOT Art Assets (CSS/Programmatic)

These effects are achieved in code — no hand-drawn art needed:

- **Culture ring ripples** — CSS concentric ellipse animation
- **Culture glow/shimmer** — CSS box-shadow + animation
- **Corruption visual degradation** — CSS filters (desaturation, aberration, grain, vignette)
- **Card entry particles** — Canvas/WebGL particle system (dust, embers, leaves, etc.)
- **Archery arrows** — Canvas/CSS projectile animation
- **Skirmish overlay darkening** — CSS backdrop-filter
- **Card shelf** — CSS transparency
- **Time-of-day / weather** — CSS filter presets on site video
- **Wound/token stacking** — CSS positioning of token SVGs
- **Contact shadows** — CSS elliptical shadow beneath standees

---

## Folder Structure

```
static/art/
  phase/          (15 files — 7 icons + 8 ring states)
  adventure/      (2 files)
  thumbs/         (8 files)
  tower/          (6 files)
  sites/          (46 files)
  tokens/         (8 files)
  icons/          (20 files)
  standees/       (14 files)
  ring/           (1 file)
  cards/          (2 files)
  screens/        (6 files)
  events/         (12 files)
```

**Total: ~140 hand-crafted assets**

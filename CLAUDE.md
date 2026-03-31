# LOTR TCG Digital — Claude Instructions

## Project Overview
A fully-featured personal digital implementation of the Lord of the Rings Trading Card Game (Decipher, 2001-2007). Solo passion project — not commercial. The engine treats IP as a swappable data layer so the LOTR skin can eventually be replaced with original IP without rebuilding the engine.

## Roles
- **User**: Art director + UX/gameplay interaction director. Does ZERO coding. Weighs in on visual design, animation, game feel, and any backend decision that impacts gameplay or appearance.
- **Claude**: Full-stack developer. Owns ALL technical decisions (architecture, dependencies, data structures, algorithms). Documents everything meticulously. Never asks open-ended "what now?" — always reports progress and proposes next planned step.

## Tech Stack
- **Frontend**: SvelteKit (compiled reactivity, no virtual DOM overhead — critical for 60fps animations + cinemagraph compositing)
- **Backend**: Node.js + Fastify + Socket.IO (Fastify for speed/validation, Socket.IO for real-time multiplayer)
- **Language**: TypeScript everywhere (type safety for 3,500 card effects + complex phase interactions)
- **Database**: SQLite via better-sqlite3 (decks, user data, game history)
- **Card Data**: GEMP HJSON → typed JSON (static, versioned)
- **AI Opponent**: TypeScript game engine + MCTS (Monte Carlo Tree Search)
- **Build**: Vite (SvelteKit default — sub-second HMR)

## Architecture Principles
1. **Game logic on server** — client renders, server validates. Prevents cheating, AI uses same code path.
2. **Card effects are data, not code** — interpreter pattern, not 3,500 individual handlers.
3. **IP layer = `/data/` folder** — swap card JSON, images, site videos → different game.
4. **State machine + event bus** — game state is one serializable JSON object at all times.
5. **Typed everything** — game state interfaces, card schemas, effect types. The type system catches bugs.

## Key Files
- `LOTR_TCG_CODEX.md` — master project spec (all decisions, asset catalog, UX decisions, open questions)
- `PLAN.md` — living progress tracker (milestones, current task, todos, errors, decisions log)
- `LotR_TCG_Board_Editor_v3.html` — standalone board layout design tool (not game code)

## Six-Milestone Roadmap
1. **Card Database & Deck Builder** — parse GEMP HJSON, card images, searchable deck builder ← CURRENT
2. **Local Two-Player Game** — game loop, 8 phases, basic card play, adventure path
3. **Full Card Effect Engine** — all ~3,500 card effects automated
4. **Cinematic Living Board** — cinemagraphs, culture shimmer, Howard Shore OST, SFX, voice
5. **Online Multiplayer** — real-time sync, lobby, matchmaking
6. **AI Opponent** — MCTS-based shadow player

## Card Data Source
- GEMP repository: `github.com/PlayersCouncil/gemp-lotr`
- HJSON card definitions → parse into typed JSON
- Card images: `Card Images/` folder (all 19 sets, already downloaded)

## Board Layout Reference
- Board editor defines zone positions as % coordinates on a 16:9 canvas
- Zone inventory: Fellowship Zone, Shadow Zone, Adventure Path (9 sites), Hand, Draw/Discard/Dead piles, Support Area, Twilight Pool, Ring-bearer Portrait, Threat/Burden Tracker, Phase Tracker
- See `COMP_TEMPLATES` in board editor for exact positions and styling

## Open UX Questions (resolve before building relevant systems)
1. Wound token display
2. Twilight pool visual treatment
3. Multiplayer waiting state
4. Game log (yes/no, what, where)
5. Fellowship position indicator
6. Character death animation
7. Passing priority visual
8. Ring-bearer corruption urgency signal

## Running the App
```bash
cd c:/projects/lotr
npm install
npm run dev          # SvelteKit dev server (frontend + API)
```

## Database
- SQLite at `data/lotr.db`
- Card data is static JSON in `data/cards/` (not in DB)
- Decks, user prefs, game history in SQLite

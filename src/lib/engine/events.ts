/**
 * LOTR TCG — Event Bus ("Sockets" System)
 *
 * Every meaningful game moment fires a typed event through this bus.
 * Handlers (listeners) can be registered for any event type.
 *
 * The "socket" metaphor:
 *   - Each event type is a named socket
 *   - Handlers plug into sockets
 *   - If a socket fires and nothing is plugged in, debug mode warns
 *   - Later, handlers are replaced with real animations, sounds, etc.
 *
 * Architecture:
 *   Engine (phases.ts, actions.ts) → fires events → Event Bus → handlers
 *   Handlers can be: UI updates, animations, sound triggers, log entries,
 *   screen effects, or debug placeholders.
 *
 * Every event carries a structured payload so handlers have all the
 * data they need without querying the game state.
 */

// ─── Event Types & Payloads ─────────────────────────────────────────

export interface GameEvents {
	// ── Phase & Turn ──
	'turn:start':         { turnNumber: number; fpPlayerId: string; shadowPlayerId: string };
	'turn:end':           { turnNumber: number };
	'phase:enter':        { phase: string; step: string };
	'phase:exit':         { phase: string };
	'priority:change':    { playerId: string; phase: string };

	// ── Movement ──
	'fellowship:move':    { fromSite: number; toSite: number; siteCardId: string; twilightAdded: number };
	'site:placed':        { siteNumber: number; cardId: string; blueprintId: string };

	// ── Cards ──
	'card:played':        { cardId: string; blueprintId: string; playerId: string; zone: string; cardTitle: string; cardType: string };
	'card:drawn':         { playerId: string; count: number };
	'card:discarded':     { cardId: string; blueprintId: string; playerId: string; cardTitle: string; reason: string };
	'card:attached':      { cardId: string; targetId: string; cardTitle: string; targetTitle: string };
	'card:zone-change':   { cardId: string; fromZone: string; toZone: string; blueprintId: string };

	// ── Combat ──
	'skirmish:start':     { companionId: string; minionIds: string[]; skirmishIndex: number };
	'skirmish:resolve':   { companionId: string; minionIds: string[]; companionStrength: number; minionStrength: number; winner: 'companion' | 'minion' | 'tie' };
	'assignment:made':    { minionId: string; companionId: string; fierce: boolean };
	'archery:totals':     { fpTotal: number; shadowTotal: number };

	// ── Character State ──
	'character:wound':    { cardId: string; wounds: number; totalWounds: number; cardTitle: string };
	'character:heal':     { cardId: string; amount: number; totalWounds: number; cardTitle: string };
	'character:exert':    { cardId: string; cardTitle: string };
	'character:kill':     { cardId: string; cardTitle: string; cardType: string; cause: string };
	'character:overwhelm':{ cardId: string; cardTitle: string; companionStr: number; minionStr: number };

	// ── Twilight ──
	'twilight:add':       { amount: number; newTotal: number; source: string };
	'twilight:remove':    { amount: number; newTotal: number; source: string };

	// ── Ring-bearer & Corruption ──
	'burden:add':         { amount: number; newTotal: number; source: string };
	'burden:remove':      { amount: number; newTotal: number; source: string };
	'corruption:check':   { burdens: number; resistance: number; corrupted: boolean };

	// ── Threat ──
	'threat:add':         { playerId: string; amount: number; newTotal: number };
	'threat:remove':      { playerId: string; amount: number; newTotal: number };

	// ── Game Flow ──
	'game:start':         { gameId: string; player1: string; player2: string };
	'game:over':          { winner: string; reason: string };
	'player:pass':        { playerId: string; consecutivePasses: number };
	'player:mulligan':    { playerId: string; kept: boolean };
	'player:concede':     { playerId: string };
	'reconcile:start':    { playerId: string; handSize: number; mustDiscard: number };
	'reconcile:complete': { playerId: string };

	// ── Fierce ──
	'fierce:round-start': {};
	'fierce:assignment':  { minionId: string; companionId: string };

	// ── UI Feedback (fired by engine, consumed by UI) ──
	'effect:ability-used':{ cardId: string; cardTitle: string; abilityIndex: number; description: string };
	'effect:keyword':     { cardId: string; keyword: string; granted: boolean };
	'effect:modifier':    { cardId: string; stat: string; amount: number; source: string };
}

// ─── Event Handler Type ─────────────────────────────────────────────

type EventHandler<T> = (payload: T) => void;
type EventName = keyof GameEvents;

// ─── Socket State ───────────────────────────────────────────────────

interface SocketInfo {
	handlers: EventHandler<any>[];
	fireCount: number;
	lastFired: number | null;  // timestamp
}

// ─── Event Bus ──────────────────────────────────────────────────────

export class GameEventBus {
	private sockets: Map<EventName, SocketInfo> = new Map();
	private debugMode: boolean;
	private globalHandlers: EventHandler<{ event: EventName; payload: any }>[] = [];

	constructor(debugMode: boolean = false) {
		this.debugMode = debugMode;

		// Initialize all sockets so we can track which ones never fire
		const allEvents: EventName[] = [
			'turn:start', 'turn:end', 'phase:enter', 'phase:exit', 'priority:change',
			'fellowship:move', 'site:placed',
			'card:played', 'card:drawn', 'card:discarded', 'card:attached', 'card:zone-change',
			'skirmish:start', 'skirmish:resolve', 'assignment:made', 'archery:totals',
			'character:wound', 'character:heal', 'character:exert', 'character:kill', 'character:overwhelm',
			'twilight:add', 'twilight:remove',
			'burden:add', 'burden:remove', 'corruption:check',
			'threat:add', 'threat:remove',
			'game:start', 'game:over', 'player:pass', 'player:mulligan', 'player:concede',
			'reconcile:start', 'reconcile:complete',
			'fierce:round-start', 'fierce:assignment',
			'effect:ability-used', 'effect:keyword', 'effect:modifier',
		];

		for (const name of allEvents) {
			this.sockets.set(name, { handlers: [], fireCount: 0, lastFired: null });
		}
	}

	/**
	 * Register a handler for a specific event type.
	 * Returns an unsubscribe function.
	 */
	on<K extends EventName>(event: K, handler: EventHandler<GameEvents[K]>): () => void {
		const socket = this.sockets.get(event);
		if (socket) {
			socket.handlers.push(handler);
		}
		return () => this.off(event, handler);
	}

	/**
	 * Remove a specific handler from an event.
	 */
	off<K extends EventName>(event: K, handler: EventHandler<GameEvents[K]>): void {
		const socket = this.sockets.get(event);
		if (socket) {
			socket.handlers = socket.handlers.filter(h => h !== handler);
		}
	}

	/**
	 * Register a handler that receives ALL events.
	 * Useful for logging, replay recording, debug displays.
	 */
	onAny(handler: EventHandler<{ event: EventName; payload: any }>): () => void {
		this.globalHandlers.push(handler);
		return () => {
			this.globalHandlers = this.globalHandlers.filter(h => h !== handler);
		};
	}

	/**
	 * Fire an event. All registered handlers are called synchronously.
	 *
	 * In debug mode:
	 *   - Logs every event to console
	 *   - Warns if a socket has no handlers (potential missing integration)
	 */
	emit<K extends EventName>(event: K, payload: GameEvents[K]): void {
		const socket = this.sockets.get(event);

		if (socket) {
			socket.fireCount++;
			socket.lastFired = Date.now();

			if (this.debugMode && socket.handlers.length === 0) {
				console.warn(`[EVENT BUS] ⚡ "${event}" fired but no handlers registered.`, payload);
			}

			for (const handler of socket.handlers) {
				try {
					handler(payload);
				} catch (err) {
					console.error(`[EVENT BUS] Handler error for "${event}":`, err);
				}
			}
		} else if (this.debugMode) {
			console.warn(`[EVENT BUS] Unknown event: "${event}"`);
		}

		// Fire global handlers
		for (const handler of this.globalHandlers) {
			try {
				handler({ event, payload });
			} catch (err) {
				console.error(`[EVENT BUS] Global handler error:`, err);
			}
		}
	}

	/**
	 * Get diagnostic info about all sockets.
	 * Useful for verifying integration coverage.
	 */
	getDiagnostics(): SocketDiagnostic[] {
		const results: SocketDiagnostic[] = [];
		for (const [name, info] of this.sockets) {
			results.push({
				event: name,
				handlerCount: info.handlers.length,
				fireCount: info.fireCount,
				lastFired: info.lastFired,
				status: info.handlers.length === 0
					? (info.fireCount > 0 ? 'unhandled' : 'dormant')
					: 'connected',
			});
		}
		return results;
	}

	/**
	 * Print a summary of socket coverage.
	 * Shows which sockets are connected, unhandled, or never fired.
	 */
	printCoverage(): void {
		const diag = this.getDiagnostics();
		const connected = diag.filter(d => d.status === 'connected');
		const unhandled = diag.filter(d => d.status === 'unhandled');
		const dormant = diag.filter(d => d.status === 'dormant');

		console.log(`\n[EVENT BUS] Socket Coverage Report`);
		console.log(`  Connected: ${connected.length}/${diag.length}`);
		if (unhandled.length > 0) {
			console.log(`  ⚠ UNHANDLED (fired but no handler):`);
			for (const d of unhandled) {
				console.log(`    - ${d.event} (fired ${d.fireCount}x)`);
			}
		}
		if (dormant.length > 0) {
			console.log(`  ○ Dormant (no handler, never fired):`);
			for (const d of dormant) {
				console.log(`    - ${d.event}`);
			}
		}
		console.log('');
	}

	/**
	 * Remove all handlers from all sockets.
	 */
	clear(): void {
		for (const socket of this.sockets.values()) {
			socket.handlers = [];
		}
		this.globalHandlers = [];
	}
}

export interface SocketDiagnostic {
	event: EventName;
	handlerCount: number;
	fireCount: number;
	lastFired: number | null;
	status: 'connected' | 'unhandled' | 'dormant';
}

// ─── Placeholder Handlers ───────────────────────────────────────────

/**
 * Register placeholder handlers for all events.
 * These log to console with a clear "[PLACEHOLDER]" tag so you can
 * see exactly where real integrations need to be plugged in.
 *
 * Call this during development. Remove when real handlers are wired up.
 */
export function registerPlaceholderHandlers(bus: GameEventBus): void {
	// ── Sound effect placeholders ──
	bus.on('card:played', (p) =>
		console.log(`[SOUND] 🔊 card_play_${p.cardType.toLowerCase()} — "${p.cardTitle}"`));
	bus.on('character:wound', (p) =>
		console.log(`[SOUND] 🔊 wound_impact — "${p.cardTitle}" (${p.totalWounds} wounds)`));
	bus.on('character:kill', (p) =>
		console.log(`[SOUND] 🔊 ${p.cardType === 'Companion' ? 'companion_death' : 'minion_destroy'} — "${p.cardTitle}"`));
	bus.on('character:overwhelm', (p) =>
		console.log(`[SOUND] 🔊 overwhelm_crash — "${p.cardTitle}" (${p.companionStr} vs ${p.minionStr})`));
	bus.on('skirmish:start', (p) =>
		console.log(`[SOUND] 🔊 skirmish_begin — ${p.minionIds.length} minion(s)`));
	bus.on('skirmish:resolve', (p) =>
		console.log(`[SOUND] 🔊 skirmish_${p.winner} — str ${p.companionStrength} vs ${p.minionStrength}`));
	bus.on('fellowship:move', (p) =>
		console.log(`[SOUND] 🔊 fellowship_march — site ${p.fromSite} → ${p.toSite}`));
	bus.on('phase:enter', (p) =>
		console.log(`[SOUND] 🔊 phase_${p.phase} — transition`));
	bus.on('burden:add', (p) =>
		console.log(`[SOUND] 🔊 burden_add — ${p.newTotal} total (${p.source})`));
	bus.on('corruption:check', (p) =>
		console.log(`[SOUND] 🔊 ${p.corrupted ? 'CORRUPTION_FAIL' : 'corruption_safe'} — ${p.burdens}/${p.resistance}`));
	bus.on('game:over', (p) =>
		console.log(`[SOUND] 🔊 game_${p.reason.includes('fellowship') ? 'victory' : 'defeat'}`));

	// ── Animation placeholders ──
	bus.on('card:played', (p) =>
		console.log(`[ANIM] ✨ card_enter_${p.zone} — "${p.cardTitle}"`));
	bus.on('card:discarded', (p) =>
		console.log(`[ANIM] ✨ card_discard — "${p.cardTitle}" (${p.reason})`));
	bus.on('character:wound', (p) =>
		console.log(`[ANIM] ✨ wound_flash — "${p.cardTitle}"`));
	bus.on('character:kill', (p) =>
		console.log(`[ANIM] ✨ death_${p.cardType.toLowerCase()} — "${p.cardTitle}"`));
	bus.on('character:overwhelm', (p) =>
		console.log(`[ANIM] ✨ overwhelm_shatter — "${p.cardTitle}"`));
	bus.on('fellowship:move', (p) =>
		console.log(`[ANIM] ✨ site_transition — bg crossfade to site ${p.toSite}`));
	bus.on('twilight:add', (p) =>
		console.log(`[ANIM] ✨ twilight_coins_add — +${p.amount} (${p.source})`));
	bus.on('twilight:remove', (p) =>
		console.log(`[ANIM] ✨ twilight_coins_remove — -${p.amount} (${p.source})`));
	bus.on('assignment:made', (p) =>
		console.log(`[ANIM] ✨ assignment_arrow — ${p.fierce ? 'FIERCE ' : ''}minion → companion`));
	bus.on('fierce:round-start', () =>
		console.log(`[ANIM] ✨ fierce_flash — screen pulse red`));

	// ── Screen effect placeholders ──
	bus.on('corruption:check', (p) => {
		if (p.burdens >= p.resistance - 2) {
			console.log(`[SCREEN] 🌑 corruption_urgency — vignette darken, ${p.burdens}/${p.resistance}`);
		}
	});
	bus.on('game:over', (p) =>
		console.log(`[SCREEN] 🌑 game_over_${p.reason} — full screen overlay`));
	bus.on('phase:enter', (p) => {
		if (p.phase === 'shadow') console.log(`[SCREEN] 🌑 shadow_atmosphere — darken ambient`);
		if (p.phase === 'fellowship') console.log(`[SCREEN] 🌑 fellowship_light — warm ambient`);
	});

	// ── UI state placeholders ──
	bus.on('turn:start', (p) =>
		console.log(`[UI] Turn ${p.turnNumber} — FP: ${p.fpPlayerId}, Shadow: ${p.shadowPlayerId}`));
	bus.on('priority:change', (p) =>
		console.log(`[UI] Priority → ${p.playerId} (${p.phase})`));
	bus.on('reconcile:start', (p) =>
		console.log(`[UI] Reconcile — ${p.playerId} must discard ${p.mustDiscard} card(s)`));
	bus.on('player:pass', (p) =>
		console.log(`[UI] Pass — ${p.playerId} (${p.consecutivePasses} consecutive)`));
	bus.on('archery:totals', (p) =>
		console.log(`[UI] Archery totals — FP: ${p.fpTotal}, Shadow: ${p.shadowTotal}`));
}

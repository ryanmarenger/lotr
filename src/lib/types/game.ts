/**
 * LOTR TCG — Complete Game State Model
 *
 * Design principles:
 *   1. Fully serializable (JSON-safe — no Maps, Sets, or functions)
 *   2. Single object captures the ENTIRE game at any point in time
 *   3. Card definitions (Card) are immutable reference data;
 *      CardInGame is the mutable in-play instance
 *   4. Hidden information (opponent's hand, draw deck order) is filtered
 *      at the API boundary, not in the model itself
 */

import type { Card } from './card.js';

// ─── Enums & Literals ───────────────────────────────────────────────

/** The 7 main phases plus bookkeeping states */
export type GamePhase =
	| 'fellowship'
	| 'shadow'
	| 'maneuver'
	| 'archery'
	| 'assignment'
	| 'skirmish'
	| 'regroup';

/** Sub-states within a phase for fine-grained flow control */
export type PhaseStep =
	| 'actions'              // Normal action window (play cards, use abilities)
	| 'movement-decision'    // FP player deciding whether to move (fellowship phase)
	| 'archery-totals'       // Calculating archery totals
	| 'archery-assignment'   // Assigning archery wounds
	| 'assign-minions'       // Shadow player assigns minions to companions
	| 'assign-defenders'     // FP player assigns unassigned companions as defenders
	| 'resolve-skirmish'     // Resolving current skirmish
	| 'fierce-assignment'    // Assignment for fierce round
	| 'fierce-skirmish'      // Skirmish for fierce round
	| 'reconcile'            // Shadow reconciles hand (regroup)
	| 'fp-regroup-decision'; // FP player decides: move again or stay

/** Every location a card can be */
export type Zone =
	| 'hand'
	| 'draw_deck'
	| 'discard_pile'
	| 'dead_pile'
	| 'adventure_deck'     // Unplayed sites (face down)
	| 'adventure_path'     // Sites on the shared path
	| 'fellowship_area'    // Companions in play
	| 'shadow_area'        // Minions in play
	| 'support_area'       // Conditions, allies not attached to a character
	| 'attached'           // Possessions/artifacts/conditions on a character
	| 'stacked'            // Stacked on a card (certain effects)
	| 'out_of_play'        // Removed from game entirely
	| 'void';              // Special: Ring-bearer slot, One Ring slot (pre-game)

/** Player role for the current turn */
export type PlayerRole = 'fp' | 'shadow';

/** How the game ended */
export type WinReason =
	| 'ring_bearer_corruption'   // Burdens >= Ring-bearer's resistance
	| 'ring_bearer_killed'       // Ring-bearer has wounds >= vitality
	| 'fellowship_completed'     // FP survives regroup at site 9
	| 'fp_deck_exhausted'        // FP player can't draw when required
	| 'shadow_deck_exhausted'    // Shadow player can't draw when required
	| 'concession';              // A player conceded

// ─── Card Instance ──────────────────────────────────────────────────

/**
 * A single card in the game with mutable state.
 *
 * The `blueprintId` links back to the immutable Card definition.
 * Everything else is game state that changes during play.
 */
export interface CardInGame {
	/** Unique instance ID (e.g., "p1-0042"). Stable for the game's lifetime. */
	id: string;

	/** GEMP blueprint ID — key into the card definitions. */
	blueprintId: string;

	/** Player who owns this card (put it in their deck). */
	owner: string;

	/**
	 * Player who controls this card.
	 * Usually same as owner. Some effects transfer control.
	 */
	controller: string;

	/** Current zone. */
	zone: Zone;

	// ── Character state (companions, allies, minions) ──

	/** Number of wounds on this character. 0 for non-characters. */
	wounds: number;

	// ── Attachment relationships ──

	/** Instance ID of the card this is attached to (possessions, conditions on a character). */
	attachedTo: string | null;

	/** Instance IDs of cards attached to this card. */
	attachments: string[];

	/** Instance IDs of cards stacked on this card (e.g., conditions stacked by effects). */
	stackedCards: string[];

	// ── Temporary modifiers (scoped to turn or phase) ──

	/** Strength bonus/penalty from effects this turn. Reset at reconcile. */
	strengthModifier: number;

	/** Vitality bonus/penalty from effects this turn. */
	vitalityModifier: number;

	/** Resistance bonus/penalty (Ring-bearer). */
	resistanceModifier: number;

	/** Keywords granted by effects (not printed on card). */
	addedKeywords: string[];

	/** Keywords removed by effects (overrides printed keywords). */
	removedKeywords: string[];

	// ── Flags ──

	/** True if this companion is the current Ring-bearer. */
	isRingBearer: boolean;

	/** True if this is The One Ring card currently in play. */
	isOneRing: boolean;

	/**
	 * Site number on the adventure path (1-9).
	 * Only meaningful for cards in 'adventure_path' zone.
	 */
	siteNumber: number | null;

	/**
	 * Whether this minion is "roaming" (played at a site that doesn't
	 * match its site number — costs +2 twilight).
	 */
	roaming: boolean;

	/**
	 * Signet match — whether this card's signet matches the Ring-bearer's.
	 * Cached for performance; recalculated when Ring-bearer changes.
	 */
	signetMatch: boolean;

	/**
	 * Turn the card entered play. Used for "until start of your next turn"
	 * and similar timing effects.
	 */
	turnPlayed: number | null;

	/**
	 * Phase the card entered play in. Used for timing.
	 */
	phasePlayed: GamePhase | null;
}

// ─── Player ─────────────────────────────────────────────────────────

export interface Player {
	/** Unique player ID. */
	id: string;

	/** Display name. */
	name: string;

	/**
	 * Threat count.
	 * Used in Shadows block (sets 11+) and King block cards.
	 */
	threats: number;

	/**
	 * Number of cards drawn this turn.
	 * FP player draws 1 at fellowship phase start; tracked for effects.
	 */
	cardsDrawnThisTurn: number;

	/**
	 * Whether this player has taken their mulligan.
	 * Each player may mulligan once at game start.
	 */
	mulliganTaken: boolean;

	/**
	 * Culture tokens (Shadows block mechanic).
	 * Keyed by culture name, value is token count.
	 */
	cultureTokens: Record<string, number>;
}

// ─── Skirmish ───────────────────────────────────────────────────────

export interface Skirmish {
	/** Instance ID of the companion (or ally) in this skirmish. */
	companionId: string;

	/** Instance IDs of the minion(s) assigned against this companion. */
	minionIds: string[];

	/** Whether this skirmish has been resolved. */
	resolved: boolean;

	/** Whether this is a fierce-round skirmish. */
	fierce: boolean;
}

// ─── Game Log ───────────────────────────────────────────────────────

export type LogEntryType =
	| 'phase_change'
	| 'card_played'
	| 'card_moved'         // Card moved between zones
	| 'movement'           // Fellowship moved to a new site
	| 'wound'
	| 'heal'
	| 'killed'
	| 'exert'
	| 'twilight_add'
	| 'twilight_remove'
	| 'burden_add'
	| 'burden_remove'
	| 'threat_add'
	| 'threat_remove'
	| 'skirmish_start'
	| 'skirmish_resolve'
	| 'assignment'
	| 'archery'
	| 'overwhelmed'
	| 'corruption'
	| 'draw'
	| 'discard'
	| 'ability_used'
	| 'game_over'
	| 'mulligan'
	| 'pass';

export interface GameLogEntry {
	/** Auto-incrementing sequence number. */
	seq: number;

	/** Turn number when this happened. */
	turn: number;

	/** Phase when this happened. */
	phase: GamePhase;

	/** What happened. */
	type: LogEntryType;

	/** Player who caused this action (null for automatic/system events). */
	playerId: string | null;

	/** Human-readable description (for the game log UI). */
	message: string;

	/**
	 * Structured data about the event.
	 * Shape depends on `type`. The engine and UI can inspect this
	 * for animations, undo, replay, etc.
	 */
	data: Record<string, unknown>;

	/** ISO timestamp. */
	timestamp: string;
}

// ─── Game State ─────────────────────────────────────────────────────

/**
 * The complete, serializable snapshot of a game in progress.
 *
 * This is THE canonical representation. The server holds the authoritative
 * copy. The client receives a filtered view (hidden zones stripped).
 * AI reads this same structure.
 */
export interface GameState {
	// ── Identity ──

	/** Unique game ID. */
	id: string;

	/** ISO timestamp when the game started. */
	startedAt: string;

	// ── Players ──

	/** Exactly two players. Index 0 went first. */
	players: [Player, Player];

	// ── Turn tracking ──

	/** Current turn number (starts at 1). */
	turnNumber: number;

	/**
	 * Player ID of the current Free Peoples player.
	 * Alternates each turn. The FP player moves the fellowship,
	 * plays companions; the other player plays shadow cards.
	 */
	fpPlayerId: string;

	/**
	 * Player ID of the current Shadow player.
	 * Always the other player from fpPlayerId.
	 */
	shadowPlayerId: string;

	// ── Phase tracking ──

	/** Current game phase. */
	phase: GamePhase;

	/** Sub-step within the current phase. */
	phaseStep: PhaseStep;

	// ── Priority / action system ──

	/**
	 * Player ID of who has priority to act right now.
	 * In most phases, priority alternates between players.
	 */
	priorityPlayerId: string;

	/**
	 * Number of consecutive passes without an action.
	 * When both players pass (consecutivePasses >= 2), the phase advances.
	 */
	consecutivePasses: number;

	// ── Fellowship position ──

	/**
	 * Current site number the fellowship is at (1-9).
	 * Starts at 1 after setup.
	 */
	fellowshipPosition: number;

	/**
	 * Instance IDs of sites currently on the adventure path, indexed by
	 * site number (index 0 = site 1, index 8 = site 9).
	 * null slots = site not yet placed.
	 */
	adventurePath: (string | null)[];

	// ── Twilight pool ──

	/** Current number of twilight tokens in the pool. Cannot go below 0. */
	twilightPool: number;

	// ── Ring-bearer & corruption ──

	/** Instance ID of the current Ring-bearer card. */
	ringBearerId: string;

	/** Instance ID of The One Ring card. */
	oneRingId: string;

	/** Current burden count. Game lost if >= Ring-bearer's resistance. */
	burdens: number;

	// ── Movement ──

	/** How many times the fellowship has moved this turn. */
	movesThisTurn: number;

	/**
	 * Maximum moves allowed this turn.
	 * Default is 2 (Expanded format). Cards can modify this.
	 */
	moveLimit: number;

	/** Whether the fellowship has moved at least once this turn (required). */
	hasMovedThisTurn: boolean;

	// ── Skirmish state ──

	/** All skirmish assignments for this site. */
	assignments: Skirmish[];

	/** Index into assignments[] for the currently resolving skirmish. -1 if none. */
	currentSkirmishIndex: number;

	/** Whether we're in the fierce round of skirmishes. */
	fierceRound: boolean;

	// ── Cards ──

	/**
	 * Every card in the game, keyed by instance ID.
	 * This is the single source of truth for all card positions and state.
	 *
	 * To find cards in a specific zone, use the query helpers in engine/state.ts.
	 */
	cards: Record<string, CardInGame>;

	// ── Win condition ──

	/** Player ID of the winner, or null if game is ongoing. */
	winner: string | null;

	/** How the game was won/lost. */
	winReason: WinReason | null;

	// ── Game log ──

	/** Ordered log of all game events. Append-only. */
	log: GameLogEntry[];

	/** Next sequence number for log entries. */
	logSeq: number;
}

// ─── Client View ────────────────────────────────────────────────────

/**
 * A filtered view of GameState sent to a specific player.
 * Hides information that player shouldn't see:
 *   - Opponent's hand (card count only)
 *   - Both draw decks (card count only)
 *   - Opponent's adventure deck (card count only)
 */
export interface ClientGameView {
	/** The full game state, but with hidden zones replaced. */
	state: GameState;

	/** Which player this view is for. */
	viewingPlayerId: string;

	/** Number of cards in opponent's hand (cards themselves hidden). */
	opponentHandCount: number;

	/** Number of cards in own draw deck. */
	ownDrawDeckCount: number;

	/** Number of cards in opponent's draw deck. */
	opponentDrawDeckCount: number;

	/** Number of unplayed sites in opponent's adventure deck. */
	opponentAdventureDeckCount: number;
}

// ─── Action Types ───────────────────────────────────────────────────

/**
 * Actions a player can submit to the server.
 * The server validates and applies them to the authoritative GameState.
 */
export type GameAction =
	| { type: 'play_card'; cardId: string; targetId?: string }
	| { type: 'move_fellowship' }
	| { type: 'stay' }  // Don't move again (regroup decision)
	| { type: 'pass' }  // Pass priority
	| { type: 'assign_minion'; minionId: string; companionId: string }
	| { type: 'assign_defender'; companionId: string; minionId: string }
	| { type: 'assign_archery_wound'; targetId: string; count: number }
	| { type: 'use_ability'; cardId: string; abilityIndex: number; targetId?: string }
	| { type: 'discard_from_hand'; cardId: string }  // Reconcile
	| { type: 'mulligan' }
	| { type: 'keep_hand' }
	| { type: 'concede' };

// ─── Constants ──────────────────────────────────────────────────────

/** Phase order for normal turn flow. */
export const PHASE_ORDER: GamePhase[] = [
	'fellowship',
	'shadow',
	'maneuver',
	'archery',
	'assignment',
	'skirmish',
	'regroup',
];

/** Default move limit per turn (Expanded format). */
export const DEFAULT_MOVE_LIMIT = 2;

/** Twilight cost penalty for roaming minions. */
export const ROAMING_PENALTY = 2;

/** Starting hand size. */
export const STARTING_HAND_SIZE = 8;

/** Max hand size before reconcile (regroup). */
export const RECONCILE_HAND_LIMIT = 8;

/** Site 9 — reaching and surviving here wins the game for FP. */
export const FINAL_SITE = 9;

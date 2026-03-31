/**
 * LOTR TCG — Game State Factory & Query Helpers
 *
 * Creates initial game state from two decks and provides
 * pure-function helpers for querying and manipulating state.
 */

import type { Card } from '../types/card.js';
import type { Deck, DeckEntry } from '../types/deck.js';
import type {
	GameState,
	CardInGame,
	Player,
	GameLogEntry,
	Zone,
	GamePhase,
	ClientGameView,
} from '../types/game.js';
import {
	STARTING_HAND_SIZE,
	DEFAULT_MOVE_LIMIT,
	PHASE_ORDER,
} from '../types/game.js';

// ─── ID Generation ──────────────────────────────────────────────────

let instanceCounter = 0;

function nextCardId(playerPrefix: string): string {
	return `${playerPrefix}-${String(++instanceCounter).padStart(4, '0')}`;
}

function resetIdCounter(): void {
	instanceCounter = 0;
}

// ─── Card Instance Factory ──────────────────────────────────────────

function createCardInGame(
	blueprintId: string,
	owner: string,
	zone: Zone,
	playerPrefix: string,
): CardInGame {
	return {
		id: nextCardId(playerPrefix),
		blueprintId,
		owner,
		controller: owner,
		zone,
		wounds: 0,
		attachedTo: null,
		attachments: [],
		stackedCards: [],
		strengthModifier: 0,
		vitalityModifier: 0,
		resistanceModifier: 0,
		addedKeywords: [],
		removedKeywords: [],
		isRingBearer: false,
		isOneRing: false,
		siteNumber: null,
		roaming: false,
		signetMatch: false,
		turnPlayed: null,
		phasePlayed: null,
	};
}

// ─── Game Initialization ────────────────────────────────────────────

/**
 * Create a complete initial GameState from two players' decks.
 *
 * Setup follows Comprehensive Rules 4.1 §2.2:
 *   1. Each player reveals Ring-bearer and One Ring (placed in play)
 *   2. Adventure decks set aside face-down
 *   3. FP + Shadow cards shuffled into a single draw deck per player
 *   4. Each player draws 8 cards
 *   5. First player determined (by bid or random)
 *   6. Site 1 placed on adventure path by first player
 *
 * This function sets up everything EXCEPT the mulligan decision and
 * first site placement — those happen as game actions.
 */
export function createGameState(
	gameId: string,
	player1: { id: string; name: string; deck: Deck },
	player2: { id: string; name: string; deck: Deck },
	firstPlayerId: string,
	cardLookup: Record<string, Card>,
): GameState {
	resetIdCounter();

	const p1Prefix = 'p1';
	const p2Prefix = 'p2';

	const cards: Record<string, CardInGame> = {};

	// Helper: create card instances from deck entries and add to cards map
	function instantiateDeckCards(
		entries: DeckEntry[],
		owner: string,
		zone: Zone,
		prefix: string,
	): string[] {
		const ids: string[] = [];
		for (const entry of entries) {
			for (let i = 0; i < entry.count; i++) {
				const card = createCardInGame(entry.card.blueprintId, owner, zone, prefix);
				cards[card.id] = card;
				ids.push(card.id);
			}
		}
		return ids;
	}

	// Helper: create a single card instance
	function instantiateCard(
		blueprintId: string,
		owner: string,
		zone: Zone,
		prefix: string,
	): CardInGame {
		const card = createCardInGame(blueprintId, owner, zone, prefix);
		cards[card.id] = card;
		return card;
	}

	// ── Player 1 cards ──

	// Ring-bearer
	const p1RingBearer = instantiateCard(
		player1.deck.ringBearer!.blueprintId,
		player1.id,
		'fellowship_area',
		p1Prefix,
	);
	p1RingBearer.isRingBearer = true;
	p1RingBearer.turnPlayed = 0;

	// One Ring
	const p1OneRing = instantiateCard(
		player1.deck.oneRing!.blueprintId,
		player1.id,
		'attached',
		p1Prefix,
	);
	p1OneRing.isOneRing = true;
	p1OneRing.attachedTo = p1RingBearer.id;
	p1RingBearer.attachments.push(p1OneRing.id);

	// Draw deck (FP + Shadow cards, shuffled)
	const p1DrawIds = [
		...instantiateDeckCards(player1.deck.freePeoples, player1.id, 'draw_deck', p1Prefix),
		...instantiateDeckCards(player1.deck.shadow, player1.id, 'draw_deck', p1Prefix),
	];
	shuffleArray(p1DrawIds);
	// Order in draw_deck is tracked by array position — we'll store draw order separately
	// Actually, card order in draw deck matters. We'll track it with a deck-order array on the state.

	// Adventure deck
	for (const siteCard of player1.deck.adventure) {
		instantiateCard(siteCard.blueprintId, player1.id, 'adventure_deck', p1Prefix);
	}

	// ── Player 2 cards ──

	const p2RingBearer = instantiateCard(
		player2.deck.ringBearer!.blueprintId,
		player2.id,
		'fellowship_area',
		p2Prefix,
	);
	p2RingBearer.isRingBearer = true;
	p2RingBearer.turnPlayed = 0;

	const p2OneRing = instantiateCard(
		player2.deck.oneRing!.blueprintId,
		player2.id,
		'attached',
		p2Prefix,
	);
	p2OneRing.isOneRing = true;
	p2OneRing.attachedTo = p2RingBearer.id;
	p2RingBearer.attachments.push(p2OneRing.id);

	const p2DrawIds = [
		...instantiateDeckCards(player2.deck.freePeoples, player2.id, 'draw_deck', p2Prefix),
		...instantiateDeckCards(player2.deck.shadow, player2.id, 'draw_deck', p2Prefix),
	];
	shuffleArray(p2DrawIds);

	for (const siteCard of player2.deck.adventure) {
		instantiateCard(siteCard.blueprintId, player2.id, 'adventure_deck', p2Prefix);
	}

	// ── Build players ──

	const players: [Player, Player] = [
		{
			id: player1.id,
			name: player1.name,
			threats: 0,
			cardsDrawnThisTurn: 0,
			mulliganTaken: false,
			cultureTokens: {},
		},
		{
			id: player2.id,
			name: player2.name,
			threats: 0,
			cardsDrawnThisTurn: 0,
			mulliganTaken: false,
			cultureTokens: {},
		},
	];

	// ── Determine roles ──

	const secondPlayerId = firstPlayerId === player1.id ? player2.id : player1.id;

	// ── Build initial state ──

	const state: GameState = {
		id: gameId,
		startedAt: new Date().toISOString(),
		players,
		turnNumber: 1,
		fpPlayerId: firstPlayerId,
		shadowPlayerId: secondPlayerId,
		phase: 'fellowship',
		phaseStep: 'actions',
		priorityPlayerId: firstPlayerId,
		consecutivePasses: 0,
		fellowshipPosition: 0, // Not yet at site 1 — set to 1 after site placement
		adventurePath: Array(9).fill(null),
		twilightPool: 0,
		ringBearerId: firstPlayerId === player1.id ? p1RingBearer.id : p2RingBearer.id,
		oneRingId: firstPlayerId === player1.id ? p1OneRing.id : p2OneRing.id,
		burdens: 0,
		movesThisTurn: 0,
		moveLimit: DEFAULT_MOVE_LIMIT,
		hasMovedThisTurn: false,
		assignments: [],
		currentSkirmishIndex: -1,
		fierceRound: false,
		cards,
		winner: null,
		winReason: null,
		log: [],
		logSeq: 0,
	};

	// Deal starting hands (8 cards each) from their draw decks
	dealStartingHands(state, p1DrawIds, p2DrawIds);

	return state;
}

/**
 * Deal starting hands by moving the first STARTING_HAND_SIZE cards
 * from each player's shuffled draw deck into their hand.
 */
function dealStartingHands(
	state: GameState,
	p1DrawOrder: string[],
	p2DrawOrder: string[],
): void {
	const p1Hand = p1DrawOrder.splice(0, STARTING_HAND_SIZE);
	const p2Hand = p2DrawOrder.splice(0, STARTING_HAND_SIZE);

	for (const id of p1Hand) {
		state.cards[id].zone = 'hand';
	}
	for (const id of p2Hand) {
		state.cards[id].zone = 'hand';
	}
}

// ─── Query Helpers ──────────────────────────────────────────────────

/** Get all card instances in a given zone owned by a specific player. */
export function getCardsInZone(
	state: GameState,
	zone: Zone,
	ownerId?: string,
): CardInGame[] {
	return Object.values(state.cards).filter(
		(c) => c.zone === zone && (ownerId === undefined || c.owner === ownerId),
	);
}

/** Get all card instances controlled by a specific player in a given zone. */
export function getControlledCardsInZone(
	state: GameState,
	zone: Zone,
	controllerId: string,
): CardInGame[] {
	return Object.values(state.cards).filter(
		(c) => c.zone === zone && c.controller === controllerId,
	);
}

/** Get a card instance by ID. Throws if not found. */
export function getCard(state: GameState, cardId: string): CardInGame {
	const card = state.cards[cardId];
	if (!card) throw new Error(`Card not found: ${cardId}`);
	return card;
}

/** Get the Card definition for a CardInGame instance. */
export function getCardDef(
	cardInGame: CardInGame,
	cardLookup: Record<string, Card>,
): Card {
	const def = cardLookup[cardInGame.blueprintId];
	if (!def) throw new Error(`Card definition not found: ${cardInGame.blueprintId}`);
	return def;
}

/** Get all companions currently in the fellowship area. */
export function getCompanions(state: GameState): CardInGame[] {
	return getCardsInZone(state, 'fellowship_area');
}

/** Get the current Ring-bearer card instance. */
export function getRingBearer(state: GameState): CardInGame {
	return getCard(state, state.ringBearerId);
}

/** Get the One Ring card instance. */
export function getOneRing(state: GameState): CardInGame {
	return getCard(state, state.oneRingId);
}

/** Get all minions currently in the shadow area. */
export function getMinions(state: GameState): CardInGame[] {
	return getCardsInZone(state, 'shadow_area');
}

/** Get all cards attached to a specific card. */
export function getAttachments(state: GameState, cardId: string): CardInGame[] {
	const card = getCard(state, cardId);
	return card.attachments.map((id) => getCard(state, id));
}

/** Get a player's hand. */
export function getHand(state: GameState, playerId: string): CardInGame[] {
	return getCardsInZone(state, 'hand', playerId);
}

/** Get a player's draw deck. */
export function getDrawDeck(state: GameState, playerId: string): CardInGame[] {
	return getCardsInZone(state, 'draw_deck', playerId);
}

/** Get a player's discard pile. */
export function getDiscardPile(state: GameState, playerId: string): CardInGame[] {
	return getCardsInZone(state, 'discard_pile', playerId);
}

/** Get a player by ID. Throws if not found. */
export function getPlayer(state: GameState, playerId: string): Player {
	const player = state.players.find((p) => p.id === playerId);
	if (!player) throw new Error(`Player not found: ${playerId}`);
	return player;
}

/** Get the opponent's player ID. */
export function getOpponentId(state: GameState, playerId: string): string {
	return state.players[0].id === playerId ? state.players[1].id : state.players[0].id;
}

/** Get the site card at a given position on the adventure path. */
export function getSiteAt(state: GameState, position: number): CardInGame | null {
	const siteId = state.adventurePath[position - 1];
	return siteId ? getCard(state, siteId) : null;
}

/** Get the current site (where the fellowship is). */
export function getCurrentSite(state: GameState): CardInGame | null {
	return getSiteAt(state, state.fellowshipPosition);
}

// ─── Character Stat Helpers ─────────────────────────────────────────

/** Get effective strength of a character (base + modifiers + possessions). */
export function getEffectiveStrength(
	state: GameState,
	cardId: string,
	cardLookup: Record<string, Card>,
): number {
	const card = getCard(state, cardId);
	const def = getCardDef(card, cardLookup);

	let strength = (def.strength ?? 0) + card.strengthModifier;

	// Add strength from attached possessions/artifacts
	for (const attachId of card.attachments) {
		const attach = getCard(state, attachId);
		const attachDef = getCardDef(attach, cardLookup);
		// Static strength bonuses are in the card's effects — for now,
		// possessions don't have a "strength" field on the definition.
		// This will be expanded when the effect engine is built (Milestone 3).
		// Strength modifiers applied by effects go into strengthModifier.
		strength += attach.strengthModifier;
	}

	return Math.max(0, strength);
}

/** Get effective vitality of a character (base + modifiers). */
export function getEffectiveVitality(
	state: GameState,
	cardId: string,
	cardLookup: Record<string, Card>,
): number {
	const card = getCard(state, cardId);
	const def = getCardDef(card, cardLookup);
	return Math.max(0, (def.vitality ?? 0) + card.vitalityModifier);
}

/** Get effective resistance of the Ring-bearer. */
export function getEffectiveResistance(
	state: GameState,
	cardLookup: Record<string, Card>,
): number {
	const rb = getRingBearer(state);
	const def = getCardDef(rb, cardLookup);
	return Math.max(0, (def.resistance ?? 0) + rb.resistanceModifier);
}

/** Check if a character is exhausted (wounds = vitality - 1). */
export function isExhausted(
	state: GameState,
	cardId: string,
	cardLookup: Record<string, Card>,
): boolean {
	const card = getCard(state, cardId);
	const vitality = getEffectiveVitality(state, cardId, cardLookup);
	return card.wounds >= vitality - 1 && vitality > 0;
}

/** Check if a character would be killed (wounds >= vitality). */
export function isLethal(
	state: GameState,
	cardId: string,
	cardLookup: Record<string, Card>,
): boolean {
	const card = getCard(state, cardId);
	const vitality = getEffectiveVitality(state, cardId, cardLookup);
	return card.wounds >= vitality;
}

/** Check if a companion is overwhelmed (enemy strength >= double their strength). */
export function isOverwhelmed(
	companionStrength: number,
	totalMinionStrength: number,
): boolean {
	return totalMinionStrength >= companionStrength * 2;
}

// ─── Keyword Helpers ────────────────────────────────────────────────

/** Get the effective keywords for a card (base + added - removed). */
export function getEffectiveKeywords(
	card: CardInGame,
	cardLookup: Record<string, Card>,
): string[] {
	const def = cardLookup[card.blueprintId];
	if (!def) return [...card.addedKeywords];

	const base = new Set(def.keywords);

	for (const kw of card.addedKeywords) base.add(kw);
	for (const kw of card.removedKeywords) base.delete(kw);

	return Array.from(base);
}

/** Check if a card has a specific keyword (considering modifiers). */
export function hasKeyword(
	card: CardInGame,
	keyword: string,
	cardLookup: Record<string, Card>,
): boolean {
	return getEffectiveKeywords(card, cardLookup)
		.some((kw) => kw.toLowerCase().startsWith(keyword.toLowerCase()));
}

// ─── Logging ────────────────────────────────────────────────────────

/** Append a log entry to the game state. */
export function addLogEntry(
	state: GameState,
	type: GameLogEntry['type'],
	playerId: string | null,
	message: string,
	data: Record<string, unknown> = {},
): void {
	state.log.push({
		seq: state.logSeq++,
		turn: state.turnNumber,
		phase: state.phase,
		type,
		playerId,
		message,
		data,
		timestamp: new Date().toISOString(),
	});
}

// ─── Client View ────────────────────────────────────────────────────

/**
 * Create a filtered game view for a specific player.
 * Strips hidden information (opponent's hand contents, draw deck order, etc.)
 */
export function createClientView(
	state: GameState,
	viewingPlayerId: string,
): ClientGameView {
	const opponentId = getOpponentId(state, viewingPlayerId);

	// Deep-clone the state so we can redact without mutating
	const filtered: GameState = JSON.parse(JSON.stringify(state));

	// Count hidden cards before removing them
	const opponentHandCount = getHand(state, opponentId).length;
	const ownDrawDeckCount = getDrawDeck(state, viewingPlayerId).length;
	const opponentDrawDeckCount = getDrawDeck(state, opponentId).length;
	const opponentAdventureDeckCount = getCardsInZone(state, 'adventure_deck', opponentId).length;

	// Redact opponent's hand — replace with stub cards (preserving count)
	for (const id in filtered.cards) {
		const card = filtered.cards[id];
		if (card.zone === 'hand' && card.owner === opponentId) {
			// Clear identifying info
			card.blueprintId = 'hidden';
		}
		// Redact both draw decks (even your own — you shouldn't know the order)
		if (card.zone === 'draw_deck') {
			card.blueprintId = 'hidden';
		}
		// Redact opponent's adventure deck
		if (card.zone === 'adventure_deck' && card.owner === opponentId) {
			card.blueprintId = 'hidden';
		}
	}

	return {
		state: filtered,
		viewingPlayerId,
		opponentHandCount,
		ownDrawDeckCount,
		opponentDrawDeckCount,
		opponentAdventureDeckCount,
	};
}

// ─── Utilities ──────────────────────────────────────────────────────

/** Fisher-Yates shuffle (in-place). */
function shuffleArray<T>(arr: T[]): T[] {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/** Get the next phase in the turn sequence. */
export function getNextPhase(current: GamePhase): GamePhase | null {
	const idx = PHASE_ORDER.indexOf(current);
	if (idx === -1 || idx === PHASE_ORDER.length - 1) return null; // regroup is last
	return PHASE_ORDER[idx + 1];
}

/** Check if the FP player has won (fellowship survived regroup at site 9). */
export function checkFellowshipVictory(state: GameState): boolean {
	return state.fellowshipPosition >= 9
		&& state.phase === 'regroup'
		&& state.winner === null;
}

/** Check if the Ring-bearer is corrupted (burdens >= resistance). */
export function checkCorruption(
	state: GameState,
	cardLookup: Record<string, Card>,
): boolean {
	const resistance = getEffectiveResistance(state, cardLookup);
	return state.burdens >= resistance;
}

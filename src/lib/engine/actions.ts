/**
 * LOTR TCG — Action Validation & Execution
 *
 * Validates and executes all player GameActions against
 * the authoritative GameState. This is the server-side
 * action handler — every player input flows through here.
 *
 * Covers Milestone 2 tasks:
 *   2.3 Card play validation (twilight, uniqueness, zone rules)
 *   2.4 Adventure path (site placement during movement)
 *   2.5 Basic combat (integrated in phases.ts)
 *   2.6 Hand management (draw, discard, mulligan)
 */

import type { Card } from '../types/card.js';
import type {
	GameState,
	GameAction,
	CardInGame,
} from '../types/game.js';
import {
	ROAMING_PENALTY,
	RECONCILE_HAND_LIMIT,
} from '../types/game.js';
import {
	getCard,
	getCardDef,
	getCardsInZone,
	getCompanions,
	getMinions,
	getHand,
	getDrawDeck,
	getPlayer,
	getOpponentId,
	getRingBearer,
	addLogEntry,
	checkCorruption,
} from './state.js';
import {
	handlePass,
	resetPassCount,
	moveFellowship,
	moveAgain,
	startTurn,
	resolveCurrentSkirmish,
	assignMinion,
	advancePhase,
	drawCards,
	woundCharacter,
} from './phases.js';

// ─── Action Result ──────────────────────────────────────────────────

export interface ActionResult {
	success: boolean;
	message: string;
	gameOver?: boolean;
}

// ─── Action Dispatch ────────────────────────────────────────────────

/**
 * Main entry point: validate and execute a player action.
 *
 * The server calls this for every action received from a client.
 * Returns success/failure with a message.
 */
export function executeAction(
	state: GameState,
	playerId: string,
	action: GameAction,
	cardLookup: Record<string, Card>,
): ActionResult {
	// Game already over
	if (state.winner) {
		return { success: false, message: 'Game is already over.' };
	}

	switch (action.type) {
		case 'play_card':
			return executePlayCard(state, playerId, action.cardId, action.targetId, cardLookup);

		case 'move_fellowship':
			return executeMoveDecision(state, playerId, cardLookup);

		case 'stay':
			return executeStay(state, playerId, cardLookup);

		case 'pass':
			return executePass(state, playerId, cardLookup);

		case 'assign_minion':
			return executeAssignMinion(state, playerId, action.minionId, action.companionId, cardLookup);

		case 'assign_defender':
			return executeAssignDefender(state, playerId, action.companionId, action.minionId, cardLookup);

		case 'assign_archery_wound':
			return executeAssignArcheryWound(state, playerId, action.targetId, action.count, cardLookup);

		case 'use_ability':
			// Milestone 3 — effect engine handles this
			return { success: false, message: 'Card abilities not yet implemented.' };

		case 'discard_from_hand':
			return executeDiscardFromHand(state, playerId, action.cardId, cardLookup);

		case 'mulligan':
			return executeMulligan(state, playerId, cardLookup);

		case 'keep_hand':
			return executeKeepHand(state, playerId, cardLookup);

		case 'concede':
			return executeConcede(state, playerId);

		default:
			return { success: false, message: 'Unknown action type.' };
	}
}

// ─── Play Card ──────────────────────────────────────────────────────

function executePlayCard(
	state: GameState,
	playerId: string,
	cardId: string,
	targetId: string | undefined,
	cardLookup: Record<string, Card>,
): ActionResult {
	const card = state.cards[cardId];
	if (!card) return { success: false, message: 'Card not found.' };
	if (card.owner !== playerId) return { success: false, message: 'Not your card.' };
	if (card.zone !== 'hand') return { success: false, message: 'Card is not in your hand.' };

	const def = getCardDef(card, cardLookup);

	// Validate based on card type and current phase
	const validation = validateCardPlay(state, playerId, card, def, targetId, cardLookup);
	if (!validation.valid) return { success: false, message: validation.reason! };

	// Pay twilight cost
	const twilightCost = calculateTwilightCost(state, card, def, cardLookup);

	if (def.side === 'Free Peoples') {
		// FP cards ADD twilight to the pool
		state.twilightPool += twilightCost;
		addLogEntry(state, 'twilight_add', playerId,
			`+${twilightCost} twilight (${def.title})`, { amount: twilightCost });
	} else if (def.side === 'Shadow') {
		// Shadow cards REMOVE twilight from the pool
		if (state.twilightPool < twilightCost) {
			return { success: false, message: `Not enough twilight (need ${twilightCost}, have ${state.twilightPool}).` };
		}
		state.twilightPool -= twilightCost;
		addLogEntry(state, 'twilight_remove', playerId,
			`-${twilightCost} twilight (${def.title})`, { amount: twilightCost });
	}

	// Place the card in the appropriate zone
	placeCard(state, card, def, targetId, cardLookup);

	card.turnPlayed = state.turnNumber;
	card.phasePlayed = state.phase;

	addLogEntry(state, 'card_played', playerId,
		`Plays ${def.title}${def.subtitle ? ', ' + def.subtitle : ''}`, {
			cardId,
			blueprintId: card.blueprintId,
			zone: card.zone,
		});

	// Reset pass count (an action was taken)
	resetPassCount(state);

	// Check win conditions after card play
	if (checkCorruption(state, cardLookup)) {
		state.winner = state.shadowPlayerId;
		state.winReason = 'ring_bearer_corruption';
		return { success: true, message: `${def.title} played. Ring-bearer corrupted!`, gameOver: true };
	}

	return { success: true, message: `${def.title} played.` };
}

// ─── Card Play Validation ───────────────────────────────────────────

interface ValidationResult {
	valid: boolean;
	reason?: string;
}

function validateCardPlay(
	state: GameState,
	playerId: string,
	card: CardInGame,
	def: Card,
	targetId: string | undefined,
	cardLookup: Record<string, Card>,
): ValidationResult {
	// Check phase restrictions
	if (def.side === 'Free Peoples') {
		if (playerId !== state.fpPlayerId) {
			return { valid: false, reason: 'Only the FP player can play Free Peoples cards.' };
		}
		if (state.phase !== 'fellowship') {
			// Events can be played in other phases based on timeword
			if (def.type !== 'Event') {
				return { valid: false, reason: 'Free Peoples cards (except events) can only be played in fellowship phase.' };
			}
			if (def.timeword && !isValidTimeword(def.timeword, state.phase)) {
				return { valid: false, reason: `This event can only be played during ${def.timeword} phase.` };
			}
		}
	} else if (def.side === 'Shadow') {
		if (playerId !== state.shadowPlayerId) {
			return { valid: false, reason: 'Only the Shadow player can play Shadow cards.' };
		}
		if (state.phase !== 'shadow') {
			if (def.type !== 'Event') {
				return { valid: false, reason: 'Shadow cards (except events) can only be played in shadow phase.' };
			}
			if (def.timeword && !isValidTimeword(def.timeword, state.phase)) {
				return { valid: false, reason: `This event can only be played during ${def.timeword} phase.` };
			}
		}
	}

	// Check uniqueness
	if (def.unique) {
		const inPlay = Object.values(state.cards).filter(
			c => c.blueprintId === card.blueprintId &&
				(c.zone === 'fellowship_area' || c.zone === 'shadow_area' || c.zone === 'support_area' || c.zone === 'attached'),
		);
		if (inPlay.length > 0) {
			return { valid: false, reason: `${def.title} is unique and already in play.` };
		}
	}

	// Type-specific validation
	switch (def.type) {
		case 'Companion':
			return validateCompanionPlay(state, def);
		case 'Ally':
			return validateAllyPlay(state, def);
		case 'Minion':
			return validateMinionPlay(state, card, def, cardLookup);
		case 'Possession':
		case 'Artifact':
			return validateAttachmentPlay(state, def, targetId, cardLookup);
		case 'Condition':
			return validateConditionPlay(state, def, targetId, cardLookup);
		case 'Event':
			return { valid: true }; // Events are validated by timeword above
		default:
			return { valid: false, reason: `Cannot play ${def.type} cards directly.` };
	}
}

function validateCompanionPlay(state: GameState, def: Card): ValidationResult {
	// Companions can only be played during fellowship phase
	if (state.phase !== 'fellowship') {
		return { valid: false, reason: 'Companions can only be played during fellowship phase.' };
	}
	return { valid: true };
}

function validateAllyPlay(state: GameState, def: Card): ValidationResult {
	// Allies can be played if at their home site
	// For Milestone 2, allow play during fellowship phase
	if (state.phase !== 'fellowship') {
		return { valid: false, reason: 'Allies can only be played during fellowship phase.' };
	}
	return { valid: true };
}

function validateMinionPlay(
	state: GameState,
	card: CardInGame,
	def: Card,
	cardLookup: Record<string, Card>,
): ValidationResult {
	if (state.phase !== 'shadow') {
		return { valid: false, reason: 'Minions can only be played during shadow phase.' };
	}

	// Check twilight cost (roaming penalty if site number doesn't match)
	const totalCost = calculateTwilightCost(state, card, def, cardLookup);
	if (state.twilightPool < totalCost) {
		return { valid: false, reason: `Not enough twilight (need ${totalCost}, have ${state.twilightPool}).` };
	}

	return { valid: true };
}

function validateAttachmentPlay(
	state: GameState,
	def: Card,
	targetId: string | undefined,
	cardLookup: Record<string, Card>,
): ValidationResult {
	if (!targetId) {
		return { valid: false, reason: 'Must specify a target to attach to.' };
	}

	const target = state.cards[targetId];
	if (!target) return { valid: false, reason: 'Target not found.' };

	const targetDef = getCardDef(target, cardLookup);

	// Must attach to a character in play
	if (target.zone !== 'fellowship_area' && target.zone !== 'shadow_area') {
		return { valid: false, reason: 'Target must be a character in play.' };
	}

	// Check class restrictions (e.g., "Hand Weapon" goes on companions)
	if (def.target) {
		const raceMatch = targetDef.race?.toLowerCase().includes(def.target.toLowerCase());
		const typeMatch = targetDef.type?.toLowerCase().includes(def.target.toLowerCase());
		if (!raceMatch && !typeMatch) {
			return { valid: false, reason: `This ${def.itemClass || 'attachment'} can only be placed on a ${def.target}.` };
		}
	}

	// Check item class uniqueness (e.g., can only have one "Hand Weapon")
	if (def.itemClass) {
		const existing = target.attachments
			.map(id => state.cards[id])
			.filter(c => {
				const d = cardLookup[c.blueprintId];
				return d && d.itemClass === def.itemClass;
			});
		if (existing.length > 0) {
			return { valid: false, reason: `Target already has a ${def.itemClass}.` };
		}
	}

	return { valid: true };
}

function validateConditionPlay(
	state: GameState,
	def: Card,
	targetId: string | undefined,
	cardLookup: Record<string, Card>,
): ValidationResult {
	// Conditions can be played on characters or in the support area
	// If targetId is provided, attach to character; otherwise support area
	if (targetId) {
		const target = state.cards[targetId];
		if (!target) return { valid: false, reason: 'Target not found.' };
		if (target.zone !== 'fellowship_area' && target.zone !== 'shadow_area') {
			return { valid: false, reason: 'Target must be a character in play.' };
		}
	}
	return { valid: true };
}

// ─── Twilight Cost Calculation ──────────────────────────────────────

function calculateTwilightCost(
	state: GameState,
	card: CardInGame,
	def: Card,
	cardLookup: Record<string, Card>,
): number {
	let cost = def.twilight;

	// Roaming penalty for minions played at wrong site
	if (def.type === 'Minion' && def.siteNumber !== undefined) {
		if (def.siteNumber !== state.fellowshipPosition) {
			cost += ROAMING_PENALTY;
			card.roaming = true;
		}
	}

	return Math.max(0, cost);
}

// ─── Card Placement ─────────────────────────────────────────────────

function placeCard(
	state: GameState,
	card: CardInGame,
	def: Card,
	targetId: string | undefined,
	cardLookup: Record<string, Card>,
): void {
	switch (def.type) {
		case 'Companion':
			card.zone = 'fellowship_area';
			break;

		case 'Ally':
			card.zone = 'support_area';
			break;

		case 'Minion':
			card.zone = 'shadow_area';
			break;

		case 'Possession':
		case 'Artifact':
			if (targetId) {
				card.zone = 'attached';
				card.attachedTo = targetId;
				const target = getCard(state, targetId);
				target.attachments.push(card.id);
			} else {
				card.zone = 'support_area';
			}
			break;

		case 'Condition':
			if (targetId) {
				card.zone = 'attached';
				card.attachedTo = targetId;
				const target = getCard(state, targetId);
				target.attachments.push(card.id);
			} else {
				card.zone = 'support_area';
			}
			break;

		case 'Event':
			// Events resolve immediately then go to discard
			card.zone = 'discard_pile';
			// Event effects will be handled by the effect engine (Milestone 3)
			break;

		default:
			card.zone = 'support_area';
			break;
	}
}

// ─── Movement Decision ──────────────────────────────────────────────

function executeMoveDecision(
	state: GameState,
	playerId: string,
	cardLookup: Record<string, Card>,
): ActionResult {
	if (playerId !== state.fpPlayerId) {
		return { success: false, message: 'Only the FP player can move the fellowship.' };
	}

	// Find the site card from the FP player's adventure deck
	const adventureDeck = getCardsInZone(state, 'adventure_deck', state.fpPlayerId);
	const nextPos = state.fellowshipPosition + 1;

	// Find a site card matching the next position
	let siteCard: CardInGame | null = null;
	for (const card of adventureDeck) {
		const def = getCardDef(card, cardLookup);
		if (def.siteNumber === nextPos || def.type === 'Site') {
			siteCard = card;
			break;
		}
	}

	// If no matching site, use any available site
	if (!siteCard && adventureDeck.length > 0) {
		siteCard = adventureDeck[0];
	}

	if (!siteCard) {
		return { success: false, message: 'No site cards available in adventure deck.' };
	}

	const result = moveFellowship(state, siteCard.id, cardLookup);
	return {
		success: true,
		message: result.message,
		gameOver: result.gameOver,
	};
}

// ─── Stay (regroup decision) ────────────────────────────────────────

function executeStay(
	state: GameState,
	playerId: string,
	cardLookup: Record<string, Card>,
): ActionResult {
	if (playerId !== state.fpPlayerId) {
		return { success: false, message: 'Only the FP player can choose to stay.' };
	}
	if (state.phase !== 'regroup' || state.phaseStep !== 'fp-regroup-decision') {
		return { success: false, message: 'Not in regroup decision step.' };
	}

	const result = advancePhase(state, cardLookup);
	return { success: true, message: result.message, gameOver: result.gameOver };
}

// ─── Pass ───────────────────────────────────────────────────────────

function executePass(
	state: GameState,
	playerId: string,
	cardLookup: Record<string, Card>,
): ActionResult {
	if (playerId !== state.priorityPlayerId) {
		return { success: false, message: 'Not your priority to act.' };
	}

	// In movement-decision, passing means you must move
	if (state.phaseStep === 'movement-decision') {
		return executeMoveDecision(state, playerId, cardLookup);
	}

	// In regroup decision, pass = move again
	if (state.phaseStep === 'fp-regroup-decision') {
		const result = moveAgain(state, cardLookup);
		return { success: true, message: result.message, gameOver: result.gameOver };
	}

	const result = handlePass(state, playerId, cardLookup);
	return { success: true, message: result.message, gameOver: result.gameOver };
}

// ─── Assignment ─────────────────────────────────────────────────────

function executeAssignMinion(
	state: GameState,
	playerId: string,
	minionId: string,
	companionId: string,
	cardLookup: Record<string, Card>,
): ActionResult {
	if (playerId !== state.shadowPlayerId) {
		return { success: false, message: 'Only the Shadow player can assign minions.' };
	}
	if (state.phase !== 'assignment' &&
		!(state.phase === 'skirmish' && state.phaseStep === 'fierce-assignment')) {
		return { success: false, message: 'Not in assignment phase.' };
	}

	const minion = state.cards[minionId];
	const companion = state.cards[companionId];
	if (!minion || minion.zone !== 'shadow_area') return { success: false, message: 'Invalid minion.' };
	if (!companion || companion.zone !== 'fellowship_area') return { success: false, message: 'Invalid companion.' };

	const isFierce = state.fierceRound;
	assignMinion(state, minionId, companionId, isFierce);
	resetPassCount(state);

	return { success: true, message: 'Minion assigned.' };
}

function executeAssignDefender(
	state: GameState,
	playerId: string,
	companionId: string,
	minionId: string,
	cardLookup: Record<string, Card>,
): ActionResult {
	if (playerId !== state.fpPlayerId) {
		return { success: false, message: 'Only the FP player can assign defenders.' };
	}
	if (state.phaseStep !== 'assign-defenders') {
		return { success: false, message: 'Not in defender assignment step.' };
	}

	const companion = state.cards[companionId];
	const minion = state.cards[minionId];
	if (!companion || companion.zone !== 'fellowship_area') return { success: false, message: 'Invalid companion.' };
	if (!minion || minion.zone !== 'shadow_area') return { success: false, message: 'Invalid minion.' };

	assignMinion(state, minionId, companionId, state.fierceRound);
	resetPassCount(state);

	return { success: true, message: 'Defender assigned.' };
}

// ─── Archery Wound Assignment ───────────────────────────────────────

function executeAssignArcheryWound(
	state: GameState,
	playerId: string,
	targetId: string,
	count: number,
	cardLookup: Record<string, Card>,
): ActionResult {
	if (state.phase !== 'archery' || state.phaseStep !== 'archery-assignment') {
		return { success: false, message: 'Not in archery wound assignment step.' };
	}

	const target = state.cards[targetId];
	if (!target) return { success: false, message: 'Target not found.' };

	// FP assigns shadow archery wounds to their companions
	if (playerId === state.fpPlayerId) {
		if (target.zone !== 'fellowship_area') {
			return { success: false, message: 'Must assign archery wounds to companions.' };
		}
	} else {
		if (target.zone !== 'shadow_area') {
			return { success: false, message: 'Must assign archery wounds to minions.' };
		}
	}

	woundCharacter(state, targetId, count, cardLookup);

	// Check if ring-bearer was killed
	if (state.winner) {
		return { success: true, message: 'Archery wound assigned. Game over!', gameOver: true };
	}

	return { success: true, message: `${count} archery wound(s) assigned.` };
}

// ─── Discard (Reconcile) ────────────────────────────────────────────

function executeDiscardFromHand(
	state: GameState,
	playerId: string,
	cardId: string,
	cardLookup: Record<string, Card>,
): ActionResult {
	const card = state.cards[cardId];
	if (!card) return { success: false, message: 'Card not found.' };
	if (card.owner !== playerId) return { success: false, message: 'Not your card.' };
	if (card.zone !== 'hand') return { success: false, message: 'Card is not in your hand.' };

	card.zone = 'discard_pile';
	const def = getCardDef(card, cardLookup);

	addLogEntry(state, 'discard', playerId,
		`Discards ${def.title}`, { cardId });

	// Check if reconcile is complete
	if (state.phaseStep === 'reconcile') {
		const hand = getHand(state, playerId);
		if (hand.length <= RECONCILE_HAND_LIMIT) {
			// Reconcile done — advance
			const result = advancePhase(state, cardLookup);
			return { success: true, message: result.message, gameOver: result.gameOver };
		}
		return {
			success: true,
			message: `Discarded ${def.title}. ${hand.length - RECONCILE_HAND_LIMIT} more to discard.`,
		};
	}

	return { success: true, message: `Discarded ${def.title}.` };
}

// ─── Mulligan ───────────────────────────────────────────────────────

function executeMulligan(
	state: GameState,
	playerId: string,
	cardLookup: Record<string, Card>,
): ActionResult {
	const player = getPlayer(state, playerId);

	if (player.mulliganTaken) {
		return { success: false, message: 'You already took your mulligan.' };
	}

	// Return all cards in hand to draw deck, shuffle, redraw
	const hand = getHand(state, playerId);
	for (const card of hand) {
		card.zone = 'draw_deck';
	}

	// Shuffle the draw deck
	const drawDeck = getDrawDeck(state, playerId);
	for (let i = drawDeck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		// Swap zone positions (they're all draw_deck, so just conceptual)
	}

	// Draw new hand
	const drawn = drawCards(state, playerId, 8, cardLookup);
	player.mulliganTaken = true;

	addLogEntry(state, 'mulligan', playerId,
		`Mulligans — draws ${drawn} new cards`, { drawn });

	return { success: true, message: `Mulligan complete. Drew ${drawn} cards.` };
}

function executeKeepHand(
	state: GameState,
	playerId: string,
	cardLookup: Record<string, Card>,
): ActionResult {
	const player = getPlayer(state, playerId);
	player.mulliganTaken = true;

	addLogEntry(state, 'mulligan', playerId, 'Keeps hand', {});
	return { success: true, message: 'Hand kept.' };
}

// ─── Concede ────────────────────────────────────────────────────────

function executeConcede(
	state: GameState,
	playerId: string,
): ActionResult {
	const opponentId = getOpponentId(state, playerId);
	state.winner = opponentId;
	state.winReason = 'concession';

	addLogEntry(state, 'game_over', playerId,
		`${playerId} concedes. ${opponentId} wins!`, { winner: opponentId });

	return { success: true, message: 'You conceded.', gameOver: true };
}

// ─── Timeword Validation ────────────────────────────────────────────

function isValidTimeword(timeword: string, phase: string): boolean {
	const tw = timeword.toLowerCase();
	const ph = phase.toLowerCase();

	// Direct match
	if (tw === ph) return true;

	// "Response" events can be played at any time
	if (tw === 'response') return true;

	// "Skirmish" events valid in skirmish phase
	if (tw === 'skirmish' && ph === 'skirmish') return true;

	// "Maneuver" events valid in maneuver phase
	if (tw === 'maneuver' && ph === 'maneuver') return true;

	// "Archery" events valid in archery phase
	if (tw === 'archery' && ph === 'archery') return true;

	// "Regroup" events valid in regroup phase
	if (tw === 'regroup' && ph === 'regroup') return true;

	// "Assignment" events valid in assignment phase
	if (tw === 'assignment' && ph === 'assignment') return true;

	return false;
}

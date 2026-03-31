/**
 * LOTR TCG — Phase State Machine
 *
 * Drives the turn through all 7 phases with:
 *   - Phase transitions (fellowship → shadow → ... → regroup)
 *   - Priority passing (both pass = advance phase)
 *   - Movement logic (fellowship → next site, twilight generation)
 *   - Archery totals and wound assignment
 *   - Assignment and skirmish resolution
 *   - Fierce round loop
 *   - Regroup reconcile + move-again decision
 *   - Win condition checks at every state change
 *
 * All functions are pure: they mutate the GameState passed in
 * and return a result describing what happened. The caller
 * (server action handler) is responsible for broadcasting updates.
 */

import type { Card } from '../types/card.js';
import type {
	GameState,
	GamePhase,
	PhaseStep,
	Skirmish,
	CardInGame,
} from '../types/game.js';
import {
	PHASE_ORDER,
	DEFAULT_MOVE_LIMIT,
	RECONCILE_HAND_LIMIT,
	FINAL_SITE,
	ROAMING_PENALTY,
} from '../types/game.js';
import {
	addLogEntry,
	getCard,
	getCardDef,
	getCardsInZone,
	getCompanions,
	getMinions,
	getHand,
	getDrawDeck,
	getOpponentId,
	getEffectiveStrength,
	getEffectiveVitality,
	getEffectiveResistance,
	getRingBearer,
	hasKeyword,
	isOverwhelmed,
	getNextPhase,
	checkCorruption,
	checkFellowshipVictory,
} from './state.js';

// ─── Phase Transition Result ────────────────────────────────────────

export interface PhaseResult {
	/** Whether a phase/step change occurred. */
	transitioned: boolean;

	/** New phase after transition (if any). */
	newPhase?: GamePhase;

	/** New step after transition (if any). */
	newStep?: PhaseStep;

	/** Whether the game ended as a result. */
	gameOver: boolean;

	/** Description of what happened (for logging). */
	message: string;
}

// ─── Start of Turn ──────────────────────────────────────────────────

/**
 * Begin a new turn. Called after regroup when the FP player decides
 * to stay, or at game start.
 *
 * Per Comprehensive Rules §2.3.1:
 *   1. Swap FP/Shadow roles
 *   2. Reset per-turn state
 *   3. FP player draws 1 card
 *   4. Enter fellowship phase
 */
export function startTurn(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	// Swap roles (except turn 1 — roles already set by createGameState)
	if (state.turnNumber > 1) {
		const temp = state.fpPlayerId;
		state.fpPlayerId = state.shadowPlayerId;
		state.shadowPlayerId = temp;
	}

	// Reset per-turn state
	state.movesThisTurn = 0;
	state.hasMovedThisTurn = false;
	state.moveLimit = DEFAULT_MOVE_LIMIT;
	state.assignments = [];
	state.currentSkirmishIndex = -1;
	state.fierceRound = false;
	state.consecutivePasses = 0;

	// Reset per-turn modifiers on all cards in play
	resetTurnModifiers(state);

	// Reset player per-turn counters
	for (const p of state.players) {
		p.cardsDrawnThisTurn = 0;
	}

	// FP player draws 1 card at start of turn
	const drawn = drawCards(state, state.fpPlayerId, 1, cardLookup);

	// Enter fellowship phase
	state.phase = 'fellowship';
	state.phaseStep = 'actions';
	state.priorityPlayerId = state.fpPlayerId;

	addLogEntry(state, 'phase_change', null,
		`Turn ${state.turnNumber}: Fellowship phase begins`, {
			turn: state.turnNumber,
			fpPlayer: state.fpPlayerId,
			shadowPlayer: state.shadowPlayerId,
		});

	return {
		transitioned: true,
		newPhase: 'fellowship',
		newStep: 'actions',
		gameOver: false,
		message: `Turn ${state.turnNumber} begins. ${drawn} card(s) drawn.`,
	};
}

// ─── Priority & Pass ────────────────────────────────────────────────

/**
 * Handle a player passing priority.
 *
 * In action windows: both players pass consecutively → phase advances.
 * The pass counter resets whenever someone takes an action.
 */
export function handlePass(
	state: GameState,
	playerId: string,
	cardLookup: Record<string, Card>,
): PhaseResult {
	state.consecutivePasses++;

	addLogEntry(state, 'pass', playerId, 'Pass', {});

	// Both passed → advance
	if (state.consecutivePasses >= 2) {
		return advancePhase(state, cardLookup);
	}

	// Switch priority to the other player
	state.priorityPlayerId = getOpponentId(state, playerId);

	return {
		transitioned: false,
		gameOver: false,
		message: 'Pass — priority switches.',
	};
}

/**
 * Reset the consecutive pass counter. Call after any non-pass action.
 */
export function resetPassCount(state: GameState): void {
	state.consecutivePasses = 0;
}

// ─── Phase Advancement ──────────────────────────────────────────────

/**
 * Advance to the next phase (or sub-step within a phase).
 * This is the core state machine transition.
 */
export function advancePhase(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	state.consecutivePasses = 0;

	switch (state.phase) {
		case 'fellowship':
			return advanceFromFellowship(state, cardLookup);
		case 'shadow':
			return advanceFromShadow(state, cardLookup);
		case 'maneuver':
			return advanceFromManeuver(state, cardLookup);
		case 'archery':
			return advanceFromArchery(state, cardLookup);
		case 'assignment':
			return advanceFromAssignment(state, cardLookup);
		case 'skirmish':
			return advanceFromSkirmish(state, cardLookup);
		case 'regroup':
			return advanceFromRegroup(state, cardLookup);
		default:
			return { transitioned: false, gameOver: false, message: 'Unknown phase.' };
	}
}

// ─── Fellowship Phase ───────────────────────────────────────────────

function advanceFromFellowship(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	// Fellowship phase must end with movement.
	// If the FP player hasn't moved yet, they need to move
	// (movement is handled by moveFellowship, not advancePhase).
	if (!state.hasMovedThisTurn) {
		state.phaseStep = 'movement-decision';
		state.priorityPlayerId = state.fpPlayerId;
		return {
			transitioned: true,
			newPhase: 'fellowship',
			newStep: 'movement-decision',
			gameOver: false,
			message: 'Fellowship must move at least once.',
		};
	}

	// Transition to Shadow phase
	return enterPhase(state, 'shadow', cardLookup);
}

// ─── Shadow Phase ───────────────────────────────────────────────────

function advanceFromShadow(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	// Shadow phase ends when both players pass → maneuver
	return enterPhase(state, 'maneuver', cardLookup);
}

// ─── Maneuver Phase ─────────────────────────────────────────────────

function advanceFromManeuver(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	return enterPhase(state, 'archery', cardLookup);
}

// ─── Archery Phase ──────────────────────────────────────────────────

function advanceFromArchery(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	if (state.phaseStep === 'actions') {
		// After archery actions, calculate archery totals
		return enterArcheryTotals(state, cardLookup);
	}

	if (state.phaseStep === 'archery-totals') {
		// Totals calculated, now FP assigns shadow archery wounds to companions
		const shadowArchery = calculateArcheryTotal(state, 'shadow', cardLookup);
		if (shadowArchery > 0) {
			state.phaseStep = 'archery-assignment';
			state.priorityPlayerId = state.fpPlayerId;
			return {
				transitioned: true,
				newPhase: 'archery',
				newStep: 'archery-assignment',
				gameOver: false,
				message: `FP player: assign ${shadowArchery} archery wounds to companions.`,
			};
		}
		// No shadow archery — skip to assignment phase
		return enterPhase(state, 'assignment', cardLookup);
	}

	if (state.phaseStep === 'archery-assignment') {
		// Assignment of archery wounds is done → move to assignment phase
		return enterPhase(state, 'assignment', cardLookup);
	}

	return enterPhase(state, 'assignment', cardLookup);
}

function enterArcheryTotals(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	const fpArchery = calculateArcheryTotal(state, 'fp', cardLookup);
	const shadowArchery = calculateArcheryTotal(state, 'shadow', cardLookup);

	state.phaseStep = 'archery-totals';

	addLogEntry(state, 'archery', null,
		`Archery totals — FP: ${fpArchery}, Shadow: ${shadowArchery}`, {
			fpArchery,
			shadowArchery,
		});

	// FP archery wounds are assigned to minions by shadow player
	// Shadow archery wounds assigned to companions by FP player
	// For simplicity in Milestone 2, we auto-advance after totals.
	// Full archery wound assignment will be interactive.

	// If no minions in play, skip to assignment phase
	const minions = getMinions(state);
	if (minions.length === 0 && shadowArchery === 0) {
		return enterPhase(state, 'assignment', cardLookup);
	}

	return {
		transitioned: true,
		newPhase: 'archery',
		newStep: 'archery-totals',
		gameOver: false,
		message: `Archery — FP: ${fpArchery}, Shadow: ${shadowArchery}`,
	};
}

// ─── Assignment Phase ───────────────────────────────────────────────

function advanceFromAssignment(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	if (state.phaseStep === 'actions') {
		// After assignment actions, shadow player assigns minions
		const minions = getMinions(state);
		if (minions.length === 0) {
			// No minions → skip to regroup
			return enterPhase(state, 'regroup', cardLookup);
		}
		state.phaseStep = 'assign-minions';
		state.priorityPlayerId = state.shadowPlayerId;
		return {
			transitioned: true,
			newPhase: 'assignment',
			newStep: 'assign-minions',
			gameOver: false,
			message: 'Shadow player: assign minions to companions.',
		};
	}

	if (state.phaseStep === 'assign-minions') {
		// Shadow done assigning → FP assigns unassigned companions as defenders
		state.phaseStep = 'assign-defenders';
		state.priorityPlayerId = state.fpPlayerId;
		return {
			transitioned: true,
			newPhase: 'assignment',
			newStep: 'assign-defenders',
			gameOver: false,
			message: 'FP player: assign defenders to remaining minions.',
		};
	}

	if (state.phaseStep === 'assign-defenders') {
		// All assignments done → enter skirmish
		if (state.assignments.length === 0) {
			// No assignments → skip skirmish, go to regroup
			return enterPhase(state, 'regroup', cardLookup);
		}
		return enterPhase(state, 'skirmish', cardLookup);
	}

	return enterPhase(state, 'skirmish', cardLookup);
}

// ─── Skirmish Phase ─────────────────────────────────────────────────

function advanceFromSkirmish(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	if (state.phaseStep === 'actions') {
		// After skirmish actions, resolve the current skirmish
		state.phaseStep = 'resolve-skirmish';
		return {
			transitioned: true,
			newPhase: 'skirmish',
			newStep: 'resolve-skirmish',
			gameOver: false,
			message: 'Resolving skirmish...',
		};
	}

	if (state.phaseStep === 'resolve-skirmish') {
		// Mark current skirmish resolved
		if (state.currentSkirmishIndex >= 0 &&
				state.currentSkirmishIndex < state.assignments.length) {
			state.assignments[state.currentSkirmishIndex].resolved = true;
		}

		// Find next unresolved non-fierce skirmish
		const nextIdx = findNextSkirmish(state, false);
		if (nextIdx !== -1) {
			state.currentSkirmishIndex = nextIdx;
			state.phaseStep = 'actions';
			state.consecutivePasses = 0;
			state.priorityPlayerId = state.fpPlayerId;

			const skirmish = state.assignments[nextIdx];
			addLogEntry(state, 'skirmish_start', null,
				`Skirmish: companion vs ${skirmish.minionIds.length} minion(s)`, {
					companionId: skirmish.companionId,
					minionIds: skirmish.minionIds,
				});

			return {
				transitioned: true,
				newPhase: 'skirmish',
				newStep: 'actions',
				gameOver: false,
				message: 'Next skirmish — action window.',
			};
		}

		// All normal skirmishes resolved — check for fierce
		if (!state.fierceRound && hasFierceMinions(state, cardLookup)) {
			return enterFierceRound(state, cardLookup);
		}

		// All skirmishes done (including fierce) → regroup
		return enterPhase(state, 'regroup', cardLookup);
	}

	// Fierce skirmish sub-steps
	if (state.phaseStep === 'fierce-assignment') {
		if (state.assignments.some((s) => s.fierce && !s.resolved)) {
			return enterFierceSkirmish(state, cardLookup);
		}
		return enterPhase(state, 'regroup', cardLookup);
	}

	if (state.phaseStep === 'fierce-skirmish') {
		// Resolve fierce skirmish same as normal
		if (state.currentSkirmishIndex >= 0) {
			state.assignments[state.currentSkirmishIndex].resolved = true;
		}

		const nextFierce = findNextSkirmish(state, true);
		if (nextFierce !== -1) {
			state.currentSkirmishIndex = nextFierce;
			state.phaseStep = 'fierce-skirmish';
			state.consecutivePasses = 0;
			state.priorityPlayerId = state.fpPlayerId;
			return {
				transitioned: true,
				newPhase: 'skirmish',
				newStep: 'fierce-skirmish',
				gameOver: false,
				message: 'Next fierce skirmish.',
			};
		}

		return enterPhase(state, 'regroup', cardLookup);
	}

	return enterPhase(state, 'regroup', cardLookup);
}

// ─── Regroup Phase ──────────────────────────────────────────────────

function advanceFromRegroup(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	if (state.phaseStep === 'actions') {
		// After regroup actions → reconcile
		return enterReconcile(state, cardLookup);
	}

	if (state.phaseStep === 'reconcile') {
		// Reconcile done → FP player decides: move again or end turn?
		// Check for victory first
		if (checkFellowshipVictory(state)) {
			return declareWinner(state, state.fpPlayerId, 'fellowship_completed');
		}

		// Can move again?
		if (state.movesThisTurn < state.moveLimit) {
			state.phaseStep = 'fp-regroup-decision';
			state.priorityPlayerId = state.fpPlayerId;
			return {
				transitioned: true,
				newPhase: 'regroup',
				newStep: 'fp-regroup-decision',
				gameOver: false,
				message: 'Move again or stay?',
			};
		}

		// Hit move limit → new turn
		return startNewTurn(state, cardLookup);
	}

	if (state.phaseStep === 'fp-regroup-decision') {
		// Player chose to stay → new turn
		return startNewTurn(state, cardLookup);
	}

	return startNewTurn(state, cardLookup);
}

// ─── Phase Entry ────────────────────────────────────────────────────

/**
 * Enter a new phase. Handles phase-specific setup.
 */
function enterPhase(
	state: GameState,
	phase: GamePhase,
	cardLookup: Record<string, Card>,
): PhaseResult {
	state.phase = phase;
	state.phaseStep = 'actions';
	state.consecutivePasses = 0;

	// Set initial priority based on phase
	switch (phase) {
		case 'fellowship':
			state.priorityPlayerId = state.fpPlayerId;
			break;
		case 'shadow':
			state.priorityPlayerId = state.shadowPlayerId;
			break;
		case 'maneuver':
		case 'archery':
			// FP player has initiative first in these phases
			state.priorityPlayerId = state.fpPlayerId;
			break;
		case 'assignment':
			// Assignment actions: FP player goes first
			state.priorityPlayerId = state.fpPlayerId;
			break;
		case 'skirmish':
			// Set up first skirmish
			state.currentSkirmishIndex = findNextSkirmish(state, false);
			state.priorityPlayerId = state.fpPlayerId;
			if (state.currentSkirmishIndex >= 0) {
				const sk = state.assignments[state.currentSkirmishIndex];
				addLogEntry(state, 'skirmish_start', null,
					`Skirmish begins`, { companionId: sk.companionId, minionIds: sk.minionIds });
			}
			break;
		case 'regroup':
			state.priorityPlayerId = state.fpPlayerId;
			// Discard all minions in shadow area
			discardAllMinions(state);
			// Reset twilight pool
			state.twilightPool = 0;
			break;
	}

	addLogEntry(state, 'phase_change', null, `${formatPhase(phase)} phase`, { phase });

	// Check win conditions after phase entry
	const winResult = checkWinConditions(state, cardLookup);
	if (winResult) return winResult;

	return {
		transitioned: true,
		newPhase: phase,
		newStep: 'actions',
		gameOver: false,
		message: `${formatPhase(phase)} phase — action window.`,
	};
}

// ─── Movement ───────────────────────────────────────────────────────

/**
 * Move the fellowship to the next site.
 *
 * Per Comprehensive Rules §2.3.2.8:
 *   1. FP player plays a site card from their adventure deck (or uses existing)
 *   2. Add twilight tokens: site number + companions in fellowship
 *   3. Increment fellowship position
 *   4. Add 1 burden (per move in Shadows block — simplified for now)
 */
export function moveFellowship(
	state: GameState,
	siteCardId: string,
	cardLookup: Record<string, Card>,
): PhaseResult {
	const nextPosition = state.fellowshipPosition + 1;

	if (nextPosition > FINAL_SITE) {
		return {
			transitioned: false,
			gameOver: false,
			message: 'Cannot move beyond site 9.',
		};
	}

	// Place site card on adventure path
	const siteCard = getCard(state, siteCardId);
	siteCard.zone = 'adventure_path';
	siteCard.siteNumber = nextPosition;
	state.adventurePath[nextPosition - 1] = siteCardId;

	// Calculate twilight tokens to add
	const siteDef = getCardDef(siteCard, cardLookup);
	const siteTwilight = siteDef.twilight ?? 0;
	const companionCount = getCompanions(state).length;
	const twilightToAdd = siteTwilight + companionCount;

	state.twilightPool += twilightToAdd;
	state.fellowshipPosition = nextPosition;
	state.movesThisTurn++;
	state.hasMovedThisTurn = true;

	addLogEntry(state, 'movement', state.fpPlayerId,
		`Fellowship moves to site ${nextPosition}. +${twilightToAdd} twilight.`, {
			site: nextPosition,
			siteCardId,
			twilightAdded: twilightToAdd,
			siteTwilight,
			companionCount,
		});

	addLogEntry(state, 'twilight_add', null,
		`+${twilightToAdd} twilight (site ${siteTwilight} + ${companionCount} companions)`, {
			amount: twilightToAdd,
			newTotal: state.twilightPool,
		});

	// Check corruption after burden changes
	const winResult = checkWinConditions(state, cardLookup);
	if (winResult) return winResult;

	// After movement → transition to shadow phase
	return enterPhase(state, 'shadow', cardLookup);
}

/**
 * Handle FP player choosing to move again (from regroup decision).
 * Re-enters fellowship phase for another movement.
 */
export function moveAgain(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	state.phase = 'fellowship';
	state.phaseStep = 'movement-decision';
	state.consecutivePasses = 0;
	state.priorityPlayerId = state.fpPlayerId;

	// Reset assignments for next site
	state.assignments = [];
	state.currentSkirmishIndex = -1;
	state.fierceRound = false;

	addLogEntry(state, 'phase_change', state.fpPlayerId,
		'Fellowship chooses to move again.', {});

	return {
		transitioned: true,
		newPhase: 'fellowship',
		newStep: 'movement-decision',
		gameOver: false,
		message: 'Moving again — play a site card.',
	};
}

// ─── Skirmish Resolution ────────────────────────────────────────────

/**
 * Resolve the current skirmish by comparing strength totals.
 *
 * Per Comprehensive Rules §2.3.7.2:
 *   - Compare companion strength vs total minion strength
 *   - Loser takes wounds = difference (minimum 0 since they still lose)
 *   - If companion overwhelmed (enemy >= 2x), killed outright
 */
export function resolveCurrentSkirmish(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	const skirmish = state.assignments[state.currentSkirmishIndex];
	if (!skirmish) {
		return { transitioned: false, gameOver: false, message: 'No active skirmish.' };
	}

	const companion = getCard(state, skirmish.companionId);
	const companionStrength = getEffectiveStrength(state, companion.id, cardLookup);

	let totalMinionStrength = 0;
	for (const minionId of skirmish.minionIds) {
		totalMinionStrength += getEffectiveStrength(state, minionId, cardLookup);
	}

	const logData: Record<string, unknown> = {
		companionId: companion.id,
		companionStrength,
		minionIds: skirmish.minionIds,
		totalMinionStrength,
	};

	// Check overwhelm
	if (isOverwhelmed(companionStrength, totalMinionStrength)) {
		killCharacter(state, companion.id, cardLookup);
		addLogEntry(state, 'overwhelmed', null,
			`Companion overwhelmed! (${companionStrength} vs ${totalMinionStrength})`,
			logData);
	} else if (totalMinionStrength > companionStrength) {
		// Companion loses — take wounds
		const wounds = totalMinionStrength - companionStrength;

		// Apply damage bonus from minions
		let damageBonus = 0;
		for (const minionId of skirmish.minionIds) {
			const minion = getCard(state, minionId);
			const keywords = getCardDef(minion, cardLookup).keywords;
			for (const kw of keywords) {
				const dmgMatch = kw.match(/Damage\s*\+(\d+)/i);
				if (dmgMatch) damageBonus += parseInt(dmgMatch[1], 10);
			}
		}

		const totalWounds = wounds + damageBonus;
		woundCharacter(state, companion.id, totalWounds, cardLookup);

		addLogEntry(state, 'skirmish_resolve', null,
			`Companion loses skirmish: ${totalWounds} wound(s). (${companionStrength} vs ${totalMinionStrength})`,
			{ ...logData, wounds: totalWounds, damageBonus });
	} else if (companionStrength > totalMinionStrength) {
		// Companion wins — minions take wounds
		const wounds = companionStrength - totalMinionStrength;

		// Apply damage bonus from companion
		const compKeywords = getCardDef(companion, cardLookup).keywords;
		let damageBonus = 0;
		for (const kw of compKeywords) {
			const dmgMatch = kw.match(/Damage\s*\+(\d+)/i);
			if (dmgMatch) damageBonus += parseInt(dmgMatch[1], 10);
		}

		const totalWounds = wounds + damageBonus;

		// Distribute wounds across minions (FP player's choice in full rules;
		// for Milestone 2, spread evenly)
		distributeWoundsToMinions(state, skirmish.minionIds, totalWounds, cardLookup);

		addLogEntry(state, 'skirmish_resolve', null,
			`Companion wins skirmish: ${totalWounds} wound(s) to minion(s). (${companionStrength} vs ${totalMinionStrength})`,
			{ ...logData, wounds: totalWounds, damageBonus });
	} else {
		// Tie — no wounds
		addLogEntry(state, 'skirmish_resolve', null,
			`Skirmish tied at ${companionStrength}. No wounds.`, logData);
	}

	skirmish.resolved = true;

	// Check win conditions after combat
	const winResult = checkWinConditions(state, cardLookup);
	if (winResult) return winResult;

	return advanceFromSkirmish(state, cardLookup);
}

// ─── Fierce Round ───────────────────────────────────────────────────

function hasFierceMinions(
	state: GameState,
	cardLookup: Record<string, Card>,
): boolean {
	const minions = getMinions(state);
	return minions.some((m) => hasKeyword(m, 'fierce', cardLookup));
}

function enterFierceRound(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	state.fierceRound = true;
	state.phaseStep = 'fierce-assignment';
	state.priorityPlayerId = state.shadowPlayerId;

	addLogEntry(state, 'phase_change', null, 'Fierce round — assignment', {});

	return {
		transitioned: true,
		newPhase: 'skirmish',
		newStep: 'fierce-assignment',
		gameOver: false,
		message: 'Fierce round — Shadow player assigns fierce minions.',
	};
}

function enterFierceSkirmish(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	const nextFierce = findNextSkirmish(state, true);
	if (nextFierce === -1) {
		return enterPhase(state, 'regroup', cardLookup);
	}

	state.currentSkirmishIndex = nextFierce;
	state.phaseStep = 'fierce-skirmish';
	state.consecutivePasses = 0;
	state.priorityPlayerId = state.fpPlayerId;

	return {
		transitioned: true,
		newPhase: 'skirmish',
		newStep: 'fierce-skirmish',
		gameOver: false,
		message: 'Fierce skirmish — action window.',
	};
}

// ─── Reconcile ──────────────────────────────────────────────────────

function enterReconcile(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	// Shadow player must discard down to 8 cards
	const shadowHand = getHand(state, state.shadowPlayerId);

	if (shadowHand.length > RECONCILE_HAND_LIMIT) {
		state.phaseStep = 'reconcile';
		state.priorityPlayerId = state.shadowPlayerId;
		return {
			transitioned: true,
			newPhase: 'regroup',
			newStep: 'reconcile',
			gameOver: false,
			message: `Shadow player: discard to ${RECONCILE_HAND_LIMIT} cards (have ${shadowHand.length}).`,
		};
	}

	// FP player reconciles too
	const fpHand = getHand(state, state.fpPlayerId);
	if (fpHand.length > RECONCILE_HAND_LIMIT) {
		state.phaseStep = 'reconcile';
		state.priorityPlayerId = state.fpPlayerId;
		return {
			transitioned: true,
			newPhase: 'regroup',
			newStep: 'reconcile',
			gameOver: false,
			message: `FP player: discard to ${RECONCILE_HAND_LIMIT} cards (have ${fpHand.length}).`,
		};
	}

	// No reconcile needed → regroup decision
	if (checkFellowshipVictory(state)) {
		return declareWinner(state, state.fpPlayerId, 'fellowship_completed');
	}

	if (state.movesThisTurn < state.moveLimit) {
		state.phaseStep = 'fp-regroup-decision';
		state.priorityPlayerId = state.fpPlayerId;
		return {
			transitioned: true,
			newPhase: 'regroup',
			newStep: 'fp-regroup-decision',
			gameOver: false,
			message: 'Move again or stay?',
		};
	}

	return startNewTurn(state, cardLookup);
}

// ─── New Turn ───────────────────────────────────────────────────────

function startNewTurn(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult {
	state.turnNumber++;
	return startTurn(state, cardLookup);
}

// ─── Combat Helpers ─────────────────────────────────────────────────

/**
 * Calculate archery total for one side.
 * Count archers: each character with Archer keyword contributes 1.
 */
export function calculateArcheryTotal(
	state: GameState,
	side: 'fp' | 'shadow',
	cardLookup: Record<string, Card>,
): number {
	const characters = side === 'fp' ? getCompanions(state) : getMinions(state);
	let total = 0;

	for (const char of characters) {
		if (hasKeyword(char, 'archer', cardLookup)) {
			total++;
		}
	}

	return total;
}

/**
 * Wound a character. If wounds >= vitality, kill them.
 */
export function woundCharacter(
	state: GameState,
	cardId: string,
	wounds: number,
	cardLookup: Record<string, Card>,
): void {
	const card = getCard(state, cardId);
	card.wounds += wounds;

	addLogEntry(state, 'wound', null,
		`${wounds} wound(s) placed`, { cardId, newWounds: card.wounds });

	const vitality = getEffectiveVitality(state, cardId, cardLookup);
	if (card.wounds >= vitality) {
		killCharacter(state, cardId, cardLookup);
	}
}

/**
 * Kill a character and move them to dead pile (companions) or discard (minions).
 */
export function killCharacter(
	state: GameState,
	cardId: string,
	cardLookup: Record<string, Card>,
): void {
	const card = getCard(state, cardId);
	const def = getCardDef(card, cardLookup);

	// Remove attachments → discard pile
	for (const attachId of [...card.attachments]) {
		const attach = getCard(state, attachId);
		attach.zone = 'discard_pile';
		attach.attachedTo = null;
	}
	card.attachments = [];

	if (def.type === 'Companion' || def.type === 'Ally') {
		card.zone = 'dead_pile';
		addLogEntry(state, 'killed', null, `${def.title} killed`, { cardId });

		// If Ring-bearer is killed, game over
		if (card.isRingBearer) {
			state.winner = state.shadowPlayerId;
			state.winReason = 'ring_bearer_killed';
			addLogEntry(state, 'game_over', null,
				'Ring-bearer killed — Shadow wins!', { winner: state.shadowPlayerId });
		}
	} else if (def.type === 'Minion') {
		card.zone = 'discard_pile';
		addLogEntry(state, 'killed', null, `${def.title} destroyed`, { cardId });
	}

	card.wounds = 0;
	card.strengthModifier = 0;
	card.vitalityModifier = 0;
}

/**
 * Distribute wounds evenly across minions, killing any that die.
 */
function distributeWoundsToMinions(
	state: GameState,
	minionIds: string[],
	totalWounds: number,
	cardLookup: Record<string, Card>,
): void {
	let remaining = totalWounds;
	let alive = minionIds.filter((id) => getCard(state, id).zone === 'shadow_area');

	while (remaining > 0 && alive.length > 0) {
		for (const id of [...alive]) {
			if (remaining <= 0) break;
			woundCharacter(state, id, 1, cardLookup);
			remaining--;
		}
		alive = minionIds.filter((id) => getCard(state, id).zone === 'shadow_area');
	}
}

/**
 * Discard all minions from the shadow area (at start of regroup).
 */
function discardAllMinions(state: GameState): void {
	const minions = getMinions(state);
	for (const minion of minions) {
		// Remove attachments
		for (const attachId of [...minion.attachments]) {
			const attach = getCard(state, attachId);
			attach.zone = 'discard_pile';
			attach.attachedTo = null;
		}
		minion.attachments = [];
		minion.zone = 'discard_pile';
		minion.wounds = 0;
		minion.strengthModifier = 0;
		minion.vitalityModifier = 0;
	}
}

// ─── Card Draw ──────────────────────────────────────────────────────

/**
 * Draw cards from a player's draw deck into their hand.
 * Returns the number actually drawn (may be less if deck runs out).
 */
export function drawCards(
	state: GameState,
	playerId: string,
	count: number,
	cardLookup: Record<string, Card>,
): number {
	const drawDeck = getDrawDeck(state, playerId);
	const toDraw = Math.min(count, drawDeck.length);

	for (let i = 0; i < toDraw; i++) {
		drawDeck[i].zone = 'hand';
	}

	const player = state.players.find((p) => p.id === playerId)!;
	player.cardsDrawnThisTurn += toDraw;

	if (toDraw > 0) {
		addLogEntry(state, 'draw', playerId, `Draws ${toDraw} card(s)`, { count: toDraw });
	}

	return toDraw;
}

// ─── Modifier Reset ─────────────────────────────────────────────────

/**
 * Reset all per-turn temporary modifiers on cards in play.
 */
function resetTurnModifiers(state: GameState): void {
	for (const card of Object.values(state.cards)) {
		if (card.zone === 'fellowship_area' || card.zone === 'shadow_area' ||
				card.zone === 'support_area' || card.zone === 'attached') {
			card.strengthModifier = 0;
			card.vitalityModifier = 0;
			card.resistanceModifier = 0;
			card.addedKeywords = [];
			card.removedKeywords = [];
		}
	}
}

// ─── Win Conditions ─────────────────────────────────────────────────

function checkWinConditions(
	state: GameState,
	cardLookup: Record<string, Card>,
): PhaseResult | null {
	if (state.winner) return null; // Already decided

	// Check Ring-bearer corruption
	if (checkCorruption(state, cardLookup)) {
		return declareWinner(state, state.shadowPlayerId, 'ring_bearer_corruption');
	}

	// Check Ring-bearer killed (handled in killCharacter, but double-check)
	const rb = getRingBearer(state);
	if (rb.zone === 'dead_pile') {
		return declareWinner(state, state.shadowPlayerId, 'ring_bearer_killed');
	}

	return null;
}

function declareWinner(
	state: GameState,
	winnerId: string,
	reason: GameState['winReason'],
): PhaseResult {
	state.winner = winnerId;
	state.winReason = reason;

	addLogEntry(state, 'game_over', null,
		`Game over — ${reason}. Winner: ${winnerId}`, { winner: winnerId, reason });

	return {
		transitioned: true,
		gameOver: true,
		message: `Game over: ${formatWinReason(reason!)}`,
	};
}

// ─── Skirmish Helpers ───────────────────────────────────────────────

function findNextSkirmish(state: GameState, fierce: boolean): number {
	return state.assignments.findIndex(
		(s) => !s.resolved && s.fierce === fierce,
	);
}

// ─── Assignment Helpers ─────────────────────────────────────────────

/**
 * Assign a minion to a companion for skirmish.
 * Called during assignment phase by the shadow player.
 */
export function assignMinion(
	state: GameState,
	minionId: string,
	companionId: string,
	fierce: boolean = false,
): void {
	// Check if this companion already has an assignment
	let existing = state.assignments.find(
		(s) => s.companionId === companionId && s.fierce === fierce,
	);

	if (existing) {
		// Add minion to existing skirmish
		if (!existing.minionIds.includes(minionId)) {
			existing.minionIds.push(minionId);
		}
	} else {
		state.assignments.push({
			companionId,
			minionIds: [minionId],
			resolved: false,
			fierce,
		});
	}

	addLogEntry(state, 'assignment', state.shadowPlayerId,
		'Minion assigned to companion', { minionId, companionId, fierce });
}

// ─── Formatting ─────────────────────────────────────────────────────

function formatPhase(phase: GamePhase): string {
	return phase.charAt(0).toUpperCase() + phase.slice(1);
}

function formatWinReason(reason: string): string {
	const map: Record<string, string> = {
		ring_bearer_corruption: 'Ring-bearer corrupted',
		ring_bearer_killed: 'Ring-bearer killed',
		fellowship_completed: 'Fellowship reached the end',
		fp_deck_exhausted: 'Free Peoples deck exhausted',
		shadow_deck_exhausted: 'Shadow deck exhausted',
		concession: 'Player conceded',
	};
	return map[reason] || reason;
}

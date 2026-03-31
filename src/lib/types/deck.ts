/**
 * Deck type definitions for LOTR TCG.
 */

import type { CardSummary } from './card.js';

export interface DeckEntry {
	card: CardSummary;
	count: number;
}

export interface Deck {
	/** Deck name */
	name: string;

	/** Ring-bearer card (required, exactly 1) */
	ringBearer: CardSummary | null;

	/** The One Ring card (required, exactly 1) */
	oneRing: CardSummary | null;

	/** Free Peoples cards (companions, allies, FP possessions/conditions/events) */
	freePeoples: DeckEntry[];

	/** Shadow cards (minions, shadow possessions/conditions/events) */
	shadow: DeckEntry[];

	/** Adventure deck (up to 9 site cards) */
	adventure: CardSummary[];

	/** Format: 'expanded' (all 19 sets) is the only supported format for now */
	format: 'expanded';

	/** Creation timestamp */
	createdAt: string;

	/** Last modified timestamp */
	modifiedAt: string;
}

/**
 * Deck validation rules for LOTR TCG Expanded format.
 */
export const DECK_RULES = {
	/** Minimum cards in Free Peoples draw deck */
	MIN_FP_CARDS: 30,

	/** Minimum cards in Shadow draw deck */
	MIN_SHADOW_CARDS: 30,

	/** Maximum copies of any non-unique card */
	MAX_COPIES: 4,

	/** Unique cards: max 1 copy per unique card */
	MAX_UNIQUE_COPIES: 1,

	/** Adventure deck: exactly 9 sites */
	ADVENTURE_DECK_SIZE: 9,

	/** Must have exactly 1 Ring-bearer */
	RING_BEARER_COUNT: 1,

	/** Must have exactly 1 The One Ring */
	ONE_RING_COUNT: 1,
} as const;

export interface DeckValidationError {
	section: 'ringBearer' | 'oneRing' | 'freePeoples' | 'shadow' | 'adventure' | 'general';
	message: string;
	severity: 'error' | 'warning';
}

export function createEmptyDeck(name: string = 'New Deck'): Deck {
	return {
		name,
		ringBearer: null,
		oneRing: null,
		freePeoples: [],
		shadow: [],
		adventure: [],
		format: 'expanded',
		createdAt: new Date().toISOString(),
		modifiedAt: new Date().toISOString(),
	};
}

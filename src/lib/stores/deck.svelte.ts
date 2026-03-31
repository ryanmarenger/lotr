/**
 * Deck builder reactive state.
 * Uses Svelte 5 runes ($state) for fine-grained reactivity.
 */

import type { CardSummary } from '$lib/types/card.js';
import type { Deck, DeckEntry, DeckValidationError } from '$lib/types/deck.js';
import { createEmptyDeck, DECK_RULES } from '$lib/types/deck.js';

// ── State ──

let deck = $state<Deck>(createEmptyDeck());

// ── Derived stats ──

const fpCount = $derived(deck.freePeoples.reduce((sum, e) => sum + e.count, 0));
const shadowCount = $derived(deck.shadow.reduce((sum, e) => sum + e.count, 0));
const adventureCount = $derived(deck.adventure.length);
const totalCount = $derived(
	fpCount + shadowCount + adventureCount +
	(deck.ringBearer ? 1 : 0) + (deck.oneRing ? 1 : 0)
);

// ── Validation ──

const errors = $derived.by((): DeckValidationError[] => {
	const errs: DeckValidationError[] = [];

	if (!deck.ringBearer) {
		errs.push({ section: 'ringBearer', message: 'Ring-bearer required', severity: 'error' });
	}
	if (!deck.oneRing) {
		errs.push({ section: 'oneRing', message: 'The One Ring required', severity: 'error' });
	}
	if (fpCount < DECK_RULES.MIN_FP_CARDS) {
		errs.push({
			section: 'freePeoples',
			message: `Free Peoples deck needs ${DECK_RULES.MIN_FP_CARDS - fpCount} more cards (${fpCount}/${DECK_RULES.MIN_FP_CARDS})`,
			severity: fpCount === 0 ? 'warning' : 'error',
		});
	}
	if (shadowCount < DECK_RULES.MIN_SHADOW_CARDS) {
		errs.push({
			section: 'shadow',
			message: `Shadow deck needs ${DECK_RULES.MIN_SHADOW_CARDS - shadowCount} more cards (${shadowCount}/${DECK_RULES.MIN_SHADOW_CARDS})`,
			severity: shadowCount === 0 ? 'warning' : 'error',
		});
	}
	if (adventureCount !== DECK_RULES.ADVENTURE_DECK_SIZE) {
		errs.push({
			section: 'adventure',
			message: `Adventure deck needs ${DECK_RULES.ADVENTURE_DECK_SIZE - adventureCount} more sites (${adventureCount}/${DECK_RULES.ADVENTURE_DECK_SIZE})`,
			severity: adventureCount === 0 ? 'warning' : 'error',
		});
	}

	return errs;
});

const isValid = $derived(errors.length === 0);

// ── Actions ──

function addCard(card: CardSummary): string | null {
	deck.modifiedAt = new Date().toISOString();

	// Ring-bearer: companions with resistance (Ring-bearer keyword in gametext)
	if (card.type === 'Companion' && card.resistance !== undefined &&
		card.gametext.toLowerCase().includes('ring-bearer')) {
		if (deck.ringBearer) return 'Ring-bearer already set. Remove current one first.';
		deck.ringBearer = card;
		return null;
	}

	// The One Ring
	if (card.type === 'The One Ring') {
		if (deck.oneRing) return 'The One Ring already set. Remove current one first.';
		deck.oneRing = card;
		return null;
	}

	// Site cards → adventure deck
	if (card.type === 'Site') {
		if (deck.adventure.length >= DECK_RULES.ADVENTURE_DECK_SIZE) {
			return `Adventure deck full (${DECK_RULES.ADVENTURE_DECK_SIZE} sites max)`;
		}
		deck.adventure = [...deck.adventure, card];
		return null;
	}

	// Determine which deck section
	const isFP = card.side === 'Free Peoples';
	const isShadow = card.side === 'Shadow';

	if (!isFP && !isShadow) {
		return `Cannot determine deck section for ${card.title}`;
	}

	const section = isFP ? 'freePeoples' : 'shadow';
	const entries = deck[section];

	// Check for existing entry
	const existing = entries.find(e => e.card.blueprintId === card.blueprintId);

	if (existing) {
		const maxCopies = card.unique ? DECK_RULES.MAX_UNIQUE_COPIES : DECK_RULES.MAX_COPIES;
		if (existing.count >= maxCopies) {
			return card.unique
				? `${card.title} is unique — only 1 copy allowed`
				: `Maximum ${maxCopies} copies of ${card.title}`;
		}
		existing.count++;
	} else {
		entries.push({ card, count: 1 });
	}

	// Trigger reactivity by reassigning
	deck[section] = [...entries];
	return null;
}

function removeCard(blueprintId: string, section: 'ringBearer' | 'oneRing' | 'freePeoples' | 'shadow' | 'adventure') {
	deck.modifiedAt = new Date().toISOString();

	if (section === 'ringBearer') {
		deck.ringBearer = null;
		return;
	}
	if (section === 'oneRing') {
		deck.oneRing = null;
		return;
	}
	if (section === 'adventure') {
		const idx = deck.adventure.findIndex(c => c.blueprintId === blueprintId);
		if (idx !== -1) {
			deck.adventure = deck.adventure.filter((_, i) => i !== idx);
		}
		return;
	}

	const entries = deck[section];
	const existing = entries.find(e => e.card.blueprintId === blueprintId);
	if (existing) {
		existing.count--;
		if (existing.count <= 0) {
			deck[section] = entries.filter(e => e.card.blueprintId !== blueprintId);
		} else {
			deck[section] = [...entries];
		}
	}
}

function clearDeck() {
	const name = deck.name;
	Object.assign(deck, createEmptyDeck(name));
}

function setDeckName(name: string) {
	deck.name = name;
	deck.modifiedAt = new Date().toISOString();
}

function exportDeck(): string {
	return JSON.stringify(deck, null, 2);
}

function importDeck(json: string): string | null {
	try {
		const data = JSON.parse(json) as Deck;
		if (!data.name || !data.format) return 'Invalid deck file';
		Object.assign(deck, data);
		return null;
	} catch {
		return 'Failed to parse deck file';
	}
}

// ── Exports ──

export function useDeck() {
	return {
		get deck() { return deck; },
		get fpCount() { return fpCount; },
		get shadowCount() { return shadowCount; },
		get adventureCount() { return adventureCount; },
		get totalCount() { return totalCount; },
		get errors() { return errors; },
		get isValid() { return isValid; },
		addCard,
		removeCard,
		clearDeck,
		setDeckName,
		exportDeck,
		importDeck,
	};
}

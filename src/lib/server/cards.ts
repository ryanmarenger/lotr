/**
 * Server-side card data loader.
 * Loads the full card database into memory on first access.
 * Cards are static data — loading once is efficient and enables fast search.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Card, CardSummary } from '$lib/types/card.js';

let _cards: Card[] | null = null;
let _summaries: CardSummary[] | null = null;

function loadCards(): Card[] {
	if (!_cards) {
		const data = readFileSync(resolve('data/cards/all-cards.json'), 'utf-8');
		_cards = JSON.parse(data);
	}
	return _cards!;
}

function loadSummaries(): CardSummary[] {
	if (!_summaries) {
		const data = readFileSync(resolve('data/cards/all-cards-summary.json'), 'utf-8');
		_summaries = JSON.parse(data);
	}
	return _summaries!;
}

export interface CardSearchParams {
	query?: string;
	culture?: string;
	type?: string;
	side?: string;
	set?: number;
	minTwilight?: number;
	maxTwilight?: number;
	keyword?: string;
	rarity?: string;
	race?: string;
	page?: number;
	pageSize?: number;
}

export interface CardSearchResult {
	cards: CardSummary[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

/**
 * Search and filter cards. Returns summaries (no effects blob) for efficiency.
 */
export function searchCards(params: CardSearchParams): CardSearchResult {
	const summaries = loadSummaries();
	const page = params.page || 1;
	const pageSize = params.pageSize || 60;

	let filtered = summaries;

	// Text search — matches title, subtitle, gametext
	if (params.query) {
		const q = params.query.toLowerCase();
		filtered = filtered.filter(c =>
			c.title.toLowerCase().includes(q) ||
			(c.subtitle?.toLowerCase().includes(q)) ||
			c.gametext.toLowerCase().includes(q)
		);
	}

	// Culture filter
	if (params.culture) {
		const culture = params.culture;
		filtered = filtered.filter(c => c.culture === culture);
	}

	// Type filter
	if (params.type) {
		const type = params.type;
		filtered = filtered.filter(c => c.type === type);
	}

	// Side filter
	if (params.side) {
		const side = params.side;
		filtered = filtered.filter(c => c.side === side);
	}

	// Set filter
	if (params.set !== undefined) {
		filtered = filtered.filter(c => c.setNumber === params.set);
	}

	// Twilight cost range
	if (params.minTwilight !== undefined) {
		filtered = filtered.filter(c => c.twilight >= params.minTwilight!);
	}
	if (params.maxTwilight !== undefined) {
		filtered = filtered.filter(c => c.twilight <= params.maxTwilight!);
	}

	// Keyword filter
	if (params.keyword) {
		const kw = params.keyword.toLowerCase();
		filtered = filtered.filter(c => c.keywords.some(k => k.toLowerCase().includes(kw)));
	}

	// Rarity filter
	if (params.rarity) {
		filtered = filtered.filter(c => c.rarity === params.rarity);
	}

	// Race filter
	if (params.race) {
		const race = params.race.toLowerCase();
		filtered = filtered.filter(c => c.race?.toLowerCase() === race);
	}

	const total = filtered.length;
	const totalPages = Math.ceil(total / pageSize);
	const start = (page - 1) * pageSize;
	const cards = filtered.slice(start, start + pageSize);

	return { cards, total, page, pageSize, totalPages };
}

/**
 * Get a single card by blueprint ID (full card with effects).
 */
export function getCard(blueprintId: string): Card | undefined {
	return loadCards().find(c => c.blueprintId === blueprintId);
}

/**
 * Get all unique values for a field (for filter dropdowns).
 */
export function getDistinctValues(field: 'culture' | 'type' | 'race' | 'rarity' | 'keywords'): string[] {
	const summaries = loadSummaries();
	const values = new Set<string>();

	for (const card of summaries) {
		if (field === 'keywords') {
			card.keywords.forEach(k => values.add(k));
		} else {
			const val = card[field];
			if (val) values.add(String(val));
		}
	}

	return [...values].sort();
}

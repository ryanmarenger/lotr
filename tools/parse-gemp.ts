/**
 * GEMP HJSON → Typed JSON Card Parser
 *
 * Reads all official HJSON card definitions from the GEMP repository
 * and outputs normalized, typed JSON files organized by set.
 *
 * Usage: npm run parse-cards
 * Output: data/cards/set{NN}.json + data/cards/all-cards.json
 */

import * as fs from 'fs';
import * as path from 'path';
import hjson from 'hjson';
import type { Card, CardSide, CardType, CardCulture, CardRarity, SiteBlock, SiteDirection } from '../src/lib/types/card.js';

// ── Paths ──

const GEMP_CARDS_DIR = path.resolve('gemp-raw/gemp-lotr/gemp-lotr-cards/src/main/resources/cards/official');
const OUTPUT_DIR = path.resolve('data/cards');

// ── Culture normalization ──

const CULTURE_MAP: Record<string, CardCulture> = {
	'dwarven': 'Dwarven',
	'elven': 'Elven',
	'gandalf': 'Gandalf',
	'gondor': 'Gondor',
	'rohan': 'Rohan',
	'shire': 'Shire',
	'dunland': 'Dunland',
	'gollum': 'Gollum',
	'isengard': 'Isengard',
	'moria': 'Moria',
	'raider': 'Raider',
	'sauron': 'Sauron',
	'ringwraith': 'Ringwraith',
	'orc': 'Orc',
	'uruk-hai': 'Uruk-hai',
	'men': 'Men',
	// Alternate keys from GEMP
	'uruk_hai': 'Uruk-hai',
	'wraith': 'Ringwraith',
};

// ── Type normalization ──

const TYPE_MAP: Record<string, CardType> = {
	'companion': 'Companion',
	'ally': 'Ally',
	'minion': 'Minion',
	'event': 'Event',
	'condition': 'Condition',
	'possession': 'Possession',
	'artifact': 'Artifact',
	'site': 'Site',
	'the one ring': 'The One Ring',
	'one ring': 'The One Ring',
	'follower': 'Follower',
};

// ── Rarity normalization ──

const RARITY_MAP: Record<string, CardRarity> = {
	'c': 'C',
	'u': 'U',
	'r': 'R',
	's': 'S',
	'p': 'P',
	'x': 'X',
	'rf': 'RF',
	'o': 'O',
};

// ── Block normalization ──

const BLOCK_MAP: Record<string, SiteBlock> = {
	'fellowship': 'Fellowship',
	'towers': 'Towers',
	'king': 'King',
	'shadows': 'Shadows',
};

// ── Keyword extraction ──

function extractKeywords(raw: unknown): string[] {
	if (!raw) return [];
	if (typeof raw === 'string') {
		return raw.split(',').map(k => k.trim()).filter(Boolean);
	}
	if (Array.isArray(raw)) {
		return raw.map(String).filter(Boolean);
	}
	return [];
}

// ── Rarity from collInfo ──

function parseRarity(collInfo: string): CardRarity {
	// collInfo format: "1R284", "1C3", "11U28", "1RF13", etc.
	// The rarity letter(s) are between the set digits and the card digits
	const match = collInfo.match(/^\d+([A-Z]+)\d+/);
	if (match) {
		const key = match[1].toLowerCase();
		return RARITY_MAP[key] || 'C';
	}
	return 'C';
}

// ── Parse a single card entry ──

function parseCard(blueprintId: string, raw: Record<string, unknown>): Card | null {
	try {
		const cardInfo = (raw.cardInfo || {}) as Record<string, unknown>;
		const collInfo = (cardInfo.collInfo as string) || '';
		const rarity = (cardInfo.rarity as string) || '';

		// Skip errata/alt cards (they have a parent reference)
		if (cardInfo.parent) return null;

		// Parse set and card numbers from blueprintId (e.g., "1_284" → set 1, card 284)
		const idParts = blueprintId.split('_');
		const setNumber = parseInt(idParts[0], 10);
		const cardNumber = parseInt(idParts[1], 10);

		if (isNaN(setNumber) || isNaN(cardNumber)) return null;

		// Image path
		const imagePath = (cardInfo.image as string) || (cardInfo.imagePath as string) || '';

		// Type
		const rawType = ((raw.type as string) || '').toLowerCase();
		const type = TYPE_MAP[rawType];
		if (!type) {
			console.warn(`  Unknown type "${raw.type}" on ${blueprintId}`);
			return null;
		}

		// Culture
		const rawCulture = ((raw.culture as string) || '').toLowerCase();
		const culture = CULTURE_MAP[rawCulture] || undefined;

		// Side
		const rawSide = raw.side as string | undefined;
		let side: CardSide | undefined;
		if (rawSide === 'Free Peoples' || rawSide === 'Free peoples') side = 'Free Peoples';
		else if (rawSide === 'Shadow') side = 'Shadow';

		// Keywords — can come from `keywords` field or be embedded in type/gametext
		const keywords = extractKeywords(raw.keywords);

		// Site-specific fields
		let siteBlock: SiteBlock | undefined;
		let siteDirection: SiteDirection | undefined;
		if (raw.block) {
			const blockKey = (raw.block as string).toLowerCase();
			siteBlock = BLOCK_MAP[blockKey];
		}
		if (raw.direction) {
			const dir = (raw.direction as string).toLowerCase();
			siteDirection = dir === 'left' ? 'Left' : dir === 'right' ? 'Right' : undefined;
		}

		// Check for errata
		const alts = raw.alts as Record<string, unknown> | undefined;
		const hasErrata = !!(alts?.errata && typeof alts.errata === 'object' && Object.keys(alts.errata as object).length > 0);

		const card: Card = {
			blueprintId,
			collInfo,
			setNumber,
			cardNumber,
			title: (raw.title as string) || 'Unknown',
			unique: raw.unique === true,
			twilight: typeof raw.twilight === 'number' ? raw.twilight : parseInt(String(raw.twilight || '0'), 10),
			type,
			rarity: RARITY_MAP[rarity.toLowerCase()] || parseRarity(collInfo),
			keywords,
			gametext: (raw.gametext as string) || '',
			lore: (raw.lore as string) || '',
			effects: raw.effects || null,
			imagePath,
			hasErrata,
		};

		// Optional fields — only include if present
		if (raw.subtitle) card.subtitle = raw.subtitle as string;
		if (side) card.side = side;
		if (culture) card.culture = culture;
		if (raw.race) card.race = raw.race as string;
		if (typeof raw.strength === 'number') card.strength = raw.strength;
		if (typeof raw.vitality === 'number') card.vitality = raw.vitality;
		if (typeof raw.resistance === 'number') card.resistance = raw.resistance;
		if (typeof raw.site === 'number') card.siteNumber = raw.site;
		if (siteBlock) card.siteBlock = siteBlock;
		if (siteDirection) card.siteDirection = siteDirection;
		if (raw.allyHome) card.allyHome = raw.allyHome as string;
		if (raw.timewords) card.timeword = raw.timewords as string;
		if (raw.itemclass) card.itemClass = raw.itemclass as string;
		if (raw.target) card.target = raw.target as string;
		if (raw.signet) card.signet = raw.signet as string;

		return card;
	} catch (err) {
		console.error(`  Error parsing ${blueprintId}:`, err);
		return null;
	}
}

// ── Main ──

function main() {
	console.log('GEMP HJSON → JSON Card Parser');
	console.log('=============================\n');

	// Ensure output directory exists
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	// Find all set directories
	const setDirs = fs.readdirSync(GEMP_CARDS_DIR)
		.filter(d => d.startsWith('set'))
		.sort((a, b) => {
			const na = parseInt(a.replace('set', ''), 10);
			const nb = parseInt(b.replace('set', ''), 10);
			return na - nb;
		});

	console.log(`Found ${setDirs.length} sets\n`);

	const allCards: Card[] = [];
	const stats = {
		totalFiles: 0,
		totalCards: 0,
		skipped: 0,
		errors: 0,
		byType: {} as Record<string, number>,
		byCulture: {} as Record<string, number>,
		bySet: {} as Record<number, number>,
	};

	for (const setDir of setDirs) {
		const setPath = path.join(GEMP_CARDS_DIR, setDir);
		const hjsonFiles = fs.readdirSync(setPath).filter(f => f.endsWith('.hjson'));
		const setNumber = parseInt(setDir.replace('set', ''), 10);
		const setCards: Card[] = [];

		console.log(`Processing ${setDir} (${hjsonFiles.length} files)...`);

		for (const file of hjsonFiles) {
			stats.totalFiles++;
			const filePath = path.join(setPath, file);
			const content = fs.readFileSync(filePath, 'utf-8');

			let parsed: Record<string, unknown>;
			try {
				parsed = hjson.parse(content) as Record<string, unknown>;
			} catch (err) {
				console.error(`  HJSON parse error in ${file}:`, err);
				stats.errors++;
				continue;
			}

			// Each top-level key is a card blueprint ID
			for (const [blueprintId, cardData] of Object.entries(parsed)) {
				if (typeof cardData !== 'object' || cardData === null) continue;

				const card = parseCard(blueprintId, cardData as Record<string, unknown>);
				if (card) {
					setCards.push(card);
					stats.totalCards++;
					stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
					if (card.culture) stats.byCulture[card.culture] = (stats.byCulture[card.culture] || 0) + 1;
					stats.bySet[setNumber] = (stats.bySet[setNumber] || 0) + 1;
				} else {
					stats.skipped++;
				}
			}
		}

		// Sort cards by card number within set
		setCards.sort((a, b) => a.cardNumber - b.cardNumber);

		// Write set file
		const setOutputPath = path.join(OUTPUT_DIR, `set${String(setNumber).padStart(2, '0')}.json`);
		fs.writeFileSync(setOutputPath, JSON.stringify(setCards, null, 2));
		console.log(`  → ${setCards.length} cards → ${path.basename(setOutputPath)}`);

		allCards.push(...setCards);
	}

	// Sort all cards by set, then card number
	allCards.sort((a, b) => a.setNumber !== b.setNumber ? a.setNumber - b.setNumber : a.cardNumber - b.cardNumber);

	// Write combined file
	const allOutputPath = path.join(OUTPUT_DIR, 'all-cards.json');
	fs.writeFileSync(allOutputPath, JSON.stringify(allCards, null, 2));

	// Write summary-only file (no effects blob — smaller, for client use)
	const summaries = allCards.map(({ effects, lore, hasErrata, siteNumber, siteBlock, siteDirection, allyHome, itemClass, target, signet, ...summary }) => summary);
	const summaryOutputPath = path.join(OUTPUT_DIR, 'all-cards-summary.json');
	fs.writeFileSync(summaryOutputPath, JSON.stringify(summaries, null, 2));

	// Print stats
	console.log('\n=============================');
	console.log('RESULTS');
	console.log('=============================');
	console.log(`Files processed: ${stats.totalFiles}`);
	console.log(`Cards parsed:    ${stats.totalCards}`);
	console.log(`Skipped (errata/alt): ${stats.skipped}`);
	console.log(`Errors:          ${stats.errors}`);
	console.log(`\nBy type:`);
	for (const [type, count] of Object.entries(stats.byType).sort((a, b) => b[1] - a[1])) {
		console.log(`  ${type}: ${count}`);
	}
	console.log(`\nBy culture:`);
	for (const [culture, count] of Object.entries(stats.byCulture).sort((a, b) => b[1] - a[1])) {
		console.log(`  ${culture}: ${count}`);
	}
	console.log(`\nBy set:`);
	for (const [set, count] of Object.entries(stats.bySet).sort((a, b) => Number(a[0]) - Number(b[0]))) {
		console.log(`  Set ${String(set).padStart(2, '0')}: ${count}`);
	}
	console.log(`\nOutput files:`);
	console.log(`  ${allOutputPath} (${(fs.statSync(allOutputPath).size / 1024 / 1024).toFixed(1)} MB)`);
	console.log(`  ${summaryOutputPath} (${(fs.statSync(summaryOutputPath).size / 1024 / 1024).toFixed(1)} MB)`);
	console.log(`  + ${setDirs.length} individual set files in ${OUTPUT_DIR}/`);
}

main();

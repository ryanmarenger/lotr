/**
 * Core card type definitions for LOTR TCG.
 * Parsed from GEMP HJSON card data into this normalized format.
 */

export type CardSide = 'Free Peoples' | 'Shadow';

export type CardType =
	| 'Companion'
	| 'Ally'
	| 'Follower'
	| 'Minion'
	| 'Event'
	| 'Condition'
	| 'Possession'
	| 'Artifact'
	| 'Site'
	| 'The One Ring';

export type CardCulture =
	| 'Dwarven'
	| 'Elven'
	| 'Gandalf'
	| 'Gondor'
	| 'Rohan'
	| 'Shire'
	| 'Dunland'
	| 'Gollum'
	| 'Isengard'
	| 'Moria'
	| 'Raider'
	| 'Sauron'
	| 'Ringwraith'
	| 'Orc'
	| 'Uruk-hai'
	| 'Men';

export type CardRarity = 'C' | 'U' | 'R' | 'S' | 'P' | 'X' | 'RF' | 'O';

export type SiteBlock = 'Fellowship' | 'Towers' | 'King' | 'Shadows';

export type SiteDirection = 'Left' | 'Right';

export interface Card {
	/** GEMP blueprint ID, e.g. "1_3" */
	blueprintId: string;

	/** Collection info, e.g. "1C3" */
	collInfo: string;

	/** Set number (0-19) */
	setNumber: number;

	/** Card number within the set */
	cardNumber: number;

	/** Card title, e.g. "Gimli" */
	title: string;

	/** Subtitle, e.g. "Son of Gloin" (companions, allies, some minions) */
	subtitle?: string;

	/** Whether this card is unique */
	unique: boolean;

	/** Free Peoples or Shadow (sites and The One Ring have no side) */
	side?: CardSide;

	/** Card culture (not present on sites or The One Ring) */
	culture?: CardCulture;

	/** Twilight cost */
	twilight: number;

	/** Card type */
	type: CardType;

	/** Card rarity */
	rarity: CardRarity;

	/** Race (companions, allies, minions) */
	race?: string;

	/** Strength (companions, allies, minions) */
	strength?: number;

	/** Vitality / hit points (companions, allies, minions) */
	vitality?: number;

	/** Resistance (Ring-bearer, some companions — sets 11+) */
	resistance?: number;

	/** Site number for minions (which site they can roam at) */
	siteNumber?: number;

	/** Site block (Fellowship, Towers, King) — site cards only */
	siteBlock?: SiteBlock;

	/** Site direction (Left or Right) — site cards only */
	siteDirection?: SiteDirection;

	/** Ally home site code, e.g. "3F" — allies only */
	allyHome?: string;

	/** Keywords (Damage+1, Fierce, Ranger, Archer, etc.) */
	keywords: string[];

	/** Timewords for events (Fellowship, Skirmish, etc.) */
	timeword?: string;

	/** Item class for possessions/artifacts (Hand Weapon, Armor, etc.) */
	itemClass?: string;

	/** Target restriction for possessions/artifacts ("dwarf", "hobbit", etc.) */
	target?: string;

	/** The full game text (HTML from GEMP) */
	gametext: string;

	/** Lore / flavor text */
	lore: string;

	/** Raw GEMP effects definition (preserved for the card effect engine) */
	effects: unknown;

	/** Image path relative to card images root */
	imagePath: string;

	/** Whether this card has errata versions */
	hasErrata: boolean;

	/** Signet (for companions with signets) */
	signet?: string;
}

/**
 * Minimal card info for deck lists and search results.
 * Avoids sending the full effects blob to the client.
 */
export interface CardSummary {
	blueprintId: string;
	collInfo: string;
	setNumber: number;
	cardNumber: number;
	title: string;
	subtitle?: string;
	unique: boolean;
	side?: CardSide;
	culture?: CardCulture;
	twilight: number;
	type: CardType;
	rarity: CardRarity;
	race?: string;
	strength?: number;
	vitality?: number;
	resistance?: number;
	keywords: string[];
	timeword?: string;
	gametext: string;
	imagePath: string;
	/** Web-servable image URL, e.g. "/cards/set01/LOTR01003.jpg" */
	imageUrl: string;
}

/**
 * Per-site camera profiles.
 *
 * Each site defines a visual "camera" that controls how the board
 * feels at that location. The perspective is a narrative tool:
 * open landscapes have low horizons and gentle tilts; enclosed
 * spaces press the horizon high and tilt steeply.
 *
 * These values drive:
 *   - Board tilt (CSS perspective transform)
 *   - Horizon line position (for landscape composition)
 *   - Card tilt angle (cards match the scene's perspective)
 *   - Ambient mood (color temperature, vignette intensity)
 *   - Transition timing (how fast/slow the camera shifts between sites)
 */

/**
 * Arc layout type — determines how zones spread from the player.
 *   'gentle'   = wide spread, thin bands (open landscapes)
 *   'moderate'  = balanced spread (mixed terrain, vertical features)
 *   'steep'     = narrow spread, compressed bands (enclosed/underground)
 */
export type ArcLayout = 'gentle' | 'moderate' | 'steep';

export interface SiteCameraProfile {
	/** Arc layout type — driven by the location's character, not site number. */
	arcLayout: ArcLayout;

	/** Horizon line position (0-100%). Low = big sky. High = ground-heavy. */
	horizon: number;

	/** Board tilt X in degrees (0-40). 0 = flat. 40 = steep isometric. */
	tiltX: number;

	/** Board tilt Y in degrees (-10 to 10). Subtle lateral lean. */
	tiltY: number;

	/** Perspective depth in px. Lower = more dramatic foreshortening. */
	depth: number;

	/** Card tilt angle in degrees. Cards lean to match the isometric view. */
	cardTilt: number;

	/** Ambient color temperature. Warm (gold/amber) to cold (blue/grey). */
	mood: 'warm' | 'neutral' | 'cold' | 'oppressive' | 'ethereal';

	/** Vignette intensity (0-1). Higher = darker edges, more focused center. */
	vignette: number;

	/** Camera transition duration in ms when arriving at this site. */
	transitionMs: number;

	/** Flavor text for this camera angle — explains the artistic intent. */
	note: string;
}

/**
 * Camera profiles keyed by a site identifier.
 *
 * Key format: "{block}-{siteNumber}" where block is 'fellowship', 'towers', or 'king'.
 * Sites that share a location share a camera profile.
 */
export const SITE_CAMERAS: Record<string, SiteCameraProfile> = {
	// ═══════════════════════════════════════════════════
	// FELLOWSHIP BLOCK — water theme (wonder & beauty)
	// ═══════════════════════════════════════════════════

	'fellowship-1': {
		arcLayout: 'gentle',
		horizon: 25, tiltX: 15, tiltY: 0, depth: 1200, cardTilt: 12,
		mood: 'warm', vignette: 0.15, transitionMs: 2000,
		note: 'The Shire. Rolling hills, wide sky. Gentle = open pastoral.',
	},
	'fellowship-2': {
		arcLayout: 'moderate',
		horizon: 35, tiltX: 20, tiltY: -2, depth: 1000, cardTilt: 16,
		mood: 'cold', vignette: 0.25, transitionMs: 1500,
		note: 'Road to Bree. Narrow road, rain. Moderate = enclosed but outdoors.',
	},
	'fellowship-3': {
		arcLayout: 'moderate',
		horizon: 30, tiltX: 18, tiltY: 0, depth: 1100, cardTilt: 14,
		mood: 'ethereal', vignette: 0.2, transitionMs: 2000,
		note: 'Rivendell. Vertical waterfalls. Moderate = tall features need space.',
	},
	'fellowship-4': {
		arcLayout: 'steep',
		horizon: 50, tiltX: 28, tiltY: 3, depth: 800, cardTilt: 22,
		mood: 'cold', vignette: 0.35, transitionMs: 1200,
		note: 'Caradhras. Mountain pass. Steep = hemmed in by peaks.',
	},
	'fellowship-5': {
		arcLayout: 'steep',
		horizon: 65, tiltX: 35, tiltY: 0, depth: 700, cardTilt: 28,
		mood: 'oppressive', vignette: 0.5, transitionMs: 800,
		note: 'Bridge of Khazad-dûm. Underground cavern. Steep = most claustrophobic.',
	},
	'fellowship-6': {
		arcLayout: 'gentle',
		horizon: 28, tiltX: 16, tiltY: 0, depth: 1200, cardTilt: 12,
		mood: 'ethereal', vignette: 0.15, transitionMs: 2500,
		note: 'Lothlórien. Open canopy, ethereal. Gentle = relief after Moria.',
	},
	'fellowship-7': {
		arcLayout: 'gentle',
		horizon: 22, tiltX: 14, tiltY: -1, depth: 1300, cardTilt: 10,
		mood: 'neutral', vignette: 0.1, transitionMs: 2000,
		note: 'River Anduin. Wide river, open sky. Gentle = most spacious.',
	},
	'fellowship-8': {
		arcLayout: 'moderate',
		horizon: 30, tiltX: 20, tiltY: 0, depth: 1000, cardTilt: 16,
		mood: 'neutral', vignette: 0.2, transitionMs: 1800,
		note: 'Pillars of the Kings. Tall statues. Moderate = vertical monument.',
	},
	'fellowship-9': {
		arcLayout: 'moderate',
		horizon: 40, tiltX: 25, tiltY: 2, depth: 900, cardTilt: 20,
		mood: 'cold', vignette: 0.3, transitionMs: 1200,
		note: 'Amon Hen. Forest closing in. Moderate = tension but not trapped.',
	},

	// ═══════════════════════════════════════════════════
	// TOWERS BLOCK — fire/wind theme (war arriving)
	// ═══════════════════════════════════════════════════

	'towers-1': {
		arcLayout: 'gentle',
		horizon: 18, tiltX: 12, tiltY: 0, depth: 1400, cardTilt: 8,
		mood: 'warm', vignette: 0.08, transitionMs: 2500,
		note: 'Eastern Rohan. Endless grassland. Gentle = widest, most open site in the game.',
	},
	'towers-2': {
		arcLayout: 'steep',
		horizon: 60, tiltX: 30, tiltY: 0, depth: 750, cardTilt: 24,
		mood: 'cold', vignette: 0.4, transitionMs: 1000,
		note: 'Fangorn Forest. Trees closing overhead. Steep = canopy pressing down.',
	},
	'towers-3': {
		arcLayout: 'moderate',
		horizon: 30, tiltX: 20, tiltY: 0, depth: 1000, cardTilt: 16,
		mood: 'warm', vignette: 0.2, transitionMs: 1800,
		note: 'Edoras. Open hilltop with Golden Hall. Moderate = focused but spacious.',
	},
	'towers-4': {
		arcLayout: 'gentle',
		horizon: 25, tiltX: 15, tiltY: 0, depth: 1200, cardTilt: 12,
		mood: 'warm', vignette: 0.15, transitionMs: 2000,
		note: 'Rohan Plains. Muster of Rohirrim. Gentle = army needs space.',
	},
	'towers-5': {
		arcLayout: 'moderate',
		horizon: 45, tiltX: 25, tiltY: 0, depth: 900, cardTilt: 20,
		mood: 'cold', vignette: 0.3, transitionMs: 1200,
		note: 'Helm\'s Deep (outer wall). Siege begins. Moderate = tightening.',
	},
	'towers-6': {
		arcLayout: 'steep',
		horizon: 50, tiltX: 30, tiltY: 0, depth: 850, cardTilt: 24,
		mood: 'cold', vignette: 0.35, transitionMs: 1000,
		note: 'Helm\'s Deep (deeping wall). Walls breached. Steep = compressed.',
	},
	'towers-7': {
		arcLayout: 'steep',
		horizon: 55, tiltX: 32, tiltY: 0, depth: 800, cardTilt: 26,
		mood: 'oppressive', vignette: 0.4, transitionMs: 800,
		note: 'Helm\'s Deep (hornburg). Last stand. Steep = most desperate.',
	},
	'towers-8': {
		arcLayout: 'moderate',
		horizon: 40, tiltX: 25, tiltY: 0, depth: 900, cardTilt: 20,
		mood: 'cold', vignette: 0.3, transitionMs: 1500,
		note: 'Isengard. Orthanc tower. Moderate = industrial, vertical tower.',
	},
	'towers-9': {
		arcLayout: 'moderate',
		horizon: 40, tiltX: 25, tiltY: 0, depth: 900, cardTilt: 20,
		mood: 'cold', vignette: 0.3, transitionMs: 1500,
		note: 'Isengard (flooded). Water rushes in. Moderate = opening up from destruction.',
	},

	// ═══════════════════════════════════════════════════
	// KING BLOCK — unnatural light (wrong/ominous)
	// ═══════════════════════════════════════════════════

	'king-1': {
		arcLayout: 'steep',
		horizon: 58, tiltX: 30, tiltY: -2, depth: 800, cardTilt: 24,
		mood: 'oppressive', vignette: 0.4, transitionMs: 1000,
		note: 'Dunharrow. Mountain passage. Steep = ghost-haunted enclosure.',
	},
	'king-2': {
		arcLayout: 'steep',
		horizon: 62, tiltX: 33, tiltY: 0, depth: 750, cardTilt: 26,
		mood: 'oppressive', vignette: 0.45, transitionMs: 800,
		note: 'Paths of the Dead. Underground. Steep = deepest enclosure since Moria.',
	},
	'king-3': {
		arcLayout: 'moderate',
		horizon: 35, tiltX: 20, tiltY: 0, depth: 1000, cardTilt: 16,
		mood: 'neutral', vignette: 0.25, transitionMs: 1800,
		note: 'Minas Tirith (lower circles). Moderate = city rising, still hopeful.',
	},
	'king-4': {
		arcLayout: 'moderate',
		horizon: 38, tiltX: 22, tiltY: 0, depth: 950, cardTilt: 18,
		mood: 'cold', vignette: 0.28, transitionMs: 1500,
		note: 'Minas Tirith (mid circles). Moderate = siege approaching.',
	},
	'king-5': {
		arcLayout: 'steep',
		horizon: 40, tiltX: 24, tiltY: 0, depth: 900, cardTilt: 20,
		mood: 'cold', vignette: 0.32, transitionMs: 1200,
		note: 'Minas Tirith (upper circles). Steep = fire raining, walls closing.',
	},
	'king-6': {
		arcLayout: 'steep',
		horizon: 42, tiltX: 25, tiltY: 0, depth: 880, cardTilt: 20,
		mood: 'oppressive', vignette: 0.35, transitionMs: 1000,
		note: 'Minas Tirith (citadel). Steep = last defense, nowhere left to go.',
	},
	'king-7': {
		arcLayout: 'steep',
		horizon: 50, tiltX: 28, tiltY: 0, depth: 850, cardTilt: 22,
		mood: 'oppressive', vignette: 0.38, transitionMs: 1000,
		note: 'Osgiliath. Ruined city, rubble. Steep = broken, cramped.',
	},
	'king-8': {
		arcLayout: 'steep',
		horizon: 55, tiltX: 30, tiltY: 3, depth: 800, cardTilt: 24,
		mood: 'oppressive', vignette: 0.45, transitionMs: 800,
		note: 'Morgul Vale. Morgul-light pressing down. Steep = oppressive weight.',
	},
	'king-9': {
		arcLayout: 'gentle',
		horizon: 20, tiltX: 15, tiltY: 0, depth: 1300, cardTilt: 10,
		mood: 'cold', vignette: 0.5, transitionMs: 3000,
		note: 'Black Gate. SURPRISE: gentle layout, low horizon. Vast plain. Terrifyingly open — the fellowship is tiny against infinite dark.',
	},
};

/**
 * Get a camera profile for a given block and site number.
 * Falls back to a neutral default if not found.
 */
export function getSiteCamera(block: string, siteNumber: number): SiteCameraProfile {
	const key = `${block}-${siteNumber}`;
	return SITE_CAMERAS[key] || {
		arcLayout: 'moderate' as ArcLayout,
		horizon: 35, tiltX: 20, tiltY: 0, depth: 1000, cardTilt: 16,
		mood: 'neutral' as const, vignette: 0.2, transitionMs: 1500,
		note: 'Default camera profile.',
	};
}

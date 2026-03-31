import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getDistinctValues } from '$lib/server/cards.js';

export const GET: RequestHandler = () => {
	return json({
		cultures: getDistinctValues('culture'),
		types: getDistinctValues('type'),
		races: getDistinctValues('race'),
		rarities: getDistinctValues('rarity'),
		keywords: getDistinctValues('keywords'),
	});
};

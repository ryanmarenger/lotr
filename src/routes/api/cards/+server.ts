import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { searchCards, type CardSearchParams } from '$lib/server/cards.js';

export const GET: RequestHandler = ({ url }) => {
	const params: CardSearchParams = {};

	const query = url.searchParams.get('q');
	if (query) params.query = query;

	const culture = url.searchParams.get('culture');
	if (culture) params.culture = culture;

	const type = url.searchParams.get('type');
	if (type) params.type = type;

	const side = url.searchParams.get('side');
	if (side) params.side = side;

	const set = url.searchParams.get('set');
	if (set) params.set = parseInt(set, 10);

	const minTwilight = url.searchParams.get('minTwilight');
	if (minTwilight) params.minTwilight = parseInt(minTwilight, 10);

	const maxTwilight = url.searchParams.get('maxTwilight');
	if (maxTwilight) params.maxTwilight = parseInt(maxTwilight, 10);

	const keyword = url.searchParams.get('keyword');
	if (keyword) params.keyword = keyword;

	const rarity = url.searchParams.get('rarity');
	if (rarity) params.rarity = rarity;

	const race = url.searchParams.get('race');
	if (race) params.race = race;

	const page = url.searchParams.get('page');
	if (page) params.page = parseInt(page, 10);

	const pageSize = url.searchParams.get('pageSize');
	if (pageSize) params.pageSize = parseInt(pageSize, 10);

	return json(searchCards(params));
};

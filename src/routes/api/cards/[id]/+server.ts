import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getCard } from '$lib/server/cards.js';

export const GET: RequestHandler = ({ params }) => {
	const card = getCard(params.id);
	if (!card) throw error(404, 'Card not found');
	return json(card);
};

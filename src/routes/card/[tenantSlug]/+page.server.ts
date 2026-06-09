import { error } from '@sveltejs/kit';
import { fetchPublicCard } from '$lib/server/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const result = await fetchPublicCard(params.tenantSlug);
	if (!result) {
		error(404, 'Card not found');
	}
	return { card: result.card, tenantSlug: params.tenantSlug };
};

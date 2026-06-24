import { error } from '@sveltejs/kit';
import { fetchCheckoutSession } from '$lib/server/tenant';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, url }) => {
	const token = url.searchParams.get('session');
	if (!token) {
		error(400, 'Missing checkout session');
	}

	// The checkout session token is a secret bearer credential: possession of it
	// is enough to view and pay for the order (see GetCheckoutSession, which only
	// enforces ownership when a user is present). A missing/expired session must
	// NOT redirect to login — the buyer's session lives on their tenant's own
	// domain, so logging in here cannot recover the order and previously caused an
	// infinite login loop.
	const session = await fetchCheckoutSession(request.headers.get('cookie'), token);
	if (!session) {
		error(
			404,
			'This checkout session has expired or could not be found. Please return to the shop and start checkout again.'
		);
	}

	return { sessionToken: token, checkout: session };
};

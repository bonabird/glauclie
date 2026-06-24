import { error } from '@sveltejs/kit';
import { fetchCheckoutSession } from '$lib/server/tenant';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('session');
	if (!token) {
		error(400, 'Missing checkout session');
	}

	// The checkout session token is a secret bearer credential: possession of it
	// is enough to view and pay for the order (see GetCheckoutSession, which only
	// enforces ownership when a user is present). We deliberately do NOT forward
	// any platform cookie here: the buyer's real session lives on their tenant's
	// own domain, and forwarding an unrelated platform session (e.g. a tenant
	// owner logged into the dashboard) would fail the ownership check and 404.
	// A missing/expired session must also NOT redirect to login — that previously
	// caused an infinite login loop.
	const session = await fetchCheckoutSession(null, token);
	if (!session) {
		error(
			404,
			'This checkout session has expired or could not be found. Please return to the shop and start checkout again.'
		);
	}

	return { sessionToken: token, checkout: session };
};

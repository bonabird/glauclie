import { error, redirect } from '@sveltejs/kit';
import { fetchCheckoutSession } from '$lib/server/tenant';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, url, parent }) => {
	const { tenantSlug } = await parent();
	const token = url.searchParams.get('session');
	if (!token) {
		error(400, 'Missing checkout session');
	}

	const session = await fetchCheckoutSession(request.headers.get('cookie'), token);
	if (!session) {
		const redirectTo = `/${tenantSlug}/checkout?session=${encodeURIComponent(token)}`;
		redirect(302, `/${tenantSlug}/login?redirect_to=${encodeURIComponent(redirectTo)}`);
	}

	return { sessionToken: token, checkout: session };
};

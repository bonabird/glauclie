import { error } from '@sveltejs/kit';
import { fetchPublicLinkPage, fetchPublicLinkPageByDomain } from '$lib/server/public';
import type { PageServerLoad } from './$types';

const RESERVED = new Set([
	'login',
	'register',
	'forgot-password',
	'reset-password',
	'dashboard',
	'api',
	'auth',
	'embed'
]);

export const load: PageServerLoad = async ({ params, request }) => {
	if (RESERVED.has(params.tenantSlug)) {
		error(404, 'Not found');
	}

	const host = request.headers.get('host')?.split(':')[0] ?? '';
	const isLocal = host === 'localhost' || host === '127.0.0.1';

	let data = await fetchPublicLinkPage(params.tenantSlug);
	if (!data && !isLocal && host) {
		data = await fetchPublicLinkPageByDomain(host);
	}
	if (!data) {
		error(404, 'Page not found');
	}
	return { data, tenantSlug: data.slug };
};

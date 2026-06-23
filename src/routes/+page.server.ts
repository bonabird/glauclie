import { fetchPublicLinkPageByDomain } from '$lib/server/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	const host = request.headers.get('host')?.split(':')[0] ?? '';
	const isLocal = host === 'localhost' || host === '127.0.0.1';
	const data = !isLocal && host ? await fetchPublicLinkPageByDomain(host) : null;
	return { data };
};

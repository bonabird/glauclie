import type { LayoutServerLoad } from './$types';
import { fetchTenantByDomain } from '$lib/server/tenant';

export const load: LayoutServerLoad = async ({ request, url }) => {
	const host = request.headers.get('host')?.split(':')[0] ?? '';
	const isLocal = host === 'localhost' || host === '127.0.0.1';

	let tenant = null;
	if (!isLocal && host) {
		tenant = await fetchTenantByDomain(host);
	}

	return {
		tenant,
		host,
		pathname: url.pathname
	};
};
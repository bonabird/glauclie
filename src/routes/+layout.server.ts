import type { LayoutServerLoad } from './$types';
import { isLocalHost, resolveTenantForHost } from '$lib/server/platform';

export const load: LayoutServerLoad = async ({ request, url }) => {
	const host = request.headers.get('host')?.split(':')[0] ?? '';

	const tenant = !isLocalHost(host) && host ? await resolveTenantForHost(host) : null;

	return {
		tenant,
		host,
		pathname: url.pathname
	};
};

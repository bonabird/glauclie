import type { PageServerLoad } from './$types';
import { fetchTenantByDomain } from '$lib/server/tenant';

export const load: PageServerLoad = async ({ request }) => {
	const host = request.headers.get('host')?.split(':')[0] ?? '';
	const isLocal = host === 'localhost' || host === '127.0.0.1';
	const tenant = !isLocal && host ? await fetchTenantByDomain(host) : null;
	return { tenant, tenantSlug: tenant?.slug ?? null };
};

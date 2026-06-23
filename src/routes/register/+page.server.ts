import { allowRegistration } from '$lib/env/public';
import { redirect } from '@sveltejs/kit';
import { fetchTenantByDomain } from '$lib/server/tenant';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	const host = request.headers.get('host')?.split(':')[0] ?? '';
	const isLocal = host === 'localhost' || host === '127.0.0.1';
	const tenant = !isLocal && host ? await fetchTenantByDomain(host) : null;
	if (!tenant && !allowRegistration()) {
		redirect(302, '/login');
	}
	return { tenant, tenantSlug: tenant?.slug ?? null };
};

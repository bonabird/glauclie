import { error } from '@sveltejs/kit';
import { fetchTenantByDomain, fetchTenantBySlug } from '$lib/server/tenant';
import type { LayoutServerLoad } from './$types';

const RESERVED = new Set([
	'login',
	'register',
	'forgot-password',
	'reset-password',
	'dashboard',
	'api',
	'auth',
	'embed',
	'card',
	'verify-email',
	'shop'
]);

export const load: LayoutServerLoad = async ({ params, request }) => {
	if (RESERVED.has(params.tenantSlug)) {
		error(404, 'Not found');
	}

	const host = request.headers.get('host')?.split(':')[0] ?? '';
	const isLocal = host === 'localhost' || host === '127.0.0.1';

	let tenant = await fetchTenantBySlug(params.tenantSlug);
	if (!tenant && !isLocal && host) {
		tenant = await fetchTenantByDomain(host);
	}
	if (!tenant) {
		error(404, 'Tenant not found');
	}

	return { tenant, tenantSlug: tenant.slug };
};

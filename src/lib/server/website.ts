import { error } from '@sveltejs/kit';
import { fetchTenantByDomain } from '$lib/server/tenant';

export async function tenantFromWebsiteHost(request: Request) {
	const host = request.headers.get('host')?.split(':')[0] ?? '';
	const isLocal = host === 'localhost' || host === '127.0.0.1';
	if (!host || isLocal) {
		error(404, 'Tenant website not found');
	}
	const tenant = await fetchTenantByDomain(host);
	if (!tenant) {
		error(404, 'Tenant website not found');
	}
	return tenant;
}

import { env } from '$env/dynamic/private';
import { fetchTenantByDomain } from '$lib/server/tenant';
import type { PublicTenant } from '$lib/types';

export function isLocalHost(host: string): boolean {
	const h = host.toLowerCase();
	return h === 'localhost' || h === '127.0.0.1';
}

/** Hosts that serve the Glaucidae app itself, not a tenant custom domain. */
export function isPlatformAppHost(host: string): boolean {
	if (!host || isLocalHost(host)) return true;
	const h = host.toLowerCase();
	if (h.endsWith('.vercel.app')) return true;

	const configured = env.PLATFORM_APP_HOST?.trim().toLowerCase();
	if (configured && h === configured) return true;

	const platformDomain = env.PLATFORM_DOMAIN?.trim().toLowerCase() ?? 'glaucidae.com';
	if (h === platformDomain || h === `app.${platformDomain}` || h === `www.${platformDomain}`) {
		return true;
	}

	return false;
}

export function hasAuthCookies(cookieHeader: string | null): boolean {
	if (!cookieHeader) return false;
	return cookieHeader.includes('access_token=') || cookieHeader.includes('refresh_token=');
}

export async function resolveTenantForHost(host: string): Promise<PublicTenant | null> {
	if (!host || isPlatformAppHost(host)) return null;
	return fetchTenantByDomain(host);
}

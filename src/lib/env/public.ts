import { env } from '$env/dynamic/public';

/** When false, registration UI and routes are disabled. */
export function allowRegistration(): boolean {
	return env.PUBLIC_ALLOW_REGISTRATION !== 'false';
}

/** Public Go API base URL. Empty in local dev (Vite proxies relative /api paths). */
export function publicApiUrl(): string {
	return env.PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';
}

/** Resolve an API path for browser fetches. Uses relative paths in local dev. */
export function apiUrl(path: string): string {
	const base = publicApiUrl();
	const normalized = path.startsWith('/') ? path : `/${path}`;
	if (!base) return normalized;
	return `${base}${normalized}`;
}

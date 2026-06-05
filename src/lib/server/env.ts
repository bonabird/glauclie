import { env } from '$env/dynamic/private';

const DEFAULT_API_URL = 'http://localhost:8080';

/** Go API base URL for server-side fetches (SSR, hooks). */
export function apiInternalUrl(): string {
	return env.API_INTERNAL_URL?.trim().replace(/\/$/, '') || DEFAULT_API_URL;
}

/** Resolve an API path for server-side fetches. */
export function serverApiUrl(path: string): string {
	const base = apiInternalUrl();
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${base}${normalized}`;
}

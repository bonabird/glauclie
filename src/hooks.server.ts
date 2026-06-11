import type { Handle, HandleFetch } from '@sveltejs/kit';
import { allowRegistration } from '$lib/env/public';
import { apiInternalUrl } from '$lib/server/env';
import { fetchMe, refreshSession } from '$lib/server/api';

const registrationEnabled = allowRegistration();

const PUBLIC_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password'];
const RESERVED_SEGMENTS = new Set([
	'login',
	'register',
	'forgot-password',
	'reset-password',
	'dashboard',
	'api',
	'embed'
]);

function isPublicLinkPage(path: string): boolean {
	const parts = path.split('/').filter(Boolean);
	return parts.length === 1 && !RESERVED_SEGMENTS.has(parts[0]);
}

function isPublicCardPage(path: string): boolean {
	const parts = path.split('/').filter(Boolean);
	return parts.length === 2 && parts[0] === 'card' && !RESERVED_SEGMENTS.has(parts[1]);
}

async function resolveSession(event: Parameters<Handle>[0]['event']) {
	let cookie = event.request.headers.get('cookie');
	event.locals.user = await fetchMe(cookie);

	if (!event.locals.user && cookie) {
		const refreshed = await refreshSession(cookie);
		if (refreshed) {
			cookie = refreshed.cookie;
			event.locals.authCookie = refreshed.cookie;
			event.locals.authSetCookies = refreshed.setCookies;
			event.locals.user = await fetchMe(cookie);
		}
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const isPublic =
		path === '/' ||
		PUBLIC_PREFIXES.some((p) => path.startsWith(p)) ||
		isPublicLinkPage(path) ||
		isPublicCardPage(path);

	// Always resolve session when cookies are present (needed for /login redirect).
	await resolveSession(event);

	if (!isPublic && path.startsWith('/dashboard')) {
		if (!event.locals.user) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/login' }
			});
		}
	}

	if (!registrationEnabled && path === '/register') {
		return new Response(null, {
			status: 302,
			headers: { Location: '/login' }
		});
	}

	if (event.locals.user && (path === '/login' || path === '/register')) {
		return new Response(null, {
			status: 302,
			headers: { Location: '/dashboard' }
		});
	}

	const response = await resolve(event);

	for (const setCookie of event.locals.authSetCookies ?? []) {
		response.headers.append('Set-Cookie', setCookie);
	}

	return response;
};

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	const apiBase = apiInternalUrl();
	let parsed: URL;
	try {
		parsed = new URL(request.url, event.url.origin);
	} catch {
		return fetch(request);
	}

	const isAppApi =
		parsed.pathname.startsWith('/api/') &&
		(parsed.origin === event.url.origin || request.url.startsWith('/api/'));

	if (!isAppApi) {
		return fetch(request);
	}

	const backendUrl = `${apiBase}${parsed.pathname}${parsed.search}`;
	const headers = new Headers(request.headers);
	const cookie = event.locals.authCookie ?? event.request.headers.get('cookie');
	if (cookie) {
		headers.set('cookie', cookie);
	}

	return fetch(
		new Request(backendUrl, {
			method: request.method,
			headers,
			body: request.body,
			// @ts-expect-error — required for streaming bodies in Node 18+
			duplex: 'half'
		})
	);
};

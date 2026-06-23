import type { Handle, HandleFetch } from '@sveltejs/kit';
import { hasAuthCookies } from '$lib/server/platform';
import { apiInternalUrl } from '$lib/server/env';
import { fetchMe, refreshSession } from '$lib/server/api';

const PUBLIC_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/auth/callback', '/auth/logout'];
const RESERVED_SEGMENTS = new Set([
	'login',
	'register',
	'forgot-password',
	'reset-password',
	'dashboard',
	'api',
	'auth',
	'embed',
	'shop',
	'verify-email'
]);

function isPublicLinkPage(path: string): boolean {
	const parts = path.split('/').filter(Boolean);
	return parts.length === 1 && !RESERVED_SEGMENTS.has(parts[0]);
}

function isPublicShopPage(path: string): boolean {
	const parts = path.split('/').filter(Boolean);
	return parts.length >= 2 && parts[1] === 'shop' && !RESERVED_SEGMENTS.has(parts[0]);
}

function isCustomDomainShopPage(path: string): boolean {
	const parts = path.split('/').filter(Boolean);
	return parts.length >= 1 && parts[0] === 'shop';
}

function isPublicCardPage(path: string): boolean {
	const parts = path.split('/').filter(Boolean);
	return parts.length === 2 && parts[0] === 'card' && !RESERVED_SEGMENTS.has(parts[1]);
}

function isPublicTenantAuthPage(path: string): boolean {
	const parts = path.split('/').filter(Boolean);
	return (
		parts.length === 2 &&
		!RESERVED_SEGMENTS.has(parts[0]) &&
		(parts[1] === 'login' || parts[1] === 'register')
	);
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
		isPublicShopPage(path) ||
		isCustomDomainShopPage(path) ||
		isPublicCardPage(path) ||
		isPublicTenantAuthPage(path);

	// Skip API session checks on public pages when the browser sent no auth cookies.
	const cookie = event.request.headers.get('cookie');
	const needsSession =
		!isPublic || path.startsWith('/dashboard') || hasAuthCookies(cookie);

	if (needsSession) {
		await resolveSession(event);
	}

	if (!isPublic && path.startsWith('/dashboard')) {
		if (!event.locals.user) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/login' }
			});
		}
		// The dashboard is tenant-staff only. Customer (member) accounts must not access it.
		if (event.locals.user.role === 'member') {
			return new Response(null, {
				status: 302,
				headers: { Location: '/' }
			});
		}
	}

	if (
		event.locals.user &&
		(path === '/login' || path === '/register') &&
		event.locals.user.role !== 'member'
	) {
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

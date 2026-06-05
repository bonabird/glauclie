import type { Handle, HandleFetch } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { fetchMe, refreshSession } from '$lib/server/api';

const allowRegistration = publicEnv.PUBLIC_ALLOW_REGISTRATION !== 'false';

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

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const isPublic =
		path === '/' ||
		PUBLIC_PREFIXES.some((p) => path.startsWith(p)) ||
		isPublicLinkPage(path) ||
		isPublicCardPage(path);

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

	if (!isPublic && path.startsWith('/dashboard')) {
		if (!event.locals.user) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/login' }
			});
		}
	}

	if (!allowRegistration && path === '/register') {
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
	if (!event.locals.authCookie) {
		return fetch(request);
	}

	const apiBase = env.API_INTERNAL_URL ?? 'http://localhost:8080';
	const url = request.url;
	const isApi =
		url.startsWith(apiBase) ||
		url.startsWith(`${event.url.origin}/api/`) ||
		url.startsWith('/api/');

	if (!isApi) {
		return fetch(request);
	}

	const headers = new Headers(request.headers);
	headers.set('cookie', event.locals.authCookie);
	return fetch(new Request(request, { headers }));
};

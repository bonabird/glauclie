import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type ExchangeResponse = {
	redirect_to?: string;
};

function splitSetCookie(header: string): string[] {
	const cookies: string[] = [];
	let start = 0;
	let inExpires = false;
	for (let i = 0; i < header.length; i++) {
		const part = header.slice(i, i + 8).toLowerCase();
		if (part === 'expires=') inExpires = true;
		if (inExpires && header[i] === ';') inExpires = false;
		if (!inExpires && header[i] === ',' && /\s*\w+=/.test(header.slice(i + 1))) {
			cookies.push(header.slice(start, i).trim());
			start = i + 1;
		}
	}
	cookies.push(header.slice(start).trim());
	return cookies.filter(Boolean);
}

function cookieValue(setCookie: string) {
	const first = setCookie.split(';', 1)[0] ?? '';
	const index = first.indexOf('=');
	if (index === -1) return null;
	return {
		name: first.slice(0, index),
		value: first.slice(index + 1)
	};
}

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
	const code = url.searchParams.get('code');
	if (!code) {
		error(400, 'Missing auth code');
	}

	const res = await fetch('/api/v1/auth/exchange', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ code })
	});

	const body = (await res.json().catch(() => ({}))) as ExchangeResponse & { error?: string };
	if (!res.ok) {
		error(res.status, body.error ?? 'Failed to exchange auth code');
	}

	const headers = res.headers as Headers & { getSetCookie?: () => string[] };
	const setCookies = headers.getSetCookie?.() ?? splitSetCookie(res.headers.get('set-cookie') ?? '');
	for (const value of setCookies) {
		const parsed = cookieValue(value);
		if (!parsed || (parsed.name !== 'access_token' && parsed.name !== 'refresh_token')) continue;
		cookies.set(parsed.name, parsed.value, {
			path: '/',
			httpOnly: true,
			secure: url.protocol === 'https:',
			sameSite: 'lax',
			maxAge: parsed.name === 'access_token' ? 15 * 60 : 30 * 24 * 60 * 60
		});
	}

	redirect(302, body.redirect_to || '/');
};

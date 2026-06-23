import type { Cookies } from '@sveltejs/kit';

const AUTH_COOKIE_NAMES = new Set(['access_token', 'refresh_token']);

export function splitSetCookie(header: string): string[] {
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

function parseSetCookie(setCookie: string) {
	const first = setCookie.split(';', 1)[0] ?? '';
	const eq = first.indexOf('=');
	if (eq === -1) return null;

	const attrs: Record<string, string | boolean> = {};
	for (const part of setCookie.split(';').slice(1)) {
		const trimmed = part.trim();
		const sep = trimmed.indexOf('=');
		if (sep === -1) {
			attrs[trimmed.toLowerCase()] = true;
		} else {
			attrs[trimmed.slice(0, sep).toLowerCase()] = trimmed.slice(sep + 1);
		}
	}

	const sameSite = String(attrs.samesite ?? 'lax').toLowerCase();
	return {
		name: first.slice(0, eq),
		domain: typeof attrs.domain === 'string' ? attrs.domain : undefined,
		secure: attrs.secure === true,
		sameSite: (sameSite === 'none' ? 'none' : sameSite === 'strict' ? 'strict' : 'lax') as
			| 'lax'
			| 'none'
			| 'strict'
	};
}

/** Apply Set-Cookie lines from the Go API onto the browser session. */
export function applyAuthSetCookies(
	cookies: Cookies,
	setCookies: string[],
	secure: boolean
): void {
	for (const value of setCookies) {
		const parsed = parseSetCookie(value);
		if (!parsed || !AUTH_COOKIE_NAMES.has(parsed.name)) continue;

		const base = {
			path: '/',
			httpOnly: true,
			secure: parsed.secure || secure,
			sameSite: parsed.sameSite
		};

		cookies.delete(parsed.name, { path: '/' });
		cookies.set(parsed.name, '', {
			...base,
			maxAge: 0,
			...(parsed.domain ? { domain: parsed.domain } : {})
		});
	}
}

export function readSetCookies(headers: Headers): string[] {
	const extended = headers as Headers & { getSetCookie?: () => string[] };
	return extended.getSetCookie?.() ?? splitSetCookie(headers.get('set-cookie') ?? '');
}

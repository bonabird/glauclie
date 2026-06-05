import type { SessionUser } from '$lib/types';
import { serverApiUrl } from '$lib/server/env';

function parseCookieHeader(header: string | null): Map<string, string> {
	const jar = new Map<string, string>();
	if (!header) return jar;
	for (const part of header.split(';')) {
		const trimmed = part.trim();
		const eq = trimmed.indexOf('=');
		if (eq > 0) {
			jar.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
		}
	}
	return jar;
}

function applySetCookies(cookieHeader: string | null, setCookies: string[]): string {
	const jar = parseCookieHeader(cookieHeader);
	for (const sc of setCookies) {
		const match = sc.match(/^([^=]+)=([^;]*)/);
		if (!match) continue;
		const name = match[1];
		const value = match[2];
		if (value === '' || /Max-Age=0/i.test(sc)) {
			jar.delete(name);
		} else {
			jar.set(name, value);
		}
	}
	return Array.from(jar.entries())
		.map(([k, v]) => `${k}=${v}`)
		.join('; ');
}

export async function fetchMe(cookie: string | null): Promise<SessionUser | null> {
	try {
		const res = await fetch(serverApiUrl('/api/v1/auth/me'), {
			headers: cookie ? { cookie } : {}
		});
		if (!res.ok) return null;
		const data = (await res.json()) as { user: SessionUser };
		return data.user;
	} catch {
		return null;
	}
}

/** Exchange refresh_token cookie for a new access_token. Returns updated Cookie header + Set-Cookie lines for the browser. */
export async function refreshSession(
	cookie: string | null
): Promise<{ cookie: string; setCookies: string[] } | null> {
	if (!cookie?.includes('refresh_token')) return null;
	try {
		const res = await fetch(serverApiUrl('/api/v1/auth/refresh'), {
			method: 'POST',
			headers: { cookie }
		});
		if (!res.ok) return null;
		const setCookies =
			typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
		const newCookie = applySetCookies(cookie, setCookies);
		return { cookie: newCookie, setCookies };
	} catch {
		return null;
	}
}

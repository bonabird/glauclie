import { redirect } from '@sveltejs/kit';
import { applyAuthSetCookies, readSetCookies } from '$lib/server/auth-cookies';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
	const res = await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => null);

	if (res) {
		applyAuthSetCookies(cookies, readSetCookies(res.headers), url.protocol === 'https:');
	}

	cookies.delete('access_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/' });

	redirect(303, '/login');
};

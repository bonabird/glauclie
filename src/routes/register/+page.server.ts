import { env } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	if (env.PUBLIC_ALLOW_REGISTRATION === 'false') {
		redirect(302, '/login');
	}
};

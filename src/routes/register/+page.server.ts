import { allowRegistration } from '$lib/env/public';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	if (!allowRegistration()) {
		redirect(302, '/login');
	}
};

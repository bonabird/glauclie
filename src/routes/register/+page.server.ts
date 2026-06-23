import { allowRegistration } from '$lib/env/public';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { tenant } = await parent();
	if (!tenant && !allowRegistration()) {
		redirect(302, '/login');
	}
	return { tenant, tenantSlug: tenant?.slug ?? null };
};

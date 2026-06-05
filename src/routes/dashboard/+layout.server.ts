import type { Module, Notification, TenantProfile } from '$lib/types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, locals }) => {
	let tenant: TenantProfile | null = null;
	let modules: Module[] = [];
	let unreadCount = 0;
	let recentNotifications: Notification[] = [];

	try {
		const [profile, mods, count, notifs] = await Promise.all([
			fetch('/api/v1/tenant/profile').then((r) => r.json()),
			fetch('/api/v1/modules').then((r) => r.json()),
			fetch('/api/v1/notifications/unread-count').then((r) => r.json()),
			fetch('/api/v1/notifications?limit=5').then((r) => r.json())
		]);
		tenant = profile as TenantProfile;
		modules = mods.modules ?? [];
		unreadCount = count.count ?? 0;
		recentNotifications = notifs.notifications ?? [];
	} catch {
		// partial load ok
	}

	return {
		user: locals.user,
		tenant,
		modules,
		unreadCount,
		recentNotifications
	};
};

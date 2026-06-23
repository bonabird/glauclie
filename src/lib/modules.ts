import { MODULE_ICON_NAMES } from '$lib/icons';

export { MODULE_ICON_NAMES };

/** Modules kept in the DB but hidden from the sidebar until implemented. */
export const HIDDEN_MODULE_SLUGS = [] as const;

/** @deprecated Use MODULE_ICON_NAMES with the Icon component instead. */
export const MODULE_ICONS = MODULE_ICON_NAMES;

export const MODULE_DESCRIPTIONS: Record<string, string> = {
	content: 'Blog posts, recipes, and other content with markdown editor.',
	newsletters: 'Email campaigns, subscriber list, and embeddable capture widget.',
	links: 'Link-in-bio page with smart actions and click tracking.',
	business_card: 'Digital card, QR code, GDPR lead capture, and email list sync.',
	analytics: 'Newsletter, link, and business card performance metrics.',
	commerce: 'Products, digital downloads, and Stripe checkout.',
	community: 'Customer accounts, global tiers, consent, and access controls.'
};

export function isModuleVisible(slug: string): boolean {
	return !(HIDDEN_MODULE_SLUGS as readonly string[]).includes(slug);
}

export function moduleDashboardPath(slug: string): string {
	switch (slug) {
		case 'content':
			return '/dashboard/modules/content';
		case 'newsletters':
			return '/dashboard/modules/newsletters';
		case 'links':
			return '/dashboard/modules/links';
		case 'business_card':
			return '/dashboard/modules/business-card';
		case 'commerce':
			return '/dashboard/modules/commerce';
		case 'community':
			return '/dashboard/modules/community';
		default:
			return `/dashboard/modules/${slug}`;
	}
}

export function isDashboardHomeActive(pathname: string): boolean {
	return pathname === '/dashboard' || pathname === '/dashboard/';
}

export function isModuleNavActive(pathname: string, slug: string): boolean {
	const base = moduleDashboardPath(slug);
	return pathname === base || pathname.startsWith(`${base}/`);
}

export type ModuleQuickLink = { label: string; href: string };

export const MODULE_QUICK_LINKS: Record<string, ModuleQuickLink[]> = {
	newsletters: [
		{ label: 'Campaigns', href: '/dashboard/modules/newsletters' },
		{ label: 'Subscribers', href: '/dashboard/modules/newsletters/subscribers' },
		{ label: 'Email capture', href: '/dashboard/modules/newsletters/capture' }
	],
	business_card: [
		{ label: 'Edit card & QR', href: '/dashboard/modules/business-card' },
		{ label: 'Lead feed', href: '/dashboard/modules/business-card/leads' }
	],
	content: [{ label: 'All entries', href: '/dashboard/modules/content' }],
	commerce: [{ label: 'Products', href: '/dashboard/modules/commerce' }],
	community: [{ label: 'Users', href: '/dashboard/modules/community' }]
};

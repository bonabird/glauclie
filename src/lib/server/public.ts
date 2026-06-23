import { serverApiUrl } from '$lib/server/env';
import type { Product } from '$lib/server/tenant';

export type PublicLinkPageData = {
	slug: string;
	page: {
		title: string;
		bio: string;
		avatar_url: string | null;
		theme: {
			background_color: string;
			text_color: string;
			accent_color: string;
			font_family: string;
		};
		view_count: number;
	};
	links: {
		id: string;
		label: string;
		url: string;
		icon: string;
		action_type: string;
		action_config: Record<string, unknown>;
		click_count: number;
	}[];
	tenant: {
		slug: string;
		business_name: string;
		logo_url: string | null;
	};
	products: Product[];
};

export async function fetchPublicLinkPage(tenantSlug: string): Promise<PublicLinkPageData | null> {
	try {
		const res = await fetch(
			serverApiUrl(`/api/v1/public/${encodeURIComponent(tenantSlug)}/links`)
		);
		if (!res.ok) return null;
		const data = (await res.json()) as PublicLinkPageData;
		data.products ??= [];
		return data;
	} catch {
		return null;
	}
}

export type PublicCardData = {
	card: Record<string, unknown>;
};

export async function fetchPublicCard(tenantSlug: string): Promise<PublicCardData | null> {
	try {
		const res = await fetch(
			serverApiUrl(`/api/v1/public/${encodeURIComponent(tenantSlug)}/card`)
		);
		if (!res.ok) return null;
		return (await res.json()) as PublicCardData;
	} catch {
		return null;
	}
}

export async function fetchPublicLinkPageByDomain(host: string): Promise<PublicLinkPageData | null> {
	try {
		const res = await fetch(
			serverApiUrl(`/api/v1/public/links/by-domain?host=${encodeURIComponent(host)}`)
		);
		if (!res.ok) return null;
		const data = (await res.json()) as PublicLinkPageData;
		data.products ??= [];
		return data;
	} catch {
		return null;
	}
}

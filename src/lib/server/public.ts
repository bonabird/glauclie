import { env } from '$env/dynamic/private';

const base = () => env.API_INTERNAL_URL ?? 'http://localhost:8080';

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
};

export async function fetchPublicLinkPage(tenantSlug: string): Promise<PublicLinkPageData | null> {
	try {
		const res = await fetch(
			`${base()}/api/v1/public/${encodeURIComponent(tenantSlug)}/links`
		);
		if (!res.ok) return null;
		return (await res.json()) as PublicLinkPageData;
	} catch {
		return null;
	}
}

export async function fetchPublicLinkPageByDomain(host: string): Promise<PublicLinkPageData | null> {
	try {
		const res = await fetch(
			`${base()}/api/v1/public/links/by-domain?host=${encodeURIComponent(host)}`
		);
		if (!res.ok) return null;
		return (await res.json()) as PublicLinkPageData;
	} catch {
		return null;
	}
}

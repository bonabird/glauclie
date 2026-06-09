import type { BrandColors, SocialLink } from '$lib/types';

const DEFAULT_BRAND_COLORS: BrandColors = {
	background: '#00043c',
	text: '#ffffff',
	primary: '#0753b5',
	secondary: '#010f5a'
};

export type ParsedPublicCard = {
	firstName: string;
	surname: string;
	legacyName: string;
	displayName: string;
	role: string;
	email: string;
	phone: string;
	website: string;
	logoUrl: string | null;
	socialLinks: SocialLink[];
	cardLinks: { label: string; url: string; icon?: string }[];
	brandColors: BrandColors;
};

export function joinFullName(first: string, surname: string, legacy = ''): string {
	const full = [first.trim(), surname.trim()].filter(Boolean).join(' ');
	return full || legacy.trim();
}

function parseSocialLinks(raw: unknown): SocialLink[] {
	if (Array.isArray(raw)) return raw as SocialLink[];
	if (typeof raw === 'string' && raw) return JSON.parse(raw);
	return [];
}

function parseBrandColors(raw: unknown): BrandColors {
	if (typeof raw === 'object' && raw) {
		return { ...DEFAULT_BRAND_COLORS, ...(raw as BrandColors) };
	}
	if (typeof raw === 'string' && raw) {
		return { ...DEFAULT_BRAND_COLORS, ...JSON.parse(raw) };
	}
	return DEFAULT_BRAND_COLORS;
}

export function parsePublicCard(raw: Record<string, unknown>): ParsedPublicCard {
	return {
		firstName: String(raw.first_name ?? ''),
		surname: String(raw.surname ?? ''),
		legacyName: String(raw.name ?? ''),
		displayName: String(raw.display_name ?? ''),
		role: String(raw.role ?? ''),
		email: String(raw.email ?? ''),
		phone: String(raw.phone ?? ''),
		website: String(raw.website ?? ''),
		logoUrl: (raw.logo_url as string | null) ?? null,
		socialLinks: parseSocialLinks(raw.social_links),
		cardLinks: Array.isArray(raw.links) ? raw.links : [],
		brandColors: parseBrandColors(raw.brand_colors)
	};
}

/** Icon names used across the app (inline SVGs — no icon package). */
export type IconName =
	| 'home'
	| 'content'
	| 'chart'
	| 'mail'
	| 'link'
	| 'id-card'
	| 'cart'
	| 'users'
	| 'user'
	| 'default'
	| 'lock'
	| 'bell'
	| 'chevron-up'
	| 'chevron-down'
	| 'chevron-left'
	| 'arrow-right'
	| 'x'
	| 'globe'
	| 'star'
	| 'phone'
	| 'music';

export const MODULE_ICON_NAMES: Record<string, IconName> = {
	content: 'content',
	analytics: 'chart',
	newsletters: 'mail',
	links: 'link',
	business_card: 'id-card',
	commerce: 'cart',
	community: 'users'
};

/** Optional icons for link-in-bio buttons (stored as icon name in DB). */
export const LINK_ICON_OPTIONS: IconName[] = [
	'link',
	'globe',
	'mail',
	'phone',
	'star',
	'music',
	'cart',
	'users'
];

export function isIconName(value: string): value is IconName {
	return (
		[
			'home',
			'content',
			'chart',
			'mail',
			'link',
			'id-card',
			'cart',
			'users',
			'user',
			'default',
			'lock',
			'bell',
			'chevron-up',
			'chevron-down',
			'chevron-left',
			'arrow-right',
			'x',
			'globe',
			'star',
			'phone',
			'music'
		] as string[]
	).includes(value);
}

/** Maps legacy emoji icon values stored in the DB to icon names. */
const LEGACY_EMOJI_ICONS: Record<string, IconName> = {
	'🔗': 'link',
	'🌐': 'globe',
	'✉️': 'mail',
	'✉': 'mail',
	'📧': 'mail',
	'📞': 'phone',
	'⭐': 'star',
	'🎵': 'music',
	'🛒': 'cart',
	'👥': 'users'
};

export function resolveIconName(value: string | null | undefined): IconName | null {
	if (!value) return null;
	if (isIconName(value)) return value;
	return LEGACY_EMOJI_ICONS[value] ?? null;
}

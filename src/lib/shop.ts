import { env } from '$env/dynamic/public';

export const SHOP_CURRENCIES = [
	{ code: 'eur', label: 'EUR — Euro (€)' }
] as const;

export type ShopCurrencyCode = (typeof SHOP_CURRENCIES)[number]['code'];

const ALLOWED = new Set<string>(SHOP_CURRENCIES.map((c) => c.code));

/** Map free-text or legacy values to a supported ISO 4217 code. */
export function normalizeCurrencyCode(currency: string): ShopCurrencyCode {
	const c = currency.trim().toLowerCase();
	if (c === 'euro') return 'eur';
	if (ALLOWED.has(c)) return c as ShopCurrencyCode;
	return 'eur';
}

export function stripePublishableKey(): string {
	return env.PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? '';
}

export function formatPrice(cents: number, currency: string): string {
	const code = normalizeCurrencyCode(currency).toUpperCase();
	try {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: code
		}).format(cents / 100);
	} catch {
		return `${(cents / 100).toFixed(2)} ${code}`;
	}
}

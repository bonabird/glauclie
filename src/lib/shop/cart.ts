export type CartItem = {
	id: string;
	slug: string;
	name: string;
	price_cents: number;
	currency: string;
	image_url: string | null;
	quantity: number;
};

const keyFor = (tenantSlug: string) => `glaucidae:${tenantSlug}:cart`;

export function readCart(tenantSlug: string): CartItem[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const parsed = JSON.parse(localStorage.getItem(keyFor(tenantSlug)) ?? '[]') as CartItem[];
		return Array.isArray(parsed) ? parsed.filter((item) => item.id && item.quantity > 0) : [];
	} catch {
		return [];
	}
}

export function writeCart(tenantSlug: string, items: CartItem[]) {
	localStorage.setItem(keyFor(tenantSlug), JSON.stringify(items.filter((item) => item.quantity > 0)));
}

export function addToCart(tenantSlug: string, item: Omit<CartItem, 'quantity'>, quantity = 1) {
	const items = readCart(tenantSlug);
	const existing = items.find((cartItem) => cartItem.id === item.id);
	if (existing) {
		existing.quantity += quantity;
	} else {
		items.push({ ...item, quantity });
	}
	writeCart(tenantSlug, items);
	return items;
}

export function cartCount(tenantSlug: string) {
	return readCart(tenantSlug).reduce((sum, item) => sum + item.quantity, 0);
}

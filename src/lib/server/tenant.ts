import { serverApiUrl } from '$lib/server/env';
import type { PublicTenant } from '$lib/types';

export async function fetchTenantByDomain(host: string): Promise<PublicTenant | null> {
	try {
		const res = await fetch(
			serverApiUrl(`/api/v1/public/tenant-by-domain?host=${encodeURIComponent(host)}`)
		);
		if (!res.ok) return null;
		return (await res.json()) as PublicTenant;
	} catch {
		return null;
	}
}

export async function fetchTenantBySlug(slug: string): Promise<PublicTenant | null> {
	try {
		const res = await fetch(
			serverApiUrl(`/api/v1/public/tenant-by-domain?host=${encodeURIComponent(slug)}`)
		);
		if (!res.ok) return null;
		return (await res.json()) as PublicTenant;
	} catch {
		return null;
	}
}

export async function fetchProducts(tenantSlug: string) {
	const res = await fetch(
		serverApiUrl(`/api/v1/public/${encodeURIComponent(tenantSlug)}/products`)
	);
	if (!res.ok) return [];
	const data = (await res.json()) as { products: Product[] };
	return data.products ?? [];
}

export async function fetchProduct(tenantSlug: string, slug: string) {
	const res = await fetch(
		serverApiUrl(
			`/api/v1/public/${encodeURIComponent(tenantSlug)}/products/${encodeURIComponent(slug)}`
		)
	);
	if (!res.ok) return null;
	return (await res.json()) as Product;
}

export type Product = {
	id: string;
	tenant_id: string;
	name: string;
	slug: string;
	description: string;
	price_cents: number;
	currency: string;
	image_url: string | null;
	media: { thumbnail_url: string; full_url: string; position: number }[];
	categories: string[];
};

export type OrderDetail = {
	id: string;
	status: string;
	product_name: string;
	product_slug: string;
	amount_cents: number;
	currency: string;
	download_token: string | null;
	items: OrderItem[];
};

export type OrderItem = {
	id: string;
	order_id: string;
	product_id: string;
	quantity: number;
	unit_price_cents: number;
	currency: string;
	product_name: string;
	product_slug: string;
	download_token: string | null;
};

export async function fetchOrder(orderId: string): Promise<OrderDetail | null> {
	const res = await fetch(serverApiUrl(`/api/v1/ecommerce/orders/${encodeURIComponent(orderId)}`), {
		credentials: 'include'
	});
	if (!res.ok) return null;
	return (await res.json()) as OrderDetail;
}

export type CheckoutSessionResult = {
	order_id: string;
	session: string;
	checkout_url: string;
};

export async function createCheckoutSession(
	cookie: string | null,
	tenantId: string,
	items: { product_id: string; quantity: number }[]
): Promise<{ result?: CheckoutSessionResult; status: number; error?: string }> {
	const res = await fetch(serverApiUrl('/api/v1/ecommerce/checkout-session'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(cookie ? { cookie } : {})
		},
		body: JSON.stringify({ tenant_id: tenantId, items })
	});
	const body = (await res.json().catch(() => ({}))) as CheckoutSessionResult & { error?: string };
	if (!res.ok) {
		return { status: res.status, error: body.error ?? 'Checkout failed' };
	}
	return { status: res.status, result: body };
}

export type CheckoutSessionDetail = {
	order: OrderDetail;
	client_secret?: string;
	status: string;
};

export async function fetchCheckoutSession(
	cookie: string | null,
	token: string
): Promise<CheckoutSessionDetail | null> {
	const res = await fetch(
		serverApiUrl(`/api/v1/ecommerce/checkout-session/${encodeURIComponent(token)}`),
		{ headers: cookie ? { cookie } : {} }
	);
	if (!res.ok) return null;
	return (await res.json()) as CheckoutSessionDetail;
}

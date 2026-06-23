import type { CommerceProduct } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { modules } = await parent();
	const mod = modules.find((m) => m.slug === 'commerce');

	if (!mod || mod.locked) {
		return { products: [] as CommerceProduct[], productsApiUrl: '', loadError: '' };
	}

	let products: CommerceProduct[] = [];
	let productsApiUrl = '';
	let loadError = '';

	try {
		const res = await fetch('/api/v1/commerce/products');
		if (res.ok) {
			const body = (await res.json()) as { products?: CommerceProduct[] };
			products = body.products ?? [];
		} else {
			const body = (await res.json().catch(() => ({}))) as { error?: string };
			loadError = body.error ?? `Failed to load products (${res.status})`;
		}
	} catch {
		loadError = 'Failed to load products';
	}

	try {
		const res = await fetch('/api/v1/commerce/products-api-url');
		if (res.ok) {
			const body = (await res.json()) as { url?: string };
			productsApiUrl = body.url ?? '';
		}
	} catch {
		// API helper link is optional
	}

	return { products, productsApiUrl, loadError };
};

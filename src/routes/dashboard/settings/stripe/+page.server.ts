import type { StripeConnectStatus } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	let status: StripeConnectStatus | null = null;
	let loadError = '';
	try {
		const res = await fetch('/api/v1/ecommerce/stripe-connect/status');
		if (res.ok) {
			status = (await res.json()) as StripeConnectStatus;
		} else {
			const body = (await res.json().catch(() => ({}))) as { error?: string };
			loadError = body.error ?? 'Failed to load Stripe status';
		}
	} catch {
		loadError = 'Failed to load Stripe status';
	}
	return { status, loadError };
};

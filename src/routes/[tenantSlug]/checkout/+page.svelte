<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { apiUrl } from '$lib/env/public';
	import { stripePublishableKey, formatPrice } from '$lib/shop';
	import { writeCart } from '$lib/shop/cart';
	import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';

	let { data } = $props();

	let error = $state('');
	let loading = $state(false);
	let stripe: Stripe | null = $state(null);
	let elements: StripeElements | null = $state(null);
	let pollTimer: ReturnType<typeof setInterval> | null = null;
	let checkout = $state<typeof data.checkout | null>(null);

	const publishableKey = stripePublishableKey();
	const order = $derived(checkout?.order ?? data.checkout.order);

	$effect(() => {
		checkout ??= data.checkout;
	});

	onMount(async () => {
		checkout ??= data.checkout;
		if (order.status === 'paid') return;
		if (!publishableKey || !checkout?.client_secret) {
			error = 'Payments are not configured.';
			return;
		}
		stripe = await loadStripe(publishableKey);
		if (!stripe) {
			error = 'Payments are not available.';
			return;
		}
		elements = stripe.elements({ clientSecret: checkout.client_secret });
		elements.create('payment').mount('#payment-element');
		pollTimer = setInterval(refreshCheckout, 2000);
	});

	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
	});

	async function refreshCheckout() {
		// Do not send platform cookies: the session token is the bearer credential,
		// and an unrelated platform session would fail the ownership check.
		const res = await fetch(
			apiUrl(`/api/v1/ecommerce/checkout-session/${encodeURIComponent(data.sessionToken)}`),
			{ credentials: 'omit' }
		);
		if (res.ok) {
			checkout = await res.json();
		}
	}

	$effect(() => {
		if (order.status === 'paid' && pollTimer) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
		if (order.status === 'paid') {
			writeCart(data.tenantSlug, []);
		}
	});

	async function confirmPayment(e: Event) {
		e.preventDefault();
		if (!stripe || !elements || !checkout?.client_secret) return;
		loading = true;
		error = '';
		const { error: stripeError } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/${data.tenantSlug}/checkout?session=${encodeURIComponent(data.sessionToken)}`
			},
			redirect: 'if_required'
		});
		if (stripeError) {
			error = stripeError.message ?? 'Payment failed';
			loading = false;
			return;
		}
		await refreshCheckout();
		loading = false;
		if (order.status === 'paid') {
			await goto(`/${data.tenantSlug}/checkout?session=${encodeURIComponent(data.sessionToken)}`);
		}
	}
</script>

<svelte:head>
	<title>Checkout</title>
</svelte:head>

<div class="mx-auto max-w-lg">
	<h1 class="mb-2 text-2xl font-semibold" style="color: var(--primary);">Checkout</h1>

	<div class="mb-6 rounded-xl p-4" style="background: var(--card);">
		{#each order.items as item}
			<div class="flex justify-between gap-4 py-2">
				<div>
					<p class="font-medium">{item.product_name}</p>
					<p class="text-sm opacity-70">Qty {item.quantity}</p>
				</div>
				<p class="font-medium">{formatPrice(item.unit_price_cents * item.quantity, item.currency)}</p>
			</div>
		{/each}
		<div class="mt-3 flex justify-between border-t pt-3 font-semibold" style="border-color: var(--background);">
			<span>Total</span>
			<span>{formatPrice(order.amount_cents, order.currency)}</span>
		</div>
	</div>

	{#if order.status === 'paid'}
		<h2 class="text-xl font-semibold" style="color: var(--primary);">Thank you!</h2>
		<p class="mt-2 opacity-80">Your payment was successful.</p>
		{#each order.items as item}
			{#if item.download_token}
				<a
					href={apiUrl(`/api/v1/ecommerce/downloads/${item.download_token}`)}
					class="mt-4 block rounded-lg px-4 py-3 text-center font-medium text-white"
					style="background-color: var(--accent);"
				>
					Download {item.product_name}
				</a>
			{/if}
		{/each}
	{:else}
		<form class="space-y-4" onsubmit={confirmPayment}>
			<div id="payment-element"></div>
			{#if error}
				<p class="text-sm text-red-600">{error}</p>
			{/if}
			<button
				type="submit"
				disabled={loading || !checkout?.client_secret}
				class="w-full rounded-lg px-4 py-3 font-medium text-white disabled:opacity-50"
				style="background-color: var(--primary);"
			>
				{loading ? 'Processing...' : 'Pay now'}
			</button>
		</form>
	{/if}
</div>

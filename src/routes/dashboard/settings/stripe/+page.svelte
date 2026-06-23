<script lang="ts">
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { data } = $props();

	let loading = $state(false);
	let error = $state('');

	$effect(() => {
		error ||= data.loadError ?? '';
	});

	async function connectStripe() {
		loading = true;
		error = '';
		try {
			const res = await api<{ url: string }>('/api/v1/ecommerce/stripe-connect/url', {
				method: 'POST'
			});
			window.location.href = res.url;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to start Stripe Connect';
		} finally {
			loading = false;
		}
	}
</script>

<Card class="max-w-2xl">
	<h1 class="mb-2 text-xl font-semibold text-midnight">Stripe Connect</h1>
	<p class="mb-6 text-sm text-indigo">
		Connect your own Stripe account to sell digital products. Funds go directly to your Stripe balance.
	</p>

	{#if error}
		<p class="mb-4 text-sm text-danger">{error}</p>
	{/if}

	{#if data.status?.connected}
		<div class="mb-6 rounded-lg bg-sky-mist/60 p-4 text-sm text-midnight">
			<p class="font-medium">Stripe account connected</p>
			<p class="mt-1 text-indigo">Account: {data.status.account_id}</p>
			<p class="mt-1 text-indigo">
				Charges: {data.status.charges_enabled ? 'Enabled' : 'Pending onboarding or restricted'}
			</p>
		</div>
	{:else}
		<div class="mb-6 rounded-lg bg-sky-mist/60 p-4 text-sm text-indigo">
			Connect Stripe before publishing buy buttons. Checkout is gated until Stripe reports that charges are enabled.
		</div>
	{/if}

	<Button onclick={connectStripe} disabled={loading}>
		{loading ? 'Opening Stripe…' : data.status?.connected ? 'Reconnect Stripe' : 'Connect Stripe'}
	</Button>
</Card>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api, ApiError } from '$lib/api/client';
	import Card from '$lib/components/ui/Card.svelte';

	let status = $state('Connecting Stripe…');
	let error = $state('');

	onMount(async () => {
		const code = $page.url.searchParams.get('code');
		const stripeError = $page.url.searchParams.get('error_description') ?? $page.url.searchParams.get('error');
		if (stripeError) {
			error = stripeError;
			status = 'Stripe connection failed';
			return;
		}
		if (!code) {
			error = 'Missing Stripe authorization code';
			status = 'Stripe connection failed';
			return;
		}
		try {
			await api('/api/v1/ecommerce/stripe-connect/callback', {
				method: 'POST',
				json: { code }
			});
			status = 'Stripe connected';
			await goto('/dashboard/settings/stripe');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to connect Stripe';
			status = 'Stripe connection failed';
		}
	});
</script>

<Card class="max-w-xl">
	<h1 class="mb-2 text-xl font-semibold text-midnight">{status}</h1>
	{#if error}
		<p class="text-sm text-danger">{error}</p>
		<a href="/dashboard/settings/stripe" class="mt-4 inline-block text-sm text-ocean hover:underline">
			Back to Stripe settings
		</a>
	{:else}
		<p class="text-sm text-indigo">Please wait while we finish setup.</p>
	{/if}
</Card>

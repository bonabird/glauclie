<script lang="ts">
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { CommunicationPreferences } from '$lib/types';

	let prefs = $state<CommunicationPreferences>({
		newsletter: true,
		product_updates: true,
		platform_announcements: true
	});
	let error = $state('');
	let success = $state('');
	let loading = $state(true);

	$effect(() => {
		api<CommunicationPreferences>('/api/v1/settings/communications')
			.then((d) => {
				prefs = d;
			})
			.finally(() => (loading = false));
	});

	async function save() {
		error = '';
		success = '';
		try {
			await api('/api/v1/settings/communications', { method: 'PATCH', json: prefs });
			success = 'Preferences saved';
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Save failed';
		}
	}
</script>

<Card class="max-w-xl">
	<h1 class="mb-4 text-xl font-semibold text-midnight">Communication preferences</h1>
	<p class="mb-4 text-sm text-indigo">GDPR-compliant opt-outs are honoured immediately.</p>

	{#if loading}
		<p class="text-indigo">Loading…</p>
	{:else}
		<ul class="space-y-3">
			<li class="flex items-center justify-between rounded-lg bg-periwinkle/40 px-3 py-2">
				<span class="text-sm">Newsletter</span>
				<input type="checkbox" bind:checked={prefs.newsletter} />
			</li>
			<li class="flex items-center justify-between rounded-lg bg-periwinkle/40 px-3 py-2">
				<span class="text-sm">Product updates</span>
				<input type="checkbox" bind:checked={prefs.product_updates} />
			</li>
			<li class="flex items-center justify-between rounded-lg bg-periwinkle/40 px-3 py-2">
				<span class="text-sm">Platform announcements</span>
				<input type="checkbox" bind:checked={prefs.platform_announcements} />
			</li>
		</ul>
		{#if error}
			<p class="mt-2 text-sm text-danger">{error}</p>
		{/if}
		{#if success}
			<p class="mt-2 text-sm text-success">{success}</p>
		{/if}
		<Button class="mt-4" onclick={save}>Save preferences</Button>
	{/if}
</Card>

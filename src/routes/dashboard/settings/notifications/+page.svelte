<script lang="ts">
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { NotificationPreference } from '$lib/types';

	let prefs = $state<NotificationPreference[]>([]);
	let error = $state('');
	let success = $state('');
	let loading = $state(true);

	const labels: Record<string, string> = {
		new_subscriber: 'New subscriber',
		new_order: 'New order',
		new_member: 'New community member',
		new_card_scan: 'New card scan',
		post_published: 'Post published',
		social_post_failed: 'Social post failed',
		campaign_sent: 'Campaign sent'
	};

	$effect(() => {
		api<{ preferences: NotificationPreference[] }>('/api/v1/settings/notifications')
			.then((d) => {
				prefs = d.preferences;
			})
			.finally(() => (loading = false));
	});

	async function save() {
		error = '';
		success = '';
		try {
			await api('/api/v1/settings/notifications', {
				method: 'PATCH',
				json: { preferences: prefs }
			});
			success = 'Preferences saved';
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Save failed';
		}
	}
</script>

<Card class="max-w-xl">
	<h1 class="mb-4 text-xl font-semibold text-midnight">Notification preferences</h1>
	<p class="mb-4 text-sm text-indigo">Choose which events trigger in-app notifications.</p>

	{#if loading}
		<p class="text-indigo">Loading…</p>
	{:else}
		<ul class="space-y-3">
			{#each prefs as p, i (p.event_type)}
				<li class="flex items-center justify-between rounded-lg bg-periwinkle/40 px-3 py-2">
					<span class="text-sm text-midnight">{labels[p.event_type] ?? p.event_type}</span>
					<input
						type="checkbox"
						checked={p.in_app_enabled}
						onchange={(e) => {
							prefs[i].in_app_enabled = (e.target as HTMLInputElement).checked;
						}}
					/>
				</li>
			{/each}
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

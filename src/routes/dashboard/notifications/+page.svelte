<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { api } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { Notification } from '$lib/types';

	let notifications = $state<Notification[]>([]);
	let loading = $state(true);

	async function load() {
		loading = true;
		const data = await api<{ notifications: Notification[] }>('/api/v1/notifications?limit=50');
		notifications = data.notifications;
		loading = false;
	}

	$effect(() => {
		load();
	});

	async function markRead(id: string) {
		await api(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
		await load();
		await invalidateAll();
	}

	async function markAllRead() {
		await api('/api/v1/notifications/read-all', { method: 'POST' });
		await load();
		await invalidateAll();
	}
</script>

<Card>
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-xl font-semibold text-midnight">Notifications</h1>
		<Button variant="secondary" onclick={markAllRead}>Mark all read</Button>
	</div>

	{#if loading}
		<p class="text-indigo">Loading…</p>
	{:else if notifications.length === 0}
		<p class="text-indigo">No notifications yet.</p>
	{:else}
		<ul class="divide-y divide-periwinkle">
			{#each notifications as n (n.id)}
				<li class="py-4 {!n.read_at ? 'bg-periwinkle/20 -mx-2 px-2 rounded-lg' : ''}">
					<div class="flex items-start justify-between gap-4">
						<div>
							<p class="font-medium text-midnight">{n.title}</p>
							<p class="text-sm text-indigo">{n.body}</p>
							<p class="mt-1 text-xs text-indigo/70">
								{new Date(n.created_at).toLocaleString()} · {n.type}
							</p>
						</div>
						{#if !n.read_at}
							<button type="button" class="text-sm text-ocean shrink-0" onclick={() => markRead(n.id)}>
								Mark read
							</button>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</Card>

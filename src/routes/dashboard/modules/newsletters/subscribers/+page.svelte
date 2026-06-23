<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { api } from '$lib/api/client';
	import type { Subscriber } from '$lib/types';

	let subscribers = $state<Subscriber[]>([]);
	let loading = $state(true);

	async function load() {
		loading = true;
		const res = await api<{ subscribers: Subscriber[] }>('/api/v1/newsletters/subscribers');
		subscribers = res.subscribers;
		loading = false;
	}

	$effect(() => {
		load();
	});

	function status(sub: Subscriber) {
		return sub.unsubscribed_at ? 'Unsubscribed' : 'Active';
	}
</script>

<svelte:head>
	<title>Emails — Newsletters</title>
</svelte:head>

<div class="mb-6">
	<a href="/dashboard/modules/newsletters" class="text-sm text-ocean hover:underline">← Campaigns</a>
	<h1 class="mt-1 text-2xl font-semibold text-midnight">Emails</h1>
	<p class="text-sm text-indigo">Mailing list subscribers, including sign-up opt-ins.</p>
</div>

{#if loading}
	<p class="text-indigo">Loading…</p>
{:else if subscribers.length === 0}
	<Card>
		<p class="text-indigo">No subscribers yet. Add the email capture widget to your site.</p>
		<Button variant="secondary" class="mt-4" onclick={() => goto('/dashboard/modules/newsletters/capture')}>
			Get embed snippet
		</Button>
	</Card>
{:else}
	<Card class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead>
				<tr class="border-b border-sky-mist text-indigo">
					<th class="pb-2 pr-4">Email</th>
					<th class="pb-2 pr-4">Status</th>
					<th class="pb-2 pr-4">Consented</th>
					<th class="pb-2">Unsubscribed</th>
				</tr>
			</thead>
			<tbody>
				{#each subscribers as sub (sub.id)}
					<tr class="border-b border-sky-mist/50">
						<td class="py-2 pr-4 font-medium">{sub.email}</td>
						<td class="py-2 pr-4">{status(sub)}</td>
						<td class="py-2 pr-4">{new Date(sub.consent_at).toLocaleString()}</td>
						<td class="py-2">
							{sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleString() : '—'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Card>
{/if}

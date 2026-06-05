<script lang="ts">
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { joinFullName } from '$lib/business-card';
	import type { CardLead } from '$lib/types';

	let leads = $state<CardLead[]>([]);
	let loading = $state(true);
	let msg = $state('');

	async function load() {
		loading = true;
		const res = await api<{ leads: CardLead[] }>('/api/v1/business-card/leads');
		leads = res.leads;
		loading = false;
	}

	$effect(() => {
		load();
	});

	async function addToList(lead: CardLead) {
		msg = '';
		try {
			await api(`/api/v1/business-card/leads/${lead.id}/add-subscriber`, { method: 'POST' });
			msg = `Added ${lead.email} to subscribers.`;
			await load();
		} catch (err) {
			msg = err instanceof ApiError ? err.message : 'Failed';
		}
	}
</script>

<svelte:head>
	<title>Card leads — Dashboard</title>
</svelte:head>

<div class="mb-6">
	<a href="/dashboard/modules/business-card" class="text-sm text-ocean hover:underline">← Business card</a>
	<h1 class="mt-1 text-2xl font-semibold text-midnight">Lead feed</h1>
	<p class="text-sm text-indigo">Contacts who scanned your QR and consented to share details.</p>
</div>

{#if msg}
	<p class="mb-4 text-sm text-success">{msg}</p>
{/if}

{#if loading}
	<p class="text-indigo">Loading…</p>
{:else if leads.length === 0}
	<Card><p class="text-indigo">No leads yet. Share your QR code to start capturing contacts.</p></Card>
{:else}
	<Card class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead>
				<tr class="border-b border-sky-mist text-indigo">
					<th class="pb-2 pr-4">When</th>
					<th class="pb-2 pr-4">Name</th>
					<th class="pb-2 pr-4">Email</th>
					<th class="pb-2 pr-4">Phone</th>
					<th class="pb-2 pr-4">Location</th>
					<th class="pb-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each leads as lead (lead.id)}
					<tr class="border-b border-sky-mist/50">
						<td class="py-2 pr-4 whitespace-nowrap">{new Date(lead.created_at).toLocaleString()}</td>
						<td class="py-2 pr-4 font-medium"
							>{joinFullName(lead.first_name, lead.surname, lead.name)}</td
						>
						<td class="py-2 pr-4">{lead.email}</td>
						<td class="py-2 pr-4">{lead.phone || '—'}</td>
						<td class="py-2 pr-4">{lead.location_label ?? '—'}</td>
						<td class="py-2">
							{#if lead.added_to_subscribers}
								<span class="text-success">On mailing list</span>
							{:else}
								<Button variant="secondary" onclick={() => addToList(lead)}>
									Add to email list
								</Button>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Card>
{/if}

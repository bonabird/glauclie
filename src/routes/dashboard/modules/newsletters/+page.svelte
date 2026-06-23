<script lang="ts">
	import CampaignStatusBadge from '$lib/components/newsletter/CampaignStatusBadge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api/client';
	import type { Module, NewsletterCampaign } from '$lib/types';

	let { data } = $props();

	const mod = $derived(data.modules.find((m: Module) => m.slug === 'newsletters'));
	let campaigns = $state<NewsletterCampaign[]>([]);
	let loading = $state(true);

	async function load() {
		loading = true;
		const res = await api<{ campaigns: NewsletterCampaign[] }>('/api/v1/newsletters/campaigns');
		campaigns = res.campaigns;
		loading = false;
	}

	async function createCampaign() {
		const c = await api<NewsletterCampaign>('/api/v1/newsletters/campaigns', { method: 'POST' });
		goto(`/dashboard/modules/newsletters/${c.id}`);
	}

	$effect(() => {
		if (mod && !mod.locked) load();
	});
</script>

{#if mod?.locked}
	<Card class="text-center">
		<p class="mb-2 text-lg font-semibold text-midnight">Newsletters is not available</p>
		<p class="text-sm text-indigo">This module is not enabled for your account yet.</p>
	</Card>
{:else}
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold text-midnight">Newsletters</h1>
			<p class="text-sm text-indigo">Write campaigns, capture subscribers, and track performance.</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button variant="secondary" onclick={() => goto('/dashboard/customers')}>
				Accounts
			</Button>
			<Button variant="secondary" onclick={() => goto('/dashboard/modules/newsletters/subscribers')}>
				Emails
			</Button>
			<Button variant="secondary" onclick={() => goto('/dashboard/modules/newsletters/capture')}>
				Email capture
			</Button>
			<Button variant="accent" onclick={createCampaign}>New campaign</Button>
		</div>
	</div>

	{#if loading}
		<p class="text-indigo">Loading…</p>
	{:else if campaigns.length === 0}
		<Card>
			<p class="text-indigo">No campaigns yet. Create your first newsletter.</p>
		</Card>
	{:else}
		<div class="space-y-2">
			{#each campaigns as campaign (campaign.id)}
				<a
					href="/dashboard/modules/newsletters/{campaign.id}"
					class="flex items-center justify-between rounded-xl bg-sky-mist px-4 py-3 transition hover:bg-sky-mist/80"
				>
					<div>
						<p class="font-medium text-midnight">{campaign.subject || 'Untitled campaign'}</p>
						<p class="text-xs text-indigo">
							{#if campaign.sent_at}
								Sent {new Date(campaign.sent_at).toLocaleDateString()} · {campaign.sent_count} recipients
							{:else}
								Draft · updated {new Date(campaign.updated_at).toLocaleDateString()}
							{/if}
						</p>
					</div>
					<CampaignStatusBadge status={campaign.status} />
				</a>
			{/each}
		</div>
	{/if}
{/if}

<script lang="ts">
	import { api } from '$lib/api/client';
	import Icon from '$lib/components/icons/Icon.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { resolveIconName } from '$lib/icons';
	import type {
		CardAnalyticsSummary,
		CardScan,
		LinkAnalyticsSummary,
		LinkItem,
		Module,
		NewsletterAnalyticsSummary,
		NewsletterCampaign
	} from '$lib/types';

	let { data } = $props();

	const mod = $derived(data.modules.find((m: Module) => m.slug === 'analytics'));
	let newsletterSummary = $state<NewsletterAnalyticsSummary | null>(null);
	let campaigns = $state<NewsletterCampaign[]>([]);
	let linkSummary = $state<LinkAnalyticsSummary | null>(null);
	let links = $state<LinkItem[]>([]);
	let cardSummary = $state<CardAnalyticsSummary | null>(null);
	let scanTimeline = $state<CardScan[]>([]);
	let loading = $state(true);

	async function load() {
		loading = true;
		try {
			const [nl, lk, bc] = await Promise.all([
				api<{ summary: NewsletterAnalyticsSummary; campaigns: NewsletterCampaign[] }>(
					'/api/v1/analytics/newsletters'
				),
				api<{ summary: LinkAnalyticsSummary; links: LinkItem[] }>('/api/v1/analytics/links'),
				api<{ summary: CardAnalyticsSummary; timeline: CardScan[] }>(
					'/api/v1/analytics/business-card'
				)
			]);
			newsletterSummary = nl.summary;
			campaigns = nl.campaigns;
			linkSummary = lk.summary;
			links = lk.links;
			cardSummary = bc.summary;
			scanTimeline = bc.timeline;
		} catch {
			newsletterSummary = null;
			campaigns = [];
			linkSummary = null;
			links = [];
			cardSummary = null;
			scanTimeline = [];
		}
		loading = false;
	}

	$effect(() => {
		if (mod && !mod.locked) load();
	});

	function rate(num: number, denom: number) {
		if (!denom) return '0%';
		return ((num / denom) * 100).toFixed(1) + '%';
	}
</script>

{#if mod?.locked}
	<Card class="text-center">
		<p class="mb-2 text-lg font-semibold text-midnight">Analytics is not available</p>
		<p class="text-sm text-indigo">This module is not enabled for your account yet.</p>
	</Card>
{:else if loading}
	<p class="text-indigo">Loading…</p>
{:else}
	<h1 class="mb-6 text-2xl font-semibold text-midnight">Analytics</h1>

	<h2 class="mb-4 text-lg font-semibold text-midnight">Digital business card</h2>
	{#if cardSummary}
		<div class="mb-6 grid gap-4 sm:grid-cols-3">
			<Card>
				<p class="text-sm text-indigo">Total scans</p>
				<p class="text-2xl font-semibold">{cardSummary.total_scans}</p>
			</Card>
			<Card>
				<p class="text-sm text-indigo">Consent rate</p>
				<p class="text-2xl font-semibold">{cardSummary.consent_rate.toFixed(1)}%</p>
			</Card>
			<Card>
				<p class="text-sm text-indigo">Leads captured</p>
				<p class="text-2xl font-semibold">{cardSummary.total_leads}</p>
			</Card>
		</div>
		{#if scanTimeline.length > 0}
			<Card class="mb-10">
				<h3 class="mb-4 font-semibold text-midnight">Scan timeline</h3>
				<ul class="max-h-64 space-y-2 overflow-y-auto text-sm">
					{#each scanTimeline as scan (scan.id)}
						<li class="flex justify-between border-b border-sky-mist/50 py-2">
							<span>{new Date(scan.scanned_at).toLocaleString()}</span>
							<span class="text-indigo">
								{scan.location_label ?? 'Unknown location'}
								· {scan.consented ? 'Consented' : 'No consent'}
							</span>
						</li>
					{/each}
				</ul>
			</Card>
		{/if}
	{/if}

	<h2 class="mb-4 text-lg font-semibold text-midnight">Link in bio</h2>
	{#if linkSummary}
		<div class="mb-6 grid gap-4 sm:grid-cols-3">
			<Card>
				<p class="text-sm text-indigo">Page views</p>
				<p class="text-2xl font-semibold">{linkSummary.total_views}</p>
			</Card>
			<Card>
				<p class="text-sm text-indigo">Total link clicks</p>
				<p class="text-2xl font-semibold">{linkSummary.total_clicks}</p>
			</Card>
			<Card>
				<p class="text-sm text-indigo">Active links</p>
				<p class="text-2xl font-semibold">{linkSummary.link_count}</p>
			</Card>
		</div>
		{#if links.length > 0}
			<Card class="mb-10">
				<h3 class="mb-4 font-semibold text-midnight">Clicks per link</h3>
				<table class="w-full text-left text-sm">
					<thead>
						<tr class="border-b border-sky-mist text-indigo">
							<th class="pb-2 pr-4">Link</th>
							<th class="pb-2 pr-4">Type</th>
							<th class="pb-2">Clicks</th>
						</tr>
					</thead>
					<tbody>
						{#each links as link (link.id)}
							<tr class="border-b border-sky-mist/50">
								<td class="py-2 pr-4 font-medium">
									<span class="inline-flex items-center gap-2">
										{#if resolveIconName(link.icon)}
											<Icon name={resolveIconName(link.icon)!} class="h-4 w-4 shrink-0" />
										{/if}
										{link.label}
									</span>
								</td>
								<td class="py-2 pr-4 text-indigo">{link.action_type}</td>
								<td class="py-2">{link.click_count}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</Card>
		{/if}
	{/if}

	<h2 class="mb-4 text-lg font-semibold text-midnight">Newsletters</h2>
	{#if !newsletterSummary || newsletterSummary.total_campaigns === 0}
		<Card>
			<p class="text-sm text-indigo">No newsletter campaigns sent yet.</p>
		</Card>
	{:else}
		<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<p class="text-sm text-indigo">Active subscribers</p>
				<p class="text-2xl font-semibold">{newsletterSummary.active_subscribers}</p>
			</Card>
			<Card>
				<p class="text-sm text-indigo">Avg open rate</p>
				<p class="text-2xl font-semibold">{newsletterSummary.avg_open_rate.toFixed(1)}%</p>
			</Card>
			<Card>
				<p class="text-sm text-indigo">Avg click rate</p>
				<p class="text-2xl font-semibold">{newsletterSummary.avg_click_rate.toFixed(1)}%</p>
			</Card>
			<Card>
				<p class="text-sm text-indigo">Unsubscribes</p>
				<p class="text-2xl font-semibold">{newsletterSummary.total_unsubscribes}</p>
			</Card>
		</div>
		<Card>
			<h3 class="mb-4 font-semibold text-midnight">Campaign performance</h3>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead>
						<tr class="border-b border-sky-mist text-indigo">
							<th class="pb-2 pr-4">Subject</th>
							<th class="pb-2 pr-4">Sent</th>
							<th class="pb-2 pr-4">Open rate</th>
							<th class="pb-2 pr-4">Click rate</th>
							<th class="pb-2 pr-4">Bounces</th>
							<th class="pb-2">Unsubs</th>
						</tr>
					</thead>
					<tbody>
						{#each campaigns as c (c.id)}
							<tr class="border-b border-sky-mist/50">
								<td class="py-2 pr-4 font-medium">{c.subject}</td>
								<td class="py-2 pr-4">{c.sent_count}</td>
								<td class="py-2 pr-4">{rate(c.open_count, c.sent_count)}</td>
								<td class="py-2 pr-4">{rate(c.click_count, c.sent_count)}</td>
								<td class="py-2 pr-4">{c.bounce_count}</td>
								<td class="py-2">{c.unsubscribe_count}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>
	{/if}
{/if}

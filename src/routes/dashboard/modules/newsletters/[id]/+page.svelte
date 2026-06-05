<script lang="ts">
	import { page } from '$app/stores';
	import { api, ApiError } from '$lib/api/client';
	import MarkdownEditor from '$lib/components/cms/MarkdownEditor.svelte';
	import CampaignStatusBadge from '$lib/components/newsletter/CampaignStatusBadge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { AIGenerateResult, NewsletterCampaign } from '$lib/types';

	let campaign = $state<NewsletterCampaign | null>(null);
	let subject = $state('');
	let previewText = $state('');
	let body = $state('');
	let aiTopic = $state('');
	let aiBullets = $state('');
	let error = $state('');
	let saving = $state(false);
	let sending = $state(false);
	let generating = $state(false);

	const isDraft = $derived(campaign?.status === 'draft');

	async function load() {
		const c = await api<NewsletterCampaign>(`/api/v1/newsletters/campaigns/${$page.params.id}`);
		campaign = c;
		subject = c.subject;
		previewText = c.preview_text;
		body = c.body;
	}

	$effect(() => {
		load();
	});

	async function save() {
		if (!campaign || !isDraft) return;
		saving = true;
		error = '';
		try {
			await api(`/api/v1/newsletters/campaigns/${campaign.id}`, {
				method: 'PATCH',
				json: { subject, preview_text: previewText, body }
			});
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Save failed';
		} finally {
			saving = false;
		}
	}

	async function send() {
		if (!campaign || !isDraft) return;
		if (!confirm('Send this campaign to all active subscribers?')) return;
		await save();
		sending = true;
		error = '';
		try {
			campaign = await api<NewsletterCampaign>(`/api/v1/newsletters/campaigns/${campaign.id}/send`, {
				method: 'POST'
			});
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Send failed';
		} finally {
			sending = false;
		}
	}

	async function generateAI() {
		generating = true;
		error = '';
		try {
			const bullets = aiBullets
				.split('\n')
				.map((l) => l.trim())
				.filter(Boolean);
			const result = await api<AIGenerateResult>('/api/v1/newsletters/ai/generate', {
				method: 'POST',
				json: { topic: aiTopic, bullet_points: bullets }
			});
			subject = result.subject;
			previewText = result.preview_text;
			body = result.body;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'AI generation failed';
		} finally {
			generating = false;
		}
	}

	function openRate(c: NewsletterCampaign) {
		if (!c.sent_count) return '0';
		return ((c.open_count / c.sent_count) * 100).toFixed(1);
	}

	function clickRate(c: NewsletterCampaign) {
		if (!c.sent_count) return '0';
		return ((c.click_count / c.sent_count) * 100).toFixed(1);
	}
</script>

<svelte:head>
	<title>{subject || 'Campaign'} — Newsletters</title>
</svelte:head>

{#if !campaign}
	<p class="text-indigo">Loading…</p>
{:else}
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<a href="/dashboard/modules/newsletters" class="text-sm text-ocean hover:underline">← Campaigns</a>
			<h1 class="mt-1 text-2xl font-semibold text-midnight">{subject || 'Untitled campaign'}</h1>
			<CampaignStatusBadge status={campaign.status} />
		</div>
		{#if isDraft}
			<div class="flex gap-2">
				<Button variant="secondary" onclick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
				<Button variant="accent" onclick={send} disabled={sending}>
					{sending ? 'Sending…' : 'Send campaign'}
				</Button>
			</div>
		{/if}
	</div>

	{#if error}
		<p class="mb-4 text-sm text-danger">{error}</p>
	{/if}

	{#if campaign.status === 'sent'}
		<Card class="mb-6">
			<h2 class="mb-3 font-semibold text-midnight">Campaign stats</h2>
			<dl class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
				<div><dt class="text-indigo">Sent</dt><dd class="font-medium">{campaign.sent_count}</dd></div>
				<div><dt class="text-indigo">Open rate</dt><dd class="font-medium">{openRate(campaign)}%</dd></div>
				<div><dt class="text-indigo">Click rate</dt><dd class="font-medium">{clickRate(campaign)}%</dd></div>
				<div><dt class="text-indigo">Bounces</dt><dd class="font-medium">{campaign.bounce_count}</dd></div>
				<div><dt class="text-indigo">Unsubscribes</dt><dd class="font-medium">{campaign.unsubscribe_count}</dd></div>
			</dl>
		</Card>
	{/if}

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="space-y-4 lg:col-span-2">
			<Card>
				<Input id="campaign-subject" label="Subject" bind:value={subject} disabled={!isDraft} />
				<Input id="campaign-preview" label="Preview text" bind:value={previewText} disabled={!isDraft} />
			</Card>
			<Card>
				<p class="mb-2 text-sm font-medium text-midnight">Body (Markdown)</p>
				{#if isDraft}
					<MarkdownEditor bind:value={body} />
				{:else}
					<pre class="whitespace-pre-wrap text-sm text-indigo">{body}</pre>
				{/if}
			</Card>
		</div>

		{#if isDraft}
			<Card>
				<h2 class="mb-3 font-semibold text-midnight">AI assist</h2>
				<p class="mb-3 text-sm text-indigo">Generate a draft from a topic or bullet points. Review before sending.</p>
				<Input id="ai-topic" label="Topic" bind:value={aiTopic} />
				<label class="mb-3 block text-sm font-medium text-midnight">
					Bullet points (one per line)
					<textarea
						class="mt-1 w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm"
						rows="4"
						bind:value={aiBullets}
					></textarea>
				</label>
				<Button variant="secondary" onclick={generateAI} disabled={generating}>
					{generating ? 'Generating…' : 'Generate draft'}
				</Button>
			</Card>
		{/if}
	</div>
{/if}

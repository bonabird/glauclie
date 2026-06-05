<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { api } from '$lib/api/client';

	let snippet = $state('');
	let copied = $state(false);

	$effect(() => {
		api<{ snippet: string }>('/api/v1/newsletters/capture-snippet').then((res) => {
			snippet = res.snippet;
		});
	});

	async function copy() {
		await navigator.clipboard.writeText(snippet);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Email capture — Newsletters</title>
</svelte:head>

<div class="mb-6">
	<a href="/dashboard/modules/newsletters" class="text-sm text-ocean hover:underline">← Campaigns</a>
	<h1 class="mt-1 text-2xl font-semibold text-midnight">Email capture widget</h1>
	<p class="text-sm text-indigo">
		Embed this snippet on your site. GDPR consent checkbox is required — submissions without it are rejected.
	</p>
</div>

<Card>
	<h2 class="mb-2 font-semibold text-midnight">Embed snippet</h2>
	<pre class="mb-4 overflow-x-auto rounded-lg bg-midnight p-4 text-sm text-white">{snippet || 'Loading…'}</pre>
	<Button variant="accent" onclick={copy}>{copied ? 'Copied!' : 'Copy snippet'}</Button>
</Card>

<Card class="mt-6">
	<h2 class="mb-2 font-semibold text-midnight">How it works</h2>
	<ul class="list-disc space-y-1 pl-5 text-sm text-indigo">
		<li>Paste the snippet into any page on your external site.</li>
		<li>Visitors must check the GDPR consent box before subscribing.</li>
		<li>Subscribers appear in your Subscribers list immediately.</li>
		<li>Unsubscribe links are included automatically in every campaign.</li>
	</ul>
</Card>

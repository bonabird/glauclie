<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { HIDDEN_MODULE_SLUGS } from '$lib/modules';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { data } = $props();

	const slug = $derived($page.params.slug ?? '');
	const mod = $derived(data.modules.find((m) => m.slug === slug));

	const emptyActions: Record<string, { title: string; action: string }> = {
		analytics: { title: 'No data yet', action: 'Connect a source' }
	};

	const empty = $derived(emptyActions[slug] ?? { title: 'Coming soon', action: 'Get started' });

	onMount(() => {
		if (slug === 'content') {
			goto('/dashboard/modules/content');
		}
		if (slug === 'newsletters') {
			goto('/dashboard/modules/newsletters');
		}
		if (slug === 'links') {
			goto('/dashboard/modules/links');
		}
		if (slug === 'business_card') {
			goto('/dashboard/modules/business-card');
		}
		if (slug === 'commerce') {
			goto('/dashboard/modules/commerce');
		}
		if (slug === 'community') {
			goto('/dashboard/modules/community');
		}
		if ((HIDDEN_MODULE_SLUGS as readonly string[]).includes(slug)) {
			goto('/dashboard');
		}
	});
</script>

{#if slug === 'content' || slug === 'newsletters' || slug === 'links' || slug === 'business_card' || slug === 'commerce' || slug === 'community' || (HIDDEN_MODULE_SLUGS as readonly string[]).includes(slug)}
	<p class="text-indigo">Redirecting…</p>
{:else if mod?.locked}
	<Card class="text-center">
		<p class="mb-2 text-lg font-semibold text-midnight">{mod.name} is not available</p>
		<p class="text-sm text-indigo">This module is not enabled for your account yet.</p>
	</Card>
{:else}
	<Card class="text-center">
		<p class="mb-2 text-lg font-semibold text-midnight">{empty.title}</p>
		<p class="mb-6 text-sm text-indigo">
			This module is active on your account. Full features are coming in a future release.
		</p>
		<Button variant="primary" disabled>{empty.action}</Button>
	</Card>
{/if}

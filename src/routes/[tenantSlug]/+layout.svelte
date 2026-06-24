<script lang="ts">
	let { data, children } = $props();
	const branding = $derived(data.tenant.branding);

	// Fall back to readable defaults so empty branding never produces an empty CSS
	// variable (which would make e.g. the "Pay now" button invisible).
	const primary = $derived(branding?.primaryColor || '#111827');
	const background = $derived(branding?.backgroundColor || '#ffffff');
	const card = $derived(branding?.cardColor || '#f3f4f6');
	const text = $derived(branding?.textColor || '#111827');
	const accent = $derived(branding?.accentColor || '#2563eb');
</script>

<svelte:head>
	<title>{data.tenant.business_name}</title>
	<style>
		:global(:root) {
			--primary: {primary};
			--background: {background};
			--card: {card};
			--text: {text};
			--accent: {accent};
		}
	</style>
</svelte:head>

<div class="min-h-screen flex items-center justify-center" style="background-color: var(--background); color: var(--text);">
	<main class="mx-auto w-5xl">
		{@render children()}
	</main>
</div>

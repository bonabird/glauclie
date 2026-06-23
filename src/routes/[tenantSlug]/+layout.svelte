<script lang="ts">
	let { data, children } = $props();
	const branding = $derived(data.tenant.branding);
</script>

<svelte:head>
	<title>{data.tenant.business_name}</title>
	<style>
		:global(:root) {
			--primary: {branding.primaryColor};
			--background: {branding.backgroundColor};
			--card: {branding.cardColor};
			--text: {branding.textColor};
			--accent: {branding.accentColor};
		}
	</style>
</svelte:head>

<div class="min-h-screen flex items-center justify-center" style="background-color: var(--background); color: var(--text);">
	<main class="mx-auto w-5xl">
		{@render children()}
	</main>
</div>

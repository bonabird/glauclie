<script lang="ts">
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { TenantProfile } from '$lib/types';

	let { data } = $props();

	let form = $state({
		business_name: data.tenant?.business_name ?? '',
		slug: data.tenant?.slug ?? '',
		logo_url: data.tenant?.logo_url ?? '',
		custom_domain: data.tenant?.custom_domain ?? '',
		contact_email: data.tenant?.contact_email ?? '',
		timezone: data.tenant?.timezone ?? 'UTC',
		industry: data.tenant?.industry ?? ''
	});
	let error = $state('');
	let success = $state('');
	let loading = $state(false);
	let slugWarning = $derived(!!data.tenant?.slug_changed_at);

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		success = '';
		try {
			const body: Record<string, string | null> = {
				business_name: form.business_name,
				timezone: form.timezone,
				industry: form.industry || null,
				logo_url: form.logo_url || null,
				custom_domain: form.custom_domain || null,
				contact_email: form.contact_email || null
			};
			if (!slugWarning) {
				body.slug = form.slug;
			}
			await api<TenantProfile>('/api/v1/tenant/profile', { method: 'PATCH', json: body });
			success = 'Profile updated';
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Update failed';
		} finally {
			loading = false;
		}
	}
</script>

<Card class="max-w-xl">
	<h1 class="mb-6 text-xl font-semibold text-midnight">Tenant profile</h1>

	{#if slugWarning}
		<p class="mb-4 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
			Your workspace slug was already changed once and cannot be changed again.
		</p>
	{:else if form.slug !== data.tenant?.slug}
		<p class="mb-4 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
			Changing your slug affects your subdomain. This can only be done once.
		</p>
	{/if}

	<form class="space-y-4" onsubmit={submit}>
		<Input id="business_name" label="Business name" bind:value={form.business_name} required />
		<Input
			id="slug"
			label="Workspace slug"
			bind:value={form.slug}
			disabled={slugWarning}
			required
		/>
		<Input id="logo_url" label="Logo URL" bind:value={form.logo_url} placeholder="https://…" />
		<Input id="custom_domain" label="Custom domain" bind:value={form.custom_domain} />
		<Input id="contact_email" label="Contact email" type="email" bind:value={form.contact_email} />
		<Input id="timezone" label="Timezone" bind:value={form.timezone} />
		<Input id="industry" label="Industry / vertical" bind:value={form.industry} />
		{#if error}
			<p class="text-sm text-danger">{error}</p>
		{/if}
		{#if success}
			<p class="text-sm text-success">{success}</p>
		{/if}
		<Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save profile'}</Button>
	</form>
</Card>

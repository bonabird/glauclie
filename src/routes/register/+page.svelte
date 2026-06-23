<script lang="ts">
	import { page } from '$app/stores';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let email = $state('');
	let password = $state('');
	let businessName = $state('');
	let slug = $state('');
	let newsletterOptIn = $state(false);
	let error = $state('');
	let loading = $state(false);
	let { data } = $props();
	const redirectTo = $derived(
		$page.url.searchParams.get('redirect_to') ?? $page.url.searchParams.get('redirect') ?? '/'
	);

	function websiteCallbackUrl(code: string) {
		const destination = new URL(redirectTo, window.location.href);
		return `${destination.origin}/auth/callback?code=${encodeURIComponent(code)}`;
	}

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		try {
			if (data.tenant?.id) {
				const res = await api<{ code: string }>('/api/v1/auth/register', {
					method: 'POST',
					json: {
						email,
						password,
						tenant_id: data.tenant.id,
						role: 'member',
						newsletter_opt_in: newsletterOptIn,
						return_code: true,
						redirect_to: redirectTo
					}
				});
				window.location.href = websiteCallbackUrl(res.code);
				return;
			}
			await api('/api/v1/auth/register', {
				method: 'POST',
				json: { email, password, business_name: businessName, slug }
			});
			window.location.assign('/dashboard');
			return;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Registration failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<style>
		:global(:root) {
			--primary: {data.tenant?.branding.primaryColor ?? '#172C5E'};
			--background: {data.tenant?.branding.backgroundColor ?? '#ECFBFD'};
			--card: {data.tenant?.branding.cardColor ?? '#D4E6EE'};
			--text: {data.tenant?.branding.textColor ?? '#11142D'};
			--accent: {data.tenant?.branding.accentColor ?? '#f4a261'};
		}
	</style>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4" style={data.tenant ? 'background-color: var(--background); color: var(--text);' : ''}>
	<Card class="w-full max-w-md" style={data.tenant ? 'background-color: var(--card);' : ''}>
		<h1 class="mb-1 text-2xl font-semibold text-midnight">
			{data.tenant ? 'Create account' : 'Create your workspace'}
		</h1>
		<p class="mb-6 text-sm text-indigo">
			{data.tenant ? `Join ${data.tenant.business_name}` : 'Start your tenant on Glaucidae'}
		</p>

		<form class="space-y-4" onsubmit={submit}>
			{#if !data.tenant}
				<Input id="business" label="Business name" bind:value={businessName} required />
				<Input
					id="slug"
					label="Workspace slug"
					bind:value={slug}
					placeholder="my-brand"
					required
				/>
				<p class="text-xs text-indigo">Your URL: {slug || 'slug'}.glaucidae.com</p>
			{/if}
			<Input id="email" label="Email" type="email" bind:value={email} required />
			<Input id="password" label="Password" type="password" bind:value={password} required />
			{#if data.tenant}
				<label class="flex items-start gap-2 text-sm">
					<input
						type="checkbox"
						bind:checked={newsletterOptIn}
						class="mt-1 rounded border-sky-mist"
					/>
					<span>
						I agree to receive promotional emails and updates from {data.tenant.business_name}.
						I can unsubscribe at any time.
					</span>
				</label>
			{/if}
			{#if error}
				<p class="text-sm text-danger">{error}</p>
			{/if}
			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Creating…' : 'Create account'}
			</Button>
		</form>

		<p class="mt-4 text-center text-sm text-indigo">
			Already have an account?
			<a
				href="/login?redirect_to={encodeURIComponent(redirectTo)}"
				data-sveltekit-reload
				class="font-medium text-ocean hover:underline"
			>Sign in</a>
		</p>
	</Card>
</div>

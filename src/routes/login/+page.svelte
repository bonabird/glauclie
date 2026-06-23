<script lang="ts">
	import { allowRegistration } from '$lib/env/public';
	import { page } from '$app/stores';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data } = $props();

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	const registrationEnabled = allowRegistration();
	const redirectTo = $derived(
		$page.url.searchParams.get('redirect_to') ??
			$page.url.searchParams.get('redirect') ??
			(data.tenant ? `/${data.tenant.slug}` : '/dashboard')
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
			const body: Record<string, string | boolean> = { email, password };
			if (data.tenant?.id) {
				body.tenant_id = data.tenant.id;
				body.return_code = true;
				body.redirect_to = redirectTo;
			}
			const res = await api<{ code?: string }>('/api/v1/auth/login', {
				method: 'POST',
				json: body
			});
			if (data.tenant?.id && res.code) {
				window.location.href = websiteCallbackUrl(res.code);
				return;
			}
			window.location.assign('/dashboard');
			return;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Login failed';
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
		<h1 class="mb-1 text-2xl font-semibold text-midnight">Sign in</h1>
		<p class="mb-6 text-sm text-indigo">
			{data.tenant ? `Access your ${data.tenant.business_name} account` : 'Access your tenant dashboard'}
		</p>

		<form class="space-y-4" onsubmit={submit}>
			<Input id="email" label="Email" type="email" bind:value={email} required />
			<Input id="password" label="Password" type="password" bind:value={password} required />
			{#if error}
				<p class="text-sm text-danger">{error}</p>
			{/if}
			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Signing in…' : 'Sign in'}
			</Button>
		</form>

		<p class="mt-4 text-center text-sm text-indigo">
			<a href="/forgot-password" class="text-ocean hover:underline">Forgot password?</a>
		</p>
		{#if registrationEnabled}
			<p class="mt-2 text-center text-sm text-indigo">
				No account?
			<a
				href="/register?redirect_to={encodeURIComponent(redirectTo)}"
				data-sveltekit-reload
				class="font-medium text-ocean hover:underline"
			>Register</a>
			</p>
		{/if}
	</Card>
</div>

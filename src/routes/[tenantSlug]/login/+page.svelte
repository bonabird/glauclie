<script lang="ts">
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

	const redirectTo = $derived(
		$page.url.searchParams.get('redirect_to') ?? $page.url.searchParams.get('redirect') ?? `/${data.tenantSlug}`
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
			const res = await api<{ user: { role: string }; code: string }>('/api/v1/auth/login', {
				method: 'POST',
				json: {
					email,
					password,
					tenant_id: data.tenant.id,
					return_code: true,
					redirect_to: redirectTo
				}
			});
			window.location.href = websiteCallbackUrl(res.code);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign in — {data.tenant.business_name}</title>
</svelte:head>

<div class="flex justify-center">
	<Card class="w-full max-w-md" style="background-color: var(--card);">
		<h1 class="mb-1 text-2xl font-semibold">Sign in</h1>
		<p class="mb-6 text-sm opacity-80">Access your {data.tenant.business_name} account</p>

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

		<p class="mt-4 text-center text-sm opacity-80">
			<a href="/forgot-password" class="hover:underline" style="color: var(--primary);">
				Forgot password?
			</a>
		</p>
		<p class="mt-2 text-center text-sm opacity-80">
			No account?
			<a href="/{data.tenantSlug}/register" class="font-medium hover:underline" style="color: var(--primary);">
				Create one
			</a>
		</p>
	</Card>
</div>

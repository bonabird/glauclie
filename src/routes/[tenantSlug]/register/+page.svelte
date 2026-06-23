<script lang="ts">
	import { page } from '$app/stores';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data } = $props();

	let email = $state('');
	let password = $state('');
	let newsletterOptIn = $state(false);
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
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Registration failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Create account — {data.tenant.business_name}</title>
</svelte:head>

<div class="flex justify-center">
	<Card class="w-full max-w-md" style="background-color: var(--card);">
		<h1 class="mb-1 text-2xl font-semibold">Create account</h1>
		<p class="mb-6 text-sm opacity-80">Join {data.tenant.business_name}</p>

		<form class="space-y-4" onsubmit={submit}>
			<Input id="email" label="Email" type="email" bind:value={email} required />
			<Input
				id="password"
				label="Password"
				type="password"
				bind:value={password}
				required
				minlength={8}
			/>
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
			{#if error}
				<p class="text-sm text-danger">{error}</p>
			{/if}
			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Creating…' : 'Create account'}
			</Button>
		</form>

		<p class="mt-4 text-center text-sm opacity-80">
			Already have an account?
			<a href="/{data.tenantSlug}/login" class="font-medium hover:underline" style="color: var(--primary);">
				Sign in
			</a>
		</p>
	</Card>
</div>

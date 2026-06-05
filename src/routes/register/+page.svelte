<script lang="ts">
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let email = $state('');
	let password = $state('');
	let businessName = $state('');
	let slug = $state('');
	let error = $state('');
	let loading = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		try {
			await api('/api/v1/auth/register', {
				method: 'POST',
				json: { email, password, business_name: businessName, slug }
			});
			await goto('/dashboard');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Registration failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-md">
		<h1 class="mb-1 text-2xl font-semibold text-midnight">Create your workspace</h1>
		<p class="mb-6 text-sm text-indigo">Start your tenant on Glaucidae</p>

		<form class="space-y-4" onsubmit={submit}>
			<Input id="business" label="Business name" bind:value={businessName} required />
			<Input
				id="slug"
				label="Workspace slug"
				bind:value={slug}
				placeholder="my-brand"
				required
			/>
			<p class="text-xs text-indigo">Your URL: {slug || 'slug'}.glaucidae.com</p>
			<Input id="email" label="Email" type="email" bind:value={email} required />
			<Input id="password" label="Password" type="password" bind:value={password} required />
			{#if error}
				<p class="text-sm text-danger">{error}</p>
			{/if}
			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Creating…' : 'Create account'}
			</Button>
		</form>

		<p class="mt-4 text-center text-sm text-indigo">
			Already have an account?
			<a href="/login" class="font-medium text-ocean hover:underline">Sign in</a>
		</p>
	</Card>
</div>

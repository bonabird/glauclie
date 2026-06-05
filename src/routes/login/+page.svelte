<script lang="ts">
	import { allowRegistration } from '$lib/env/public';
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	const registrationEnabled = allowRegistration();

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		try {
			await api('/api/v1/auth/login', {
				method: 'POST',
				json: { email, password }
			});
			await goto('/dashboard');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-md">
		<h1 class="mb-1 text-2xl font-semibold text-midnight">Sign in</h1>
		<p class="mb-6 text-sm text-indigo">Access your tenant dashboard</p>

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
				<a href="/register" class="font-medium text-ocean hover:underline">Register</a>
			</p>
		{/if}
	</Card>
</div>

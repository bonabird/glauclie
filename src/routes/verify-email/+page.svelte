<script lang="ts">
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { data } = $props();
	let error = $state('');
	let success = $state(false);
	let loading = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		const token = new URLSearchParams(window.location.search).get('token');
		if (!token) {
			error = 'Missing verification token';
			return;
		}
		loading = true;
		error = '';
		try {
			await api('/api/v1/auth/verify-email', { method: 'POST', json: { token } });
			success = true;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Verification failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-md">
		<h1 class="mb-1 text-2xl font-semibold text-midnight">Verify email</h1>
		{#if success}
			<p class="text-sm text-indigo">Your email has been verified.</p>
			<p class="mt-4 text-center text-sm">
				<a href="/login" class="text-ocean hover:underline">Sign in</a>
			</p>
		{:else}
			<p class="mb-6 text-sm text-indigo">Click below to verify your email address.</p>
			<form onsubmit={submit}>
				{#if error}
					<p class="mb-4 text-sm text-danger">{error}</p>
				{/if}
				<Button type="submit" disabled={loading} class="w-full">
					{loading ? 'Verifying…' : 'Verify email'}
				</Button>
			</form>
		{/if}
	</Card>
</div>

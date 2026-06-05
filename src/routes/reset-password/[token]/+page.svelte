<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		try {
			await api('/api/v1/auth/reset-password', {
				method: 'POST',
				json: { token: $page.params.token, new_password: password }
			});
			await goto('/login');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Reset failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-md">
		<h1 class="mb-6 text-2xl font-semibold text-midnight">Choose a new password</h1>
		<form class="space-y-4" onsubmit={submit}>
			<Input id="password" label="New password" type="password" bind:value={password} required />
			{#if error}
				<p class="text-sm text-danger">{error}</p>
			{/if}
			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Saving…' : 'Update password'}
			</Button>
		</form>
	</Card>
</div>

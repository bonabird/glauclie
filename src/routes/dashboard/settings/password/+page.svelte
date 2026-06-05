<script lang="ts">
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let current = $state('');
	let newPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		try {
			await api('/api/v1/settings/password', {
				method: 'POST',
				json: { current_password: current, new_password: newPassword }
			});
			await goto('/login');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Update failed';
		} finally {
			loading = false;
		}
	}
</script>

<Card class="max-w-md">
	<h1 class="mb-4 text-xl font-semibold text-midnight">Change password</h1>
	<p class="mb-4 text-sm text-indigo">All other sessions will be signed out.</p>
	<form class="space-y-4" onsubmit={submit}>
		<Input id="current" label="Current password" type="password" bind:value={current} required />
		<Input id="new" label="New password" type="password" bind:value={newPassword} required />
		{#if error}
			<p class="text-sm text-danger">{error}</p>
		{/if}
		<Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Update password'}</Button>
	</form>
</Card>

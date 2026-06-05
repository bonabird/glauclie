<script lang="ts">
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data }: { data: { tenant: { slug: string } | null } } = $props();
	let slugConfirm = $state('');
	let error = $state('');
	let loading = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		try {
			await api('/api/v1/tenant/account', {
				method: 'DELETE',
				json: { slug_confirm: slugConfirm }
			});
			await goto('/login');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Deletion failed';
		} finally {
			loading = false;
		}
	}
</script>

<Card class="max-w-md border-2 border-danger/30">
	<h1 class="mb-2 text-xl font-semibold text-danger">Danger zone</h1>
	<p class="mb-4 text-sm text-indigo">
		Delete your tenant account. Data is soft-deleted with a 30-day grace period for recovery. Type
		your slug <strong>{data.tenant?.slug}</strong> to confirm.
	</p>
	<form class="space-y-4" onsubmit={submit}>
		<Input id="slug" label="Type slug to confirm" bind:value={slugConfirm} required />
		{#if error}
			<p class="text-sm text-danger">{error}</p>
		{/if}
		<Button type="submit" variant="danger" disabled={loading}>
			{loading ? 'Deleting…' : 'Delete account'}
		</Button>
	</form>
</Card>

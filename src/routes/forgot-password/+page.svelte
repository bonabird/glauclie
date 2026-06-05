<script lang="ts">
	import { api } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let email = $state('');
	let sent = $state(false);
	let loading = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		await api('/api/v1/auth/forgot-password', { method: 'POST', json: { email } });
		sent = true;
		loading = false;
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-md">
		<h1 class="mb-1 text-2xl font-semibold text-midnight">Reset password</h1>
		{#if sent}
			<p class="text-sm text-indigo">
				If an account exists for that email, we sent reset instructions. Check the server logs in
				development.
			</p>
		{:else}
			<p class="mb-6 text-sm text-indigo">Enter your email and we'll send a reset link.</p>
			<form class="space-y-4" onsubmit={submit}>
				<Input id="email" label="Email" type="email" bind:value={email} required />
				<Button type="submit" disabled={loading} class="w-full">
					{loading ? 'Sending…' : 'Send reset link'}
				</Button>
			</form>
		{/if}
		<p class="mt-4 text-center text-sm">
			<a href="/login" class="text-ocean hover:underline">Back to sign in</a>
		</p>
	</Card>
</div>

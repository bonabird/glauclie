<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { ContentGroup, ContentType } from '$lib/types';

	let group = $state<ContentGroup | null>(null);
	let types = $state<ContentType[]>([]);
	let selected = $state('');
	let title = $state('');
	let loading = $state(false);
	let pageLoading = $state(true);
	let error = $state('');

	async function loadPage() {
		const groupId = page.params.groupId;
		if (!groupId) {
			pageLoading = false;
			return;
		}
		pageLoading = true;
		try {
			const [g, res] = await Promise.all([
				api<ContentGroup>(`/api/v1/content/groups/${groupId}`),
				api<{ types: ContentType[] }>('/api/v1/content/types')
			]);
			group = g;
			types = res.types.map((t) => ({
				...t,
				schema: typeof t.schema === 'string' ? JSON.parse(t.schema) : t.schema
			}));
		} catch {
			group = null;
		} finally {
			pageLoading = false;
		}
	}

	$effect(() => {
		page.params.groupId;
		loadPage();
	});

	async function create() {
		if (!selected || !group) return;
		loading = true;
		error = '';
		try {
			const entry = await api<{ id: string }>('/api/v1/content/entries', {
				method: 'POST',
				json: {
					group_id: page.params.groupId,
					content_type_id: selected,
					title: title || 'Untitled',
					body: '',
					fields: {}
				}
			});
			await goto(`/dashboard/modules/content/${entry.id}`);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to create entry';
		} finally {
			loading = false;
		}
	}
</script>

{#if pageLoading}
	<p class="text-indigo">Loading…</p>
{:else if !group}
	<Card class="max-w-lg">
		<p class="text-indigo">Group not found.</p>
		<a href="/dashboard/modules/content" class="mt-2 inline-block text-sm text-ocean">Back to content</a>
	</Card>
{:else}
	<div class="mb-2">
		<a href="/dashboard/modules/content/groups/{group.id}" class="text-sm text-ocean hover:underline">
			← {group.name}
		</a>
	</div>

	<Card class="max-w-lg">
		<h1 class="mb-1 text-xl font-semibold text-midnight">New entry</h1>
		<p class="mb-4 text-sm text-indigo">Adding to {group.name}</p>

		<label class="mb-2 block text-sm font-medium text-indigo" for="type">Content type</label>
		<select
			id="type"
			class="mb-4 w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-midnight"
			bind:value={selected}
		>
			<option value="">Select a type…</option>
			{#each types as t (t.id)}
				<option value={t.id}>{t.name.replace(/_/g, ' ')}</option>
			{/each}
		</select>

		<label class="mb-2 block text-sm font-medium text-indigo" for="title">Title</label>
		<input
			id="title"
			class="mb-4 w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-midnight"
			bind:value={title}
			placeholder="My first post"
		/>

		{#if error}
			<p class="mb-2 text-sm text-danger">{error}</p>
		{/if}

		<Button disabled={!selected || loading} onclick={create}>
			{loading ? 'Creating…' : 'Create and edit'}
		</Button>
	</Card>
{/if}

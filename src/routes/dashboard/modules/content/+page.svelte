<script lang="ts">
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { ContentGroup, Module } from '$lib/types';

	let { data } = $props();

	const contentMod = $derived(data.modules.find((m: Module) => m.slug === 'content'));
	let groups = $state<ContentGroup[]>([]);
	let loading = $state(true);
	let showCreate = $state(false);
	let newName = $state('');
	let newDescription = $state('');
	let creating = $state(false);
	let error = $state('');

	async function load() {
		loading = true;
		const res = await api<{ groups: ContentGroup[] }>('/api/v1/content/groups');
		groups = res.groups;
		loading = false;
	}

	$effect(() => {
		if (contentMod && !contentMod.locked) {
			load();
		}
	});

	async function createGroup() {
		if (!newName.trim()) return;
		creating = true;
		error = '';
		try {
			const group = await api<ContentGroup>('/api/v1/content/groups', {
				method: 'POST',
				json: {
					name: newName.trim(),
					description: newDescription.trim()
				}
			});
			newName = '';
			newDescription = '';
			showCreate = false;
			await goto(`/dashboard/modules/content/groups/${group.id}`);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to create group';
		} finally {
			creating = false;
		}
	}

	async function removeGroup(group: ContentGroup) {
		const label = group.name;
		if (
			!confirm(
				`Delete group "${label}"? Entries inside will become unassigned, not deleted.`
			)
		) {
			return;
		}
		try {
			await api(`/api/v1/content/groups/${group.id}`, { method: 'DELETE' });
			await load();
		} catch (err) {
			alert(err instanceof ApiError ? err.message : 'Delete failed');
		}
	}
</script>

{#if contentMod?.locked}
	<Card class="text-center">
		<p class="mb-2 text-lg font-semibold text-midnight">Content is not available</p>
		<p class="text-sm text-indigo">This module is not enabled for your account yet.</p>
	</Card>
{:else}
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold text-midnight">Content</h1>
			<p class="text-sm text-indigo">
				Organise entries into groups — blogs, recipes, or anything else. Each group can mix
				content types.
			</p>
		</div>
		<Button variant="accent" onclick={() => (showCreate = !showCreate)}>
			{showCreate ? 'Cancel' : 'New group'}
		</Button>
	</div>

	{#if showCreate}
		<Card class="mb-6 max-w-lg">
			<h2 class="mb-4 text-lg font-semibold text-midnight">Create group</h2>
			<div class="space-y-4">
				<Input id="group-name" label="Name" bind:value={newName} placeholder="Recipes" />
				<label class="block text-sm font-medium text-indigo" for="group-desc">Description</label>
				<textarea
					id="group-desc"
					class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm text-midnight"
					placeholder="Optional description for this collection"
					bind:value={newDescription}
				></textarea>
				{#if error}
					<p class="text-sm text-danger">{error}</p>
				{/if}
				<Button disabled={!newName.trim() || creating} onclick={createGroup}>
					{creating ? 'Creating…' : 'Create group'}
				</Button>
			</div>
		</Card>
	{/if}

	{#if loading}
		<p class="text-indigo">Loading…</p>
	{:else if groups.length === 0}
		<Card>
			<p class="text-indigo">No groups yet. Create one to start adding content.</p>
		</Card>
	{:else}
		<div class="space-y-2">
			{#each groups as group (group.id)}
				<div
					class="flex items-center justify-between gap-3 rounded-xl bg-sky-mist px-4 py-3 transition hover:bg-sky-mist/80"
				>
					<a href="/dashboard/modules/content/groups/{group.id}" class="min-w-0 flex-1">
						<p class="font-medium text-midnight">{group.name}</p>
						<p class="text-xs text-indigo">
							/{group.slug} · {group.entry_count ?? 0}
							{(group.entry_count ?? 0) === 1 ? 'entry' : 'entries'}
							{#if group.description}
								· {group.description}
							{/if}
						</p>
					</a>
					<button
						type="button"
						class="shrink-0 rounded px-2 py-1 text-sm text-danger hover:bg-danger/10"
						onclick={() => removeGroup(group)}
					>
						Delete
					</button>
				</div>
			{/each}
		</div>
	{/if}
{/if}

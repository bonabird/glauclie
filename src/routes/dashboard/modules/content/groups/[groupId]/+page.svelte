<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { api, ApiError } from '$lib/api/client';
	import EntryStatusBadge from '$lib/components/cms/EntryStatusBadge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { ContentEntry, ContentGroup } from '$lib/types';

	let group = $state<ContentGroup | null>(null);
	let entries = $state<ContentEntry[]>([]);
	let statusFilter = $state('');
	let loading = $state(true);
	let error = $state('');
	let loadSeq = 0;

	async function loadEntries(id: string) {
		const q = new URLSearchParams({ group_id: id });
		if (statusFilter) q.set('status', statusFilter);
		const res = await api<{ entries: ContentEntry[] }>(`/api/v1/content/entries?${q}`);
		entries = res.entries;
	}

	async function loadGroup(id: string) {
		const seq = ++loadSeq;
		loading = true;
		error = '';
		try {
			const g = await api<ContentGroup>(`/api/v1/content/groups/${id}`);
			if (seq !== loadSeq) return;
			group = g;
		} catch (err) {
			if (seq !== loadSeq) return;
			group = null;
			entries = [];
			error = err instanceof ApiError ? err.message : 'Failed to load group';
			return;
		} finally {
			if (seq === loadSeq) loading = false;
		}

		try {
			await loadEntries(id);
		} catch (err) {
			entries = [];
			error = err instanceof ApiError ? err.message : 'Failed to load entries';
		}
	}

	$effect(() => {
		const id = page.params.groupId;
		if (!id) {
			loading = false;
			group = null;
			entries = [];
			error = 'Invalid group';
			return;
		}
		loadGroup(id);
	});

	async function onStatusFilterChange() {
		const id = page.params.groupId;
		if (!id || !group) return;
		try {
			await loadEntries(id);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load entries';
		}
	}

	async function removeEntry(entry: ContentEntry) {
		const label = entry.title || 'Untitled';
		if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
		try {
			await api(`/api/v1/content/entries/${entry.id}`, { method: 'DELETE' });
			const id = page.params.groupId;
			if (id) await loadEntries(id);
		} catch (err) {
			alert(err instanceof ApiError ? err.message : 'Delete failed');
		}
	}

	function canDelete(status: ContentEntry['status']) {
		return status === 'draft' || status === 'archived';
	}
</script>

{#if loading}
	<p class="text-indigo">Loading…</p>
{:else if !group}
	<Card>
		<p class="text-indigo">{error || 'Group not found.'}</p>
		<a href="/dashboard/modules/content" class="mt-2 inline-block text-sm text-ocean">Back to content</a>
	</Card>
{:else}
	<div class="mb-2">
		<a href="/dashboard/modules/content" class="text-sm text-ocean hover:underline">← Content</a>
	</div>

	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold text-midnight">{group.name}</h1>
			{#if group.description}
				<p class="text-sm text-indigo">{group.description}</p>
			{:else}
				<p class="text-sm text-indigo">Add any mix of blog posts, recipes, videos, and more.</p>
			{/if}
		</div>
		<Button variant="accent" onclick={() => goto(`/dashboard/modules/content/groups/${group.id}/new`)}>
			New entry
		</Button>
	</div>

	{#if error}
		<p class="mb-4 text-sm text-danger">{error}</p>
	{/if}

	<div class="mb-4 flex gap-2">
		<select
			class="rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm text-midnight"
			bind:value={statusFilter}
			onchange={onStatusFilterChange}
		>
			<option value="">All statuses</option>
			<option value="draft">Draft</option>
			<option value="published">Published</option>
			<option value="archived">Archived</option>
		</select>
	</div>

	{#if entries.length === 0}
		<Card>
			<p class="text-indigo">No entries in this group yet.</p>
		</Card>
	{:else}
		<div class="space-y-2">
			{#each entries as entry (entry.id)}
				<div
					class="flex items-center justify-between gap-3 rounded-xl bg-sky-mist px-4 py-3 transition hover:bg-sky-mist/80"
				>
					<a href="/dashboard/modules/content/{entry.id}" class="min-w-0 flex-1">
						<p class="font-medium text-midnight">{entry.title || 'Untitled'}</p>
						<p class="text-xs text-indigo">
							{entry.content_type_name?.replace(/_/g, ' ') ?? 'entry'} · /{entry.slug}
						</p>
					</a>
					<div class="flex shrink-0 items-center gap-2">
						<EntryStatusBadge status={entry.status} />
						{#if canDelete(entry.status)}
							<button
								type="button"
								class="rounded px-2 py-1 text-sm text-danger hover:bg-danger/10"
								onclick={() => removeEntry(entry)}
							>
								Delete
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/if}

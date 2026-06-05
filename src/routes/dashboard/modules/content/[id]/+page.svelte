<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api, ApiError } from '$lib/api/client';
	import MarkdownEditor from '$lib/components/cms/MarkdownEditor.svelte';
	import StructuredFields from '$lib/components/cms/StructuredFields.svelte';
	import EntryStatusBadge from '$lib/components/cms/EntryStatusBadge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { ContentEntry, ContentGroup, ContentType, FieldDef } from '$lib/types';

	let entry = $state<ContentEntry | null>(null);
	let groups = $state<ContentGroup[]>([]);
	let groupId = $state('');
	let schema = $state<FieldDef[]>([]);
	let body = $state('');
	let fields = $state<Record<string, unknown>>({});
	let title = $state('');
	let slug = $state('');
	let tiers = $state<string[]>([]);
	let scheduleAt = $state('');
	let error = $state('');
	let saving = $state(false);
	const tierOptions = ['free', 'paid', 'vip'];

	async function load() {
		const e = await api<ContentEntry>(`/api/v1/content/entries/${$page.params.id}`);
		entry = {
			...e,
			fields: typeof e.fields === 'object' ? e.fields : JSON.parse(String(e.fields))
		};
		body = e.body;
		fields = entry.fields as Record<string, unknown>;
		title = e.title;
		slug = e.slug;
		tiers = e.visible_to_tiers ?? [];
		groupId = e.group_id ?? '';
		if (e.published_at) {
			scheduleAt = e.published_at.slice(0, 16);
		}

		const [typesRes, groupsRes] = await Promise.all([
			api<{ types: ContentType[] }>('/api/v1/content/types'),
			api<{ groups: ContentGroup[] }>('/api/v1/content/groups')
		]);
		groups = groupsRes.groups;
		const ct = typesRes.types.find((t) => t.id === e.content_type_id);
		if (ct) {
			schema = typeof ct.schema === 'string' ? JSON.parse(ct.schema) : (ct.schema as FieldDef[]);
		}
	}

	$effect(() => {
		load();
	});

	async function save() {
		if (!entry) return;
		saving = true;
		error = '';
		try {
			const visible = tiers.length > 0 ? tiers : null;
			await api(`/api/v1/content/entries/${entry.id}`, {
				method: 'PATCH',
				json: {
					title,
					slug,
					body,
					fields,
					visible_to_tiers: visible,
					group_id: groupId || null
				}
			});
			await load();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Save failed';
		} finally {
			saving = false;
		}
	}

	async function publish() {
		if (!entry) return;
		await save();
		const published_at = scheduleAt ? new Date(scheduleAt).toISOString() : undefined;
		await api(`/api/v1/content/entries/${entry.id}/publish`, {
			method: 'POST',
			json: published_at ? { published_at } : {}
		});
		await load();
	}

	async function archive() {
		if (!entry) return;
		await api(`/api/v1/content/entries/${entry.id}/archive`, { method: 'POST' });
		await load();
	}

	async function deleteEntry() {
		if (!entry) return;
		const label = entry.title || 'Untitled';
		if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
		error = '';
		try {
			await api(`/api/v1/content/entries/${entry.id}`, { method: 'DELETE' });
			if (entry.group_id) {
				goto(`/dashboard/modules/content/groups/${entry.group_id}`);
			} else {
				goto('/dashboard/modules/content');
			}
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Delete failed';
		}
	}

	async function uploadImage(): Promise<string | null> {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		return new Promise((resolve) => {
			input.onchange = async () => {
				const file = input.files?.[0];
				if (!file) return resolve(null);
				const fd = new FormData();
				fd.append('file', file);
				if (entry) fd.append('entry_id', entry.id);
				const res = await api<{ url: string }>('/api/v1/media/upload', {
					method: 'POST',
					body: fd
				});
				resolve(res.url);
			};
			input.click();
		});
	}

	function openPreview() {
		window.open(`/dashboard/modules/content/preview/${$page.params.id}`, '_blank');
	}

	function toggleTier(t: string) {
		if (tiers.includes(t)) {
			tiers = tiers.filter((x) => x !== t);
		} else {
			tiers = [...tiers, t];
		}
	}
</script>

{#if entry}
	<div class="mb-2 flex flex-wrap items-center gap-2 text-sm">
		<a href="/dashboard/modules/content" class="text-ocean hover:underline">Content</a>
		{#if entry.group_id && entry.group_name}
			<span class="text-indigo">/</span>
			<a href="/dashboard/modules/content/groups/{entry.group_id}" class="text-ocean hover:underline">
				{entry.group_name}
			</a>
		{/if}
	</div>

	<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
		<div class="flex items-center gap-3">
			<h1 class="text-xl font-semibold text-midnight">Edit entry</h1>
			<EntryStatusBadge status={entry.status} />
		</div>
		<div class="flex flex-wrap gap-2">
			<Button variant="secondary" onclick={openPreview}>View as client</Button>
			<Button variant="secondary" onclick={save} disabled={saving}>
				{saving ? 'Saving…' : 'Save draft'}
			</Button>
			<Button variant="primary" onclick={publish}>Publish</Button>
			{#if entry.status !== 'archived'}
				<Button variant="ghost" onclick={archive}>Archive</Button>
			{/if}
			{#if entry.status === 'draft' || entry.status === 'archived'}
				<Button variant="danger" onclick={deleteEntry}>Delete</Button>
			{/if}
		</div>
	</div>

	{#if error}
		<p class="mb-4 text-sm text-danger">{error}</p>
	{/if}

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="space-y-4 lg:col-span-1">
			<Card>
				<div class="space-y-4">
					<Input id="title" label="Title" bind:value={title} />
					<Input id="slug" label="URL slug" bind:value={slug} />
					<p class="text-xs text-indigo">Type: {entry.content_type_name?.replace(/_/g, ' ')}</p>

					{#if groups.length > 0}
						<label class="block text-sm font-medium text-indigo" for="group">Group</label>
						<select
							id="group"
							class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm text-midnight"
							bind:value={groupId}
						>
							<option value="">No group</option>
							{#each groups as g (g.id)}
								<option value={g.id}>{g.name}</option>
							{/each}
						</select>
					{/if}

					<div>
						<p class="mb-2 text-sm font-medium text-indigo">Access (empty = public)</p>
						{#each tierOptions as t}
							<label class="mr-3 text-sm">
								<input
									type="checkbox"
									checked={tiers.includes(t)}
									onchange={() => toggleTier(t)}
								/>
								{t}
							</label>
						{/each}
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-indigo" for="schedule"
							>Schedule publish (optional)</label
						>
						<input
							id="schedule"
							type="datetime-local"
							class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm"
							bind:value={scheduleAt}
						/>
					</div>
				</div>
			</Card>

			{#if schema.length > 0}
				<Card>
					<h2 class="mb-3 font-medium text-midnight">Structured fields</h2>
					<StructuredFields {schema} bind:fields />
				</Card>
			{/if}
		</div>

		<Card class="lg:col-span-2">
			<h2 class="mb-3 font-medium text-midnight">Body</h2>
			<MarkdownEditor bind:value={body} onImageUpload={uploadImage} />
		</Card>
	</div>
{/if}

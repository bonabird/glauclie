<script lang="ts">
	import { api, ApiError } from '$lib/api/client';
	import Icon from '$lib/components/icons/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { LINK_ICON_OPTIONS, resolveIconName } from '$lib/icons';
	import type { LinkItem, LinkPage, LinkTheme, Module } from '$lib/types';

	let { data } = $props();

	const mod = $derived(data.modules.find((m: Module) => m.slug === 'links'));
	let page = $state<LinkPage | null>(null);
	let links = $state<LinkItem[]>([]);
	let publicUrl = $state('');
	let error = $state('');
	let loadError = $state('');
	let loading = $state(true);
	let saving = $state(false);

	let title = $state('');
	let bio = $state('');
	let avatarUrl = $state('');
	let published = $state(true);
	let theme = $state<LinkTheme>({
		background_color: '#010f5a',
		text_color: '#ffffff',
		accent_color: '#0753b5',
		font_family: 'system-ui,sans-serif'
	});

	let newLabel = $state('');
	let newUrl = $state('');
	let newIcon = $state('');
	let newAction = $state<LinkItem['action_type']>('url');
	let newTier = $state('paid');

	function parseTheme(t: LinkPage['theme']): LinkTheme {
		if (typeof t === 'object' && t) {
			return t as LinkTheme;
		}
		try {
			return JSON.parse(String(t)) as LinkTheme;
		} catch {
			return {
				background_color: '#010f5a',
				text_color: '#ffffff',
				accent_color: '#0753b5',
				font_family: 'system-ui,sans-serif'
			};
		}
	}

	async function load() {
		loading = true;
		loadError = '';
		try {
			const [dash, urlRes] = await Promise.all([
				api<{ page: LinkPage; links: LinkItem[] }>('/api/v1/links'),
				api<{ url: string }>('/api/v1/links/public-url')
			]);
			page = dash.page;
			links = dash.links ?? [];
			publicUrl = urlRes.url;
			title = dash.page.title;
			bio = dash.page.bio;
			avatarUrl = dash.page.avatar_url ?? '';
			published = dash.page.published;
			theme = parseTheme(dash.page.theme);
		} catch (err) {
			page = null;
			links = [];
			publicUrl = '';
			loadError = err instanceof ApiError ? err.message : 'Failed to load links';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (mod && !mod.locked) load();
	});

	async function savePage() {
		saving = true;
		error = '';
		try {
			await api('/api/v1/links/page', {
				method: 'PATCH',
				json: {
					title,
					bio,
					avatar_url: avatarUrl || null,
					theme,
					published
				}
			});
			await load();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Save failed';
		} finally {
			saving = false;
		}
	}

	async function addLink() {
		if (!newLabel.trim()) return;
		const action_config =
			newAction === 'community_tier' ? { tier: newTier } : {};
		await api('/api/v1/links/items', {
			method: 'POST',
			json: {
				label: newLabel,
				url: newUrl,
				icon: newIcon,
				action_type: newAction,
				action_config
			}
		});
		newLabel = '';
		newUrl = '';
		newIcon = '';
		await load();
	}

	async function toggleActive(link: LinkItem) {
		await api(`/api/v1/links/items/${link.id}`, {
			method: 'PATCH',
			json: {
				label: link.label,
				url: link.url,
				icon: link.icon,
				action_type: link.action_type,
				action_config: link.action_config,
				active: !link.active
			}
		});
		await load();
	}

	async function removeLink(id: string) {
		if (!confirm('Delete this link?')) return;
		await api(`/api/v1/links/items/${id}`, { method: 'DELETE' });
		await load();
	}

	async function moveLink(index: number, dir: -1 | 1) {
		const next = index + dir;
		if (next < 0 || next >= links.length) return;
		const ids = links.map((l) => l.id);
		[ids[index], ids[next]] = [ids[next], ids[index]];
		await api('/api/v1/links/items/reorder', { method: 'POST', json: { ids } });
		await load();
	}

	const actionLabels: Record<string, string> = {
		url: 'Open URL',
		email_capture: 'Email capture',
		gated_login: 'Gated login',
		community_tier: 'Community tier'
	};
</script>

<svelte:head>
	<title>Links — Dashboard</title>
</svelte:head>

{#if mod?.locked}
	<Card class="text-center">
		<p class="mb-2 text-lg font-semibold text-midnight">Links is not available</p>
		<p class="text-sm text-indigo">This module is not enabled for your account yet.</p>
	</Card>
{:else if !mod}
	<Card class="text-center">
		<p class="mb-2 text-lg font-semibold text-midnight">Links module unavailable</p>
		<p class="text-sm text-indigo">Could not load module settings. Try refreshing the page.</p>
	</Card>
{:else}
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold text-midnight">Link in bio</h1>
			<p class="text-sm text-indigo">Your hosted page with smart link actions.</p>
			{#if publicUrl}
				<a
					href={publicUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="mt-1 inline-flex items-center gap-1 text-sm font-medium text-ocean hover:underline"
				>
					View live page
					<Icon name="arrow-right" class="h-3.5 w-3.5" />
				</a>
			{/if}
		</div>
		{#if page}
			<Button variant="accent" onclick={savePage} disabled={saving}>
				{saving ? 'Saving…' : 'Save page'}
			</Button>
		{/if}
	</div>

	{#if loadError}
		<Card class="mb-4 text-center">
			<p class="mb-2 text-sm text-danger">{loadError}</p>
			<Button variant="secondary" onclick={load}>Try again</Button>
		</Card>
	{/if}

	{#if loading}
		<p class="text-indigo">Loading…</p>
	{:else if page}
	{#if error}
		<p class="mb-4 text-sm text-danger">{error}</p>
	{/if}

	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			<h2 class="mb-4 font-semibold text-midnight">Profile</h2>
			<div class="space-y-3">
				<Input id="link-title" label="Title" bind:value={title} />
				<label class="block text-sm font-medium text-midnight">
					Bio
					<textarea
						class="mt-1 w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm"
						rows="3"
						bind:value={bio}
					></textarea>
				</label>
				<Input id="link-avatar" label="Avatar URL" bind:value={avatarUrl} />
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={published} />
					Published (visible on public page)
				</label>
			</div>
		</Card>

		<Card>
			<h2 class="mb-4 font-semibold text-midnight">Theme</h2>
			<div class="grid grid-cols-2 gap-3">
				<label class="text-sm">
					Background
					<input type="color" class="mt-1 h-10 w-full" bind:value={theme.background_color} />
				</label>
				<label class="text-sm">
					Text
					<input type="color" class="mt-1 h-10 w-full" bind:value={theme.text_color} />
				</label>
				<label class="text-sm">
					Accent (buttons)
					<input type="color" class="mt-1 h-10 w-full" bind:value={theme.accent_color} />
				</label>
				<Input id="link-font" label="Font family" bind:value={theme.font_family} />
			</div>
			<p class="mt-3 text-xs text-indigo">
				White-label: set a custom domain in Profile → it will serve this page instead of /slug.
			</p>
		</Card>
	</div>

	<Card class="mt-6">
		<h2 class="mb-4 font-semibold text-midnight">Links</h2>
		{#if links.length === 0}
			<p class="text-sm text-indigo">No links yet. Add your first button below.</p>
		{:else}
			<ul class="mb-6 space-y-2">
				{#each links as link, i (link.id)}
					<li
						class="flex flex-wrap items-center gap-2 rounded-xl bg-sky-mist/60 px-3 py-2 text-sm"
					>
						<span class="flex items-center gap-2 font-medium">
							{#if resolveIconName(link.icon)}
								<Icon name={resolveIconName(link.icon)!} class="h-4 w-4 shrink-0" />
							{/if}
							{link.label}
						</span>
						<span class="text-indigo">· {actionLabels[link.action_type] ?? link.action_type}</span>
						<span class="text-indigo">· {link.click_count} clicks</span>
						{#if !link.active}<span class="text-warning">(hidden)</span>{/if}
						<div class="ml-auto flex gap-1">
							<button
								type="button"
								class="rounded p-1 hover:bg-sky-mist"
								aria-label="Move up"
								onclick={() => moveLink(i, -1)}
							>
								<Icon name="chevron-up" class="h-4 w-4" />
							</button>
							<button
								type="button"
								class="rounded p-1 hover:bg-sky-mist"
								aria-label="Move down"
								onclick={() => moveLink(i, 1)}
							>
								<Icon name="chevron-down" class="h-4 w-4" />
							</button>
							<button
								type="button"
								class="rounded px-2 py-1 hover:bg-sky-mist"
								onclick={() => toggleActive(link)}
							>
								{link.active ? 'Hide' : 'Show'}
							</button>
							<button
								type="button"
								class="rounded px-2 py-1 text-danger hover:bg-danger/10"
								onclick={() => removeLink(link.id)}>Delete</button
							>
						</div>
					</li>
				{/each}
			</ul>
		{/if}

		<div class="border-t border-sky-mist pt-4">
			<h3 class="mb-3 text-sm font-semibold text-midnight">Add link</h3>
			<div class="grid gap-3 sm:grid-cols-2">
				<label class="text-sm font-medium text-midnight sm:col-span-2">
					Action
					<select
						class="mt-1 w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm"
						bind:value={newAction}
					>
						<option value="url">Open URL</option>
						<option value="email_capture">Email capture (newsletter)</option>
						<option value="gated_login">Gated login</option>
						<option value="community_tier">Community tier</option>
					</select>
				</label>
				{#if newAction === 'community_tier'}
					<Input id="new-tier" label="Tier slug" bind:value={newTier} />
				{/if}
				<Input id="new-label" label="Label" bind:value={newLabel} />
				<label class="text-sm font-medium text-midnight">
					Icon
					<select
						class="mt-1 w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm"
						bind:value={newIcon}
					>
						<option value="">None</option>
						{#each LINK_ICON_OPTIONS as iconName (iconName)}
							<option value={iconName}>{iconName}</option>
						{/each}
					</select>
				</label>
				{#if newAction !== 'email_capture'}
					<div class="sm:col-span-2">
						<Input id="new-url" label="URL" bind:value={newUrl} />
					</div>
				{/if}
			</div>
			<Button variant="secondary" class="mt-3" onclick={addLink}>Add link</Button>
		</div>
	</Card>

	<p class="mt-4 text-sm text-indigo">
		Page views: {page.view_count} · Configure custom domain in
		<a href="/dashboard/profile" class="text-ocean hover:underline">Profile</a>.
	</p>
	{/if}
{/if}

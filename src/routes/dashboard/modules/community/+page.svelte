<script lang="ts">
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { CommunityUser, Module } from '$lib/types';

	let { data } = $props();

	const mod = $derived(data.modules.find((m: Module) => m.slug === 'community'));

	let users = $state<CommunityUser[]>([]);
	let loading = $state(true);
	let error = $state('');
	let success = $state('');
	let nextCursor = $state<string | null>(null);

	let search = $state('');
	let tier = $state('');
	let status = $state('');
	let sort = $state('created');
	let cursors = $state<string[]>([]);

	function formatDate(iso: string | null) {
		if (!iso) return 'Never';
		return new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function tierLabel(value: string) {
		return value === 'vip' ? 'VIP' : value.charAt(0).toUpperCase() + value.slice(1);
	}

	function buildPath(cursor?: string) {
		const params = new URLSearchParams();
		if (search.trim()) params.set('search', search.trim());
		if (tier) params.set('tier', tier);
		if (status) params.set('status', status);
		if (sort) params.set('sort', sort);
		if (cursor) params.set('cursor', cursor);
		params.set('limit', '25');
		return `/api/v1/community/users?${params.toString()}`;
	}

	async function load(cursor?: string) {
		loading = true;
		error = '';
		try {
			const res = await api<{ users: CommunityUser[]; next_cursor: string | null }>(buildPath(cursor));
			users = res.users ?? [];
			nextCursor = res.next_cursor ?? null;
		} catch (err) {
			users = [];
			nextCursor = null;
			error = err instanceof ApiError ? err.message : 'Failed to load users';
		} finally {
			loading = false;
		}
	}

	async function applyFilters(e?: Event) {
		e?.preventDefault();
		cursors = [];
		await load();
	}

	async function nextPage() {
		if (!nextCursor) return;
		cursors = [...cursors, nextCursor];
		await load(nextCursor);
	}

	async function previousPage() {
		if (cursors.length === 0) return;
		const nextStack = cursors.slice(0, -1);
		cursors = nextStack;
		await load(nextStack.at(-1));
	}

	async function setTier(user: CommunityUser, value: string) {
		error = '';
		success = '';
		try {
			await api(`/api/v1/community/users/${user.id}/tier`, {
				method: 'PATCH',
				json: { tier: value }
			});
			success = `${user.email} moved to ${tierLabel(value)}`;
			await load(cursors.at(-1));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to update tier';
		}
	}

	async function setBanned(user: CommunityUser, banned: boolean) {
		const action = banned ? 'ban' : 'unban';
		if (banned && !confirm(`Ban ${user.email}? This revokes their refresh sessions.`)) return;
		error = '';
		success = '';
		try {
			await api(`/api/v1/community/users/${user.id}/ban`, {
				method: 'PATCH',
				json: { banned }
			});
			success = `${user.email} ${action === 'ban' ? 'banned' : 'unbanned'}`;
			await load(cursors.at(-1));
		} catch (err) {
			error = err instanceof ApiError ? err.message : `Failed to ${action} user`;
		}
	}

	$effect(() => {
		void load();
	});
</script>

{#if mod?.locked}
	<Card class="text-center">
		<p class="mb-2 text-lg font-semibold text-midnight">Community is not available</p>
		<p class="text-sm text-indigo">Upgrade to Pro to manage customer tiers and access.</p>
	</Card>
{:else}
	<div class="space-y-6">
		<div>
			<h1 class="text-2xl font-semibold text-midnight">Community users</h1>
			<p class="mt-1 text-sm text-indigo">
				Manage customer accounts, global tiers, promotional consent, and access status.
			</p>
		</div>

		<Card>
			<form class="grid gap-4 md:grid-cols-[1fr_160px_160px_160px_auto]" onsubmit={applyFilters}>
				<Input id="community-search" label="Search" bind:value={search} placeholder="Email or name" />
				<div class="space-y-1">
					<label for="tier" class="block text-sm font-medium text-indigo">Tier</label>
					<select id="tier" bind:value={tier} class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-midnight">
						<option value="">All tiers</option>
						<option value="free">Free</option>
						<option value="paid">Paid</option>
						<option value="vip">VIP</option>
					</select>
				</div>
				<div class="space-y-1">
					<label for="status" class="block text-sm font-medium text-indigo">Status</label>
					<select id="status" bind:value={status} class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-midnight">
						<option value="">All</option>
						<option value="active">Active</option>
						<option value="banned">Banned</option>
					</select>
				</div>
				<div class="space-y-1">
					<label for="sort" class="block text-sm font-medium text-indigo">Sort</label>
					<select id="sort" bind:value={sort} class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-midnight">
						<option value="created">Newest</option>
						<option value="last_active">Last active</option>
					</select>
				</div>
				<div class="flex items-end">
					<Button type="submit" disabled={loading}>Apply</Button>
				</div>
			</form>
		</Card>

		{#if error}
			<p class="text-sm text-danger">{error}</p>
		{/if}
		{#if success}
			<p class="text-sm text-success">{success}</p>
		{/if}

		<Card class="overflow-x-auto">
			{#if loading}
				<p class="text-sm text-indigo">Loading…</p>
			{:else if users.length === 0}
				<p class="text-sm text-indigo">No community users found.</p>
			{:else}
				<table class="w-full text-left text-sm">
					<thead>
						<tr class="border-b border-sky-mist text-indigo">
							<th class="pb-2 pr-4 font-medium">User</th>
							<th class="pb-2 pr-4 font-medium">Tier</th>
							<th class="pb-2 pr-4 font-medium">Joined</th>
							<th class="pb-2 pr-4 font-medium">Last active</th>
							<th class="pb-2 pr-4 font-medium">Orders</th>
							<th class="pb-2 pr-4 font-medium">Promo consent</th>
							<th class="pb-2 pr-4 font-medium">Status</th>
							<th class="pb-2 font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each users as user (user.id)}
							<tr class="border-b border-sky-mist/60 align-top">
								<td class="py-3 pr-4">
									<p class="font-medium text-midnight">{user.name || user.email}</p>
									<p class="text-xs text-indigo">
										{user.email} · {user.email_verified ? 'Verified' : 'Unverified'}
									</p>
								</td>
								<td class="py-3 pr-4">
									<select
										aria-label="Tier for {user.email}"
										value={user.tier}
										onchange={(e) => setTier(user, (e.currentTarget as HTMLSelectElement).value)}
										class="rounded-lg border border-sky-mist bg-sky-mist/60 px-2 py-1 text-midnight"
									>
										<option value="free">Free</option>
										<option value="paid">Paid</option>
										<option value="vip">VIP</option>
									</select>
								</td>
								<td class="py-3 pr-4 text-indigo">{formatDate(user.joined_at)}</td>
								<td class="py-3 pr-4 text-indigo">{formatDate(user.last_active_at)}</td>
								<td class="py-3 pr-4 text-indigo">{user.order_count}</td>
								<td class="py-3 pr-4 text-indigo">
									{#if user.promotional_consent}
										Yes{#if user.promotional_source} · {user.promotional_source}{/if}
									{:else}
										No
									{/if}
								</td>
								<td class="py-3 pr-4 text-indigo">{user.status}</td>
								<td class="py-3">
									{#if user.status === 'banned'}
										<Button variant="secondary" onclick={() => setBanned(user, false)}>Unban</Button>
									{:else}
										<Button variant="secondary" onclick={() => setBanned(user, true)}>Ban</Button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</Card>

		<div class="flex justify-between">
			<Button variant="secondary" disabled={loading || cursors.length === 0} onclick={previousPage}>
				Previous
			</Button>
			<Button variant="secondary" disabled={loading || !nextCursor} onclick={nextPage}>Next</Button>
		</div>
	</div>
{/if}

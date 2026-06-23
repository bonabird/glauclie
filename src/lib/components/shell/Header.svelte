<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api/client';
	import { clickOutside } from '$lib/actions/click-outside';
	import Icon from '$lib/components/icons/Icon.svelte';
	import type { Notification, TenantProfile } from '$lib/types';

	let {
		tenant,
		unreadCount = 0,
		recentNotifications = [],
		onRefreshNotifications
	}: {
		tenant: TenantProfile | null;
		unreadCount?: number;
		recentNotifications?: Notification[];
		onRefreshNotifications?: () => void;
	} = $props();

	let menuOpen = $state(false);
	let bellOpen = $state(false);

	function toggleBell() {
		bellOpen = !bellOpen;
		if (bellOpen) menuOpen = false;
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
		if (menuOpen) bellOpen = false;
	}

	function closeBell() {
		bellOpen = false;
	}

	function closeMenu() {
		menuOpen = false;
	}

	async function logout() {
		await api('/api/v1/auth/logout', { method: 'POST' });
		await goto('/login');
	}

	async function markRead(id: string) {
		await api(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
		onRefreshNotifications?.();
	}

	async function markAllRead() {
		await api('/api/v1/notifications/read-all', { method: 'POST' });
		onRefreshNotifications?.();
	}
</script>

<header class="flex h-14 items-center justify-between border-b border-sky-mist/80 bg-sky-mist/40 px-4">
	<div class="flex items-center gap-3">
		{#if tenant?.logo_url}
			<img src={tenant.logo_url} alt="" class="h-8 w-8 rounded object-cover" />
		{:else}
			<div
				class="flex h-8 w-8 items-center justify-center rounded bg-ocean text-sm font-bold text-white"
			>
				{(tenant?.business_name ?? 'G').charAt(0)}
			</div>
		{/if}
		<span class="font-semibold text-midnight">{tenant?.business_name ?? 'Glaucidae'}</span>
	</div>

	<div class="flex items-center gap-2">
		<div class="relative" use:clickOutside={closeBell}>
			<button
				type="button"
				class="relative rounded-lg p-2 text-midnight hover:bg-periwinkle"
				onclick={toggleBell}
				aria-label="Notifications"
				aria-expanded={bellOpen}
			>
				<Icon name="bell" class="h-5 w-5" />
				{#if unreadCount > 0}
					<span
						class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-bold text-midnight"
					>
						{unreadCount}
					</span>
				{/if}
			</button>

			{#if bellOpen}
				<div
					class="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-sky-mist bg-sky-mist shadow-lg"
				>
					<div class="flex items-center justify-between border-b border-periwinkle px-4 py-2">
						<span class="font-medium text-midnight">Notifications</span>
						<button type="button" class="text-xs text-ocean" onclick={markAllRead}>
							Mark all read
						</button>
					</div>
					<ul class="max-h-64 overflow-y-auto">
						{#each recentNotifications as n (n.id)}
							<li
								class="border-b border-periwinkle/50 px-4 py-3 {!n.read_at
									? 'bg-periwinkle/30'
									: ''}"
							>
								<p class="text-sm font-medium text-midnight">{n.title}</p>
								<p class="text-xs text-indigo">{n.body}</p>
								{#if !n.read_at}
									<button
										type="button"
										class="mt-1 text-xs text-ocean"
										onclick={() => markRead(n.id)}
									>
										Mark read
									</button>
								{/if}
							</li>
						{:else}
							<li class="px-4 py-6 text-center text-sm text-indigo">No notifications yet</li>
						{/each}
					</ul>
					<a
						href="/dashboard/notifications"
						class="block px-4 py-2 text-center text-sm text-ocean hover:underline"
					>
						View all
					</a>
				</div>
			{/if}
		</div>

		<div class="relative" use:clickOutside={closeMenu}>
			<button
				type="button"
				class="rounded-lg p-2 text-midnight hover:bg-periwinkle"
				onclick={toggleMenu}
				aria-label="Account menu"
				aria-expanded={menuOpen}
			>
				<Icon name="user" class="h-5 w-5" />
			</button>
			{#if menuOpen}
				<div
					class="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-sky-mist bg-sky-mist py-1 shadow-lg"
				>
					<a
						href="/dashboard/settings"
						class="block px-4 py-2 text-sm text-midnight hover:bg-periwinkle"
						onclick={() => (menuOpen = false)}
					>
						Settings
					</a>
					<button
						type="button"
						class="w-full px-4 py-2 text-left text-sm text-danger hover:bg-periwinkle"
						onclick={logout}
					>
						Log out
					</button>
				</div>
			{/if}
		</div>
	</div>
</header>

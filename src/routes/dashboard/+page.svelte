<script lang="ts">
	import { api } from '$lib/api/client';
	import Icon from '$lib/components/icons/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import {
		isModuleVisible,
		MODULE_DESCRIPTIONS,
		MODULE_ICON_NAMES,
		MODULE_QUICK_LINKS,
		moduleDashboardPath
	} from '$lib/modules';
	import type { Module } from '$lib/types';

	let { data } = $props();
	let seeding = $state(false);

	const visibleModules = $derived(
		(data.modules as Module[]).filter((m) => isModuleVisible(m.slug))
	);

	const publicLinks = $derived(
		data.tenant?.slug
			? [
					{ label: 'Link in bio', href: `/${data.tenant.slug}` },
					{ label: 'Business card (QR landing)', href: `/card/${data.tenant.slug}` }
				]
			: []
	);

	async function seedNotification() {
		seeding = true;
		try {
			await api('/api/v1/demo/notification', { method: 'POST' });
			window.location.reload();
		} finally {
			seeding = false;
		}
	}
</script>

<div class="space-y-8">
	<Card>
		<h1 class="mb-2 text-2xl font-semibold text-midnight">
			Welcome{data.tenant ? `, ${data.tenant.business_name}` : ''}
		</h1>
		<p class="text-indigo">Jump to any module below, or use the sidebar.</p>
		{#if data.unreadCount > 0}
			<p class="mt-3 text-sm text-success">
				You have {data.unreadCount} unread notification(s).
				<a href="/dashboard/notifications" class="inline-flex items-center gap-1 font-medium text-ocean hover:underline">
					View notifications
					<Icon name="arrow-right" class="h-3.5 w-3.5" />
				</a>
			</p>
		{/if}
	</Card>

	<section>
		<h2 class="mb-4 text-lg font-semibold text-midnight">Modules</h2>
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each visibleModules as mod (mod.slug)}
				<Card class={mod.locked ? 'opacity-75' : ''}>
					<div class="mb-3 flex items-start gap-3">
						<Icon name={MODULE_ICON_NAMES[mod.slug] ?? 'default'} class="h-7 w-7 shrink-0 text-ocean" />
						<div class="min-w-0 flex-1">
							<h3 class="font-semibold text-midnight">{mod.name}</h3>
							<p class="mt-1 text-sm text-indigo">
								{MODULE_DESCRIPTIONS[mod.slug] ?? 'Open this module.'}
							</p>
						</div>
					</div>

					{#if mod.locked}
						<p class="text-sm text-indigo">Not available on your plan yet.</p>
					{:else}
						<a
							href={moduleDashboardPath(mod.slug)}
							class="inline-flex items-center gap-1 text-sm font-medium text-ocean hover:underline"
						>
							Open {mod.name}
							<Icon name="arrow-right" class="h-3.5 w-3.5" />
						</a>

						{#if MODULE_QUICK_LINKS[mod.slug]?.length}
							<ul class="mt-3 space-y-1 border-t border-sky-mist pt-3 text-sm">
								{#each MODULE_QUICK_LINKS[mod.slug] as link (link.href)}
									<li>
										<a href={link.href} class="text-ocean hover:underline">{link.label}</a>
									</li>
								{/each}
							</ul>
						{/if}
					{/if}
				</Card>
			{/each}
		</div>
	</section>

	{#if publicLinks.length > 0}
		<section>
			<h2 class="mb-4 text-lg font-semibold text-midnight">Your public pages</h2>
			<Card>
				<p class="mb-3 text-sm text-indigo">Live URLs visitors can open (new tab):</p>
				<ul class="space-y-2 text-sm">
					{#each publicLinks as link (link.href)}
						<li>
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								class="font-medium text-ocean hover:underline"
							>
								{link.label}
							</a>
							<span class="ml-2 text-indigo">{link.href}</span>
						</li>
					{/each}
				</ul>
			</Card>
		</section>
	{/if}

	<section>
		<h2 class="mb-4 text-lg font-semibold text-midnight">Account</h2>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<Card>
				<h3 class="mb-1 font-semibold text-midnight">Profile</h3>
				<p class="mb-3 text-sm text-indigo">Business name, slug, logo, custom domain.</p>
				<a href="/dashboard/profile" class="inline-flex items-center gap-1 text-sm font-medium text-ocean hover:underline">
					Edit profile
					<Icon name="arrow-right" class="h-3.5 w-3.5" />
				</a>
			</Card>
			<Card>
				<h3 class="mb-1 font-semibold text-midnight">Notifications</h3>
				<p class="mb-3 text-sm text-indigo">In-app alerts for subscribers, campaigns, and more.</p>
				<a href="/dashboard/notifications" class="inline-flex items-center gap-1 text-sm font-medium text-ocean hover:underline">
					Open notifications
					<Icon name="arrow-right" class="h-3.5 w-3.5" />
				</a>
			</Card>
			<Card>
				<h3 class="mb-1 font-semibold text-midnight">Settings</h3>
				<p class="mb-3 text-sm text-indigo">Password, notification prefs, communications.</p>
				<a href="/dashboard/settings" class="inline-flex items-center gap-1 text-sm font-medium text-ocean hover:underline">
					Open settings
					<Icon name="arrow-right" class="h-3.5 w-3.5" />
				</a>
			</Card>
		</div>
	</section>

	{#if data.unreadCount === 0}
		<Card>
			<p class="mb-4 text-sm text-indigo">Try the notification centre — seed a welcome message:</p>
			<Button variant="accent" onclick={seedNotification} disabled={seeding}>
				{seeding ? 'Creating…' : 'Send welcome notification'}
			</Button>
		</Card>
	{/if}
</div>

<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '$lib/components/icons/Icon.svelte';
	import { isModuleVisible, MODULE_ICON_NAMES, moduleDashboardPath } from '$lib/modules';
	import type { Module } from '$lib/types';

	let { modules = [] }: { modules: Module[] } = $props();

	const visibleModules = $derived(modules.filter((m) => isModuleVisible(m.slug)));
</script>

<aside
	class="flex w-56 shrink-0 flex-col border-r border-sky-mist/80 bg-periwinkle p-4 lg:w-56 max-lg:w-16 max-lg:items-center"
>
	<nav class="flex flex-1 flex-col gap-1">
		<a
			href="/dashboard"
			class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition max-lg:justify-center
			{$page.url.pathname === '/dashboard'
				? 'bg-ocean text-white'
				: 'text-midnight hover:bg-sky-mist'}"
			title="Home"
		>
			<Icon name="home" class="h-5 w-5 shrink-0" />
			<span class="max-lg:hidden">Home</span>
		</a>

		{#each visibleModules as mod (mod.slug)}
			<a
				href={moduleDashboardPath(mod.slug)}
				class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition max-lg:justify-center
				{$page.url.pathname.includes(mod.slug.replace('_', '-'))
					? 'bg-ocean text-white'
					: mod.locked
						? 'text-indigo/70'
						: 'text-midnight hover:bg-sky-mist'}"
				title={mod.name}
			>
				<Icon name={MODULE_ICON_NAMES[mod.slug] ?? 'default'} class="h-5 w-5 shrink-0" />
				<span class="max-lg:hidden flex-1">{mod.name}</span>
				{#if mod.locked}
					<Icon name="lock" class="max-lg:hidden h-3.5 w-3.5 shrink-0 opacity-70" label="Locked" />
				{/if}
			</a>
		{/each}
	</nav>

	<div class="mt-auto space-y-1 max-lg:hidden">
		<a
			href="/dashboard/notifications"
			class="block rounded-lg px-3 py-2 text-sm text-midnight hover:bg-sky-mist"
		>
			Notifications
		</a>
		<a
			href="/dashboard/settings"
			class="block rounded-lg px-3 py-2 text-sm text-midnight hover:bg-sky-mist"
		>
			Settings
		</a>
	</div>
</aside>

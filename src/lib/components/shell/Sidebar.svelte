<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/icons/Icon.svelte';
	import {
		isDashboardHomeActive,
		isModuleNavActive,
		isModuleVisible,
		MODULE_ICON_NAMES,
		moduleDashboardPath
	} from '$lib/modules';
	import type { Module } from '$lib/types';

	let { modules = [] }: { modules: Module[] } = $props();

	const visibleModules = $derived(modules.filter((m) => isModuleVisible(m.slug)));
	const pathname = $derived(page.url.pathname);

	function itemClass(active: boolean, locked = false): string {
		const base =
			'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition max-lg:justify-center';
		const state = active
			? 'bg-ocean font-medium text-white'
			: locked
				? 'cursor-not-allowed text-indigo/70'
				: 'text-midnight hover:bg-sky-mist';
		return `${base} ${state}`;
	}
</script>

<aside class="w-(--sidebar-w) shrink-0 max-lg:[--sidebar-w:4rem] lg:[--sidebar-w:14rem]">
	<div
		class="fixed top-0 left-0 flex h-screen w-(--sidebar-w) shrink-0 flex-col border-r border-sky-mist/80 bg-periwinkle p-4 max-lg:items-center"
	>
		<nav aria-label="Main" class="flex flex-1 flex-col gap-1">
			<a
				href="/dashboard"
				class={itemClass(isDashboardHomeActive(pathname))}
				title="Home"
				aria-current={isDashboardHomeActive(pathname) ? 'page' : undefined}
			>
				<Icon name="home" class="h-5 w-5 shrink-0" />
				<span class="max-lg:hidden">Home</span>
			</a>

			{#each visibleModules as mod (mod.slug)}
				{#if mod.locked}
					<span
						class={itemClass(false, true)}
						title="{mod.name} — not available on your plan"
						aria-disabled="true"
					>
						<Icon name={MODULE_ICON_NAMES[mod.slug] ?? 'default'} class="h-5 w-5 shrink-0" />
						<span class="flex-1 max-lg:hidden">{mod.name}</span>
						<Icon
							name="lock"
							class="h-3.5 w-3.5 shrink-0 opacity-70 max-lg:hidden"
							label="Locked"
						/>
					</span>
				{:else}
					{@const active = isModuleNavActive(pathname, mod.slug)}
					<a
						href={moduleDashboardPath(mod.slug)}
						class={itemClass(active)}
						title={mod.name}
						aria-current={active ? 'page' : undefined}
					>
						<Icon name={MODULE_ICON_NAMES[mod.slug] ?? 'default'} class="h-5 w-5 shrink-0" />
						<span class="flex-1 max-lg:hidden">{mod.name}</span>
					</a>
				{/if}
			{/each}
		</nav>
	</div>
</aside>

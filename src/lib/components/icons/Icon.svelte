<script lang="ts">
	import type { IconName } from '$lib/icons';
	import { isIconName } from '$lib/icons';

	let {
		name,
		class: className = 'h-5 w-5',
		label
	}: {
		name: IconName | string;
		class?: string;
		label?: string;
	} = $props();

	const icon = $derived(isIconName(name) ? name : 'default');
</script>

<svg
	class={className}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden={label ? undefined : true}
	role={label ? 'img' : undefined}
	aria-label={label}
>
	{#if icon === 'home'}
		<path d="M3 10.5 12 3l9 7.5" />
		<path d="M5 9.5V20h14V9.5" />
		<path d="M9 20v-6h6v6" />
	{:else if icon === 'content'}
		<path d="M12 20h9" />
		<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
	{:else if icon === 'chart'}
		<path d="M3 3v18h18" />
		<path d="M7 16V8" />
		<path d="M12 16V5" />
		<path d="M17 16v-4" />
	{:else if icon === 'mail'}
		<rect x="3" y="5" width="18" height="14" rx="2" />
		<path d="m3 7 9 6 9-6" />
	{:else if icon === 'link'}
		<path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5" />
		<path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.41a5 5 0 0 0 7.07 7.07L14 19" />
	{:else if icon === 'id-card'}
		<rect x="3" y="4" width="18" height="16" rx="2" />
		<circle cx="9" cy="10" r="2" />
		<path d="M15 8h4M15 12h4M7 16h10" />
	{:else if icon === 'cart'}
		<circle cx="9" cy="20" r="1" />
		<circle cx="17" cy="20" r="1" />
		<path d="M2 2h2l1.6 9.6a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L21 6H6" />
	{:else if icon === 'users'}
		<circle cx="9" cy="8" r="3" />
		<path d="M2 20a7 7 0 0 1 14 0" />
		<circle cx="17" cy="9" r="2.5" />
		<path d="M22 20a5.5 5.5 0 0 0-6-4.5" />
	{:else if icon === 'lock'}
		<rect x="5" y="11" width="14" height="10" rx="2" />
		<path d="M8 11V8a4 4 0 0 1 8 0v3" />
	{:else if icon === 'bell'}
		<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
		<path d="M10 21a2 2 0 0 0 4 0" />
	{:else if icon === 'chevron-up'}
		<path d="m18 15-6-6-6 6" />
	{:else if icon === 'chevron-down'}
		<path d="m6 9 6 6 6-6" />
	{:else if icon === 'chevron-left'}
		<path d="m15 18-6-6 6-6" />
	{:else if icon === 'arrow-right'}
		<path d="M5 12h14" />
		<path d="m13 6 6 6-6 6" />
	{:else if icon === 'x'}
		<path d="M18 6 6 18M6 6l12 12" />
	{:else if icon === 'globe'}
		<circle cx="12" cy="12" r="9" />
		<path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
	{:else if icon === 'star'}
		<path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 7L12 18.8 5.7 21.2 6.9 14 2 9.3l7-1Z" />
	{:else if icon === 'phone'}
		<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.61a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.47-1.12a2 2 0 0 1 2.11-.45c.84.28 1.71.48 2.61.6A2 2 0 0 1 22 16.92Z" />
	{:else if icon === 'music'}
		<path d="M9 18V5l12-2v13" />
		<circle cx="6" cy="18" r="3" />
		<circle cx="18" cy="16" r="3" />
	{:else}
		<path d="M12 2 4 7v10l8 5 8-5V7Z" />
		<path d="M12 22V12M4 7l8 5 8-5" />
	{/if}
</svg>

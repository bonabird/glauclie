<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';

	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		class: className = '',
		children,
		...rest
	}: {
		variant?: Variant;
		type?: 'button' | 'submit';
		disabled?: boolean;
		class?: string;
		children: Snippet;
		[key: string]: unknown;
	} = $props();

	const variants: Record<Variant, string> = {
		primary: 'bg-ocean text-white hover:opacity-90 focus:ring-ocean',
		secondary: 'bg-sky-mist text-midnight hover:opacity-90',
		accent: 'bg-amber text-midnight hover:opacity-90 focus:ring-amber',
		danger: 'bg-danger text-white hover:opacity-90',
		ghost: 'bg-transparent text-ocean hover:bg-sky-mist/50'
	};
</script>

<button
	{type}
	{disabled}
	class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:ring-2 focus:outline-none disabled:opacity-50 {variants[
		variant
	]} {className}"
	{...rest}
>
	{@render children()}
</button>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		style = '',
		children
	}: { class?: string; style?: string; children: Snippet } = $props();
</script>

<div class="rounded-sm bg-sky-mist p-6 shadow-sm {className}" {style}>
	{@render children()}
</div>

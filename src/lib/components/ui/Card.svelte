<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: className = '', children }: { class?: string; children: Snippet } = $props();
</script>

<div class="rounded-sm bg-sky-mist p-6 shadow-sm {className}">
	{@render children()}
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/dashboard/modules/community', { replaceState: true });
	});
</script>

<p class="text-indigo">Redirecting to community users…</p>

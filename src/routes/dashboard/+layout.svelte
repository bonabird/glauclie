<script lang="ts">
	import Header from '$lib/components/shell/Header.svelte';
	import Sidebar from '$lib/components/shell/Sidebar.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data, children } = $props();

	async function refreshNotifications() {
		await invalidateAll();
	}
</script>

<div class="flex min-h-screen">
	<Sidebar modules={data.modules} />
	<div class="flex flex-1 flex-col">
		{#if data.user}
			<Header
				user={data.user}
				tenant={data.tenant}
				unreadCount={data.unreadCount}
				recentNotifications={data.recentNotifications}
				onRefreshNotifications={refreshNotifications}
			/>
		{/if}
		<main class="flex-1 overflow-auto p-6">{@render children()}</main>
	</div>
</div>

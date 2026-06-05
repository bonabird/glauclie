<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
</script>

<Card class="max-w-xl">
	<h1 class="mb-4 text-xl font-semibold text-midnight">Settings</h1>
	<ul class="space-y-2">
		<li>
			<a href="/dashboard/settings/password" class="text-ocean hover:underline">Change password</a>
		</li>
		<li>
			<a href="/dashboard/settings/notifications" class="text-ocean hover:underline"
				>Notification preferences</a
			>
		</li>
		<li>
			<a href="/dashboard/settings/communications" class="text-ocean hover:underline"
				>Communication preferences</a
			>
		</li>
		<li>
			<a href="/dashboard/settings/danger-zone" class="text-danger hover:underline">Danger zone</a>
		</li>
	</ul>
</Card>

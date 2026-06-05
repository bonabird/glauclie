<script lang="ts">
	let { status }: { status: string } = $props();

	const styles: Record<string, string> = {
		draft: 'bg-indigo/10 text-indigo',
		published: 'bg-success/10 text-success',
		archived: 'bg-warning/10 text-warning'
	};
</script>

<span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize {styles[status] ?? ''}">
	{status}
</span>

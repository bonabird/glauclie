<script lang="ts">
	import type { NewsletterCampaign } from '$lib/types';

	let { status }: { status: NewsletterCampaign['status'] } = $props();

	const labels: Record<string, string> = {
		draft: 'Draft',
		sending: 'Sending',
		sent: 'Sent',
		failed: 'Failed'
	};

	const colors: Record<string, string> = {
		draft: 'bg-indigo/20 text-indigo',
		sending: 'bg-amber/30 text-warning',
		sent: 'bg-success/20 text-success',
		failed: 'bg-danger/20 text-danger'
	};
</script>

<span class="rounded-full px-2 py-0.5 text-xs font-medium {colors[status] ?? colors.draft}">
	{labels[status] ?? status}
</span>

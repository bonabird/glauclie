<script lang="ts">
	let {
		label,
		id,
		value = $bindable(''),
		error = '',
		class: className = '',
		...rest
	}: {
		label: string;
		id: string;
		value?: string;
		error?: string;
		class?: string;
		[key: string]: unknown;
	} = $props();
</script>

<div class="space-y-1">
	<label for={id} class="block text-sm font-medium text-indigo">{label}</label>
	<input
		{id}
		bind:value
		class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-midnight placeholder:text-indigo/60 focus:border-ocean focus:ring-2 focus:ring-ocean/30 focus:outline-none {className}"
		{...rest}
	/>
	{#if error}
		<p class="text-sm text-danger">{error}</p>
	{/if}
</div>

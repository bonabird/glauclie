<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import MarkdownIt from 'markdown-it';
	import { api } from '$lib/api/client';
	import type { ContentEntry, ContentType, FieldDef, RecipeStep } from '$lib/types';

	let html = $state('');
	let entry = $state<ContentEntry | null>(null);
	let schema = $state<FieldDef[]>([]);

	const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

	function normalizeStep(raw: Record<string, unknown>, order: number): RecipeStep {
		return {
			order: typeof raw.order === 'number' ? raw.order : order,
			title: String(raw.title ?? ''),
			subtitle: String(raw.subtitle ?? ''),
			text: String(raw.text ?? ''),
			chefs_note: String(raw.chefs_note ?? ''),
			image: raw.image ? String(raw.image) : raw.image_url ? String(raw.image_url) : null
		};
	}

	onMount(async () => {
		const e = await api<ContentEntry>(`/api/v1/content/entries/${$page.params.id}`);
		entry = {
			...e,
			fields: typeof e.fields === 'object' ? e.fields : JSON.parse(String(e.fields))
		};
		html = md.render(e.body || '');

		const types = await api<{ types: ContentType[] }>('/api/v1/content/types');
		const ct = types.types.find((t) => t.id === e.content_type_id);
		if (ct) {
			schema = typeof ct.schema === 'string' ? JSON.parse(ct.schema) : (ct.schema as FieldDef[]);
		}
	});
</script>

<svelte:head>
	<title>Preview — {entry?.title ?? 'Content'}</title>
</svelte:head>

<div class="min-h-screen bg-white text-[#1a1a1a]">
	<article class="mx-auto max-w-3xl px-6 py-12">
		<p class="mb-2 text-xs uppercase tracking-wide text-neutral-500">Content preview</p>
		{#if entry}
			<h1 class="mb-6 text-4xl font-bold leading-tight">{entry.title}</h1>

			{#if schema.length > 0}
				<div class="mb-8 space-y-4 border-b border-neutral-200 pb-8">
					{#each schema as field (field.name)}
						{#if field.type === 'recipe_steps' && Array.isArray(entry.fields[field.name])}
							<div>
								<h2 class="mb-2 text-lg font-semibold">{field.label}</h2>
								<ol class="list-decimal space-y-6 pl-5">
									{#each entry.fields[field.name] as Record<string, unknown>[] as raw, i}
										{@const step = normalizeStep(raw, i + 1)}
										<li class="space-y-2">
											{#if step.title}
												<p class="text-lg font-semibold">{step.title}</p>
											{/if}
											{#if step.subtitle}
												<p class="text-sm text-neutral-600">{step.subtitle}</p>
											{/if}
											{#if step.text}
												<p>{step.text}</p>
											{/if}
											{#if step.chefs_note}
												<p class="rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm italic text-neutral-700">
													<strong>Chef's note:</strong>
													{step.chefs_note}
												</p>
											{/if}
											{#if step.image}
												<img src={step.image} alt="" class="mt-2 max-w-md rounded" />
											{/if}
										</li>
									{/each}
								</ol>
							</div>
						{:else if field.type === 'array' && Array.isArray(entry.fields[field.name])}
							<div>
								<h2 class="mb-2 text-lg font-semibold">{field.label}</h2>
								<ul class="list-disc pl-5">
									{#each entry.fields[field.name] as string[] as item}
										<li>{item}</li>
									{/each}
								</ul>
							</div>
						{:else if entry.fields[field.name]}
							<p>
								<strong>{field.label}:</strong>
								{entry.fields[field.name]}
							</p>
						{/if}
					{/each}
				</div>
			{/if}

			<div class="prose prose-neutral max-w-none">
				{@html html}
			</div>
		{:else}
			<p class="text-neutral-500">Loading preview…</p>
		{/if}
	</article>
</div>

<style>
	:global(.prose h1) {
		font-size: 1.875rem;
		font-weight: 700;
		margin: 1.5rem 0 0.75rem;
	}
	:global(.prose h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 1.25rem 0 0.5rem;
	}
	:global(.prose p) {
		margin: 0.75rem 0;
		line-height: 1.7;
	}
	:global(.prose ul) {
		list-style: disc;
		padding-left: 1.5rem;
		margin: 0.75rem 0;
	}
	:global(.prose blockquote) {
		border-left: 4px solid #ccc;
		padding-left: 1rem;
		color: #555;
		margin: 1rem 0;
	}
	:global(.prose img) {
		max-width: 100%;
		border-radius: 0.5rem;
	}
</style>

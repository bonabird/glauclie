<script lang="ts">
	import type { FieldDef, RecipeStep } from '$lib/types';

	let {
		schema = [],
		fields = $bindable<Record<string, unknown>>({})
	}: {
		schema: FieldDef[];
		fields?: Record<string, unknown>;
	} = $props();

	function emptyStep(order: number): RecipeStep {
		return {
			order,
			title: '',
			subtitle: '',
			text: '',
			chefs_note: '',
			image: null
		};
	}

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

	function getSteps(fieldName: string): RecipeStep[] {
		const raw = fields[fieldName];
		if (Array.isArray(raw) && raw.length > 0) {
			return raw.map((step, i) => normalizeStep(step as Record<string, unknown>, i + 1));
		}
		return [emptyStep(1)];
	}

	function setSteps(fieldName: string, steps: RecipeStep[]) {
		fields = { ...fields, [fieldName]: steps };
	}

	function updateStep(fieldName: string, index: number, patch: Partial<RecipeStep>) {
		const steps = getSteps(fieldName);
		steps[index] = { ...steps[index], ...patch };
		setSteps(fieldName, steps);
	}
</script>

<div class="space-y-4">
	{#each schema as field (field.name)}
		{#if field.type === 'recipe_steps'}
			<div class="space-y-2">
				<p class="text-sm font-medium text-indigo">{field.label}{field.required ? ' *' : ''}</p>
				{#each getSteps(field.name) as step, i (i)}
					<div class="rounded-lg bg-periwinkle/40 p-3">
						<div class="mb-2 flex items-center justify-between gap-2">
							<span class="text-sm font-medium text-midnight">Step {step.order}</span>
							<button
								type="button"
								class="text-xs text-danger"
								onclick={() => {
									const steps = getSteps(field.name).filter((_, j) => j !== i);
									steps.forEach((s, j) => (s.order = j + 1));
									setSteps(field.name, steps);
								}}
								disabled={getSteps(field.name).length <= 1}
							>
								Remove
							</button>
						</div>
						<div class="space-y-2">
							<label class="block text-xs text-indigo" for="step-title-{field.name}-{i}"
								>Title</label
							>
							<input
								id="step-title-{field.name}-{i}"
								class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm text-midnight"
								placeholder="Optional step title"
								value={step.title}
								oninput={(e) =>
									updateStep(field.name, i, {
										title: (e.target as HTMLInputElement).value
									})}
							/>
							<label class="block text-xs text-indigo" for="step-subtitle-{field.name}-{i}"
								>Subtitle</label
							>
							<input
								id="step-subtitle-{field.name}-{i}"
								class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm text-midnight"
								placeholder="Optional step subtitle"
								value={step.subtitle}
								oninput={(e) =>
									updateStep(field.name, i, {
										subtitle: (e.target as HTMLInputElement).value
									})}
							/>
							<label class="block text-xs text-indigo" for="step-text-{field.name}-{i}"
								>Text *</label
							>
							<textarea
								id="step-text-{field.name}-{i}"
								class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm text-midnight"
								placeholder="Step instructions"
								value={step.text}
								oninput={(e) =>
									updateStep(field.name, i, {
										text: (e.target as HTMLTextAreaElement).value
									})}
							></textarea>
							<label class="block text-xs text-indigo" for="step-note-{field.name}-{i}"
								>Chef's note</label
							>
							<textarea
								id="step-note-{field.name}-{i}"
								class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm text-midnight"
								placeholder="Optional tip or note"
								value={step.chefs_note}
								oninput={(e) =>
									updateStep(field.name, i, {
										chefs_note: (e.target as HTMLTextAreaElement).value
									})}
							></textarea>
							<label class="block text-xs text-indigo" for="step-img-{field.name}-{i}"
								>Image URL</label
							>
							<input
								id="step-img-{field.name}-{i}"
								class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm"
								placeholder="Optional image URL"
								value={step.image ?? ''}
								oninput={(e) =>
									updateStep(field.name, i, {
										image: (e.target as HTMLInputElement).value || null
									})}
							/>
						</div>
					</div>
				{/each}
				<button
					type="button"
					class="text-sm text-ocean"
					onclick={() => {
						const steps = getSteps(field.name);
						steps.push(emptyStep(steps.length + 1));
						setSteps(field.name, steps);
					}}
				>
					+ Add step
				</button>
			</div>
		{:else if field.type === 'array'}
			<div class="space-y-1">
				<label class="block text-sm font-medium text-indigo" for={field.name}
					>{field.label}{field.required ? ' *' : ''}</label
				>
				<textarea
					id={field.name}
					class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-sm text-midnight"
					placeholder="One item per line"
					value={Array.isArray(fields[field.name])
						? (fields[field.name] as string[]).join('\n')
						: ''}
					oninput={(e) => {
						const lines = (e.target as HTMLTextAreaElement).value
							.split('\n')
							.map((l) => l.trim())
							.filter(Boolean);
						fields = { ...fields, [field.name]: lines };
					}}
				></textarea>
			</div>
		{:else}
			<div class="space-y-1">
				<label class="block text-sm font-medium text-indigo" for={field.name}
					>{field.label}{field.required ? ' *' : ''}</label
				>
				<input
					id={field.name}
					type={field.type === 'url' ? 'url' : 'text'}
					class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-midnight"
					value={String(fields[field.name] ?? '')}
					oninput={(e) => {
						fields = { ...fields, [field.name]: (e.target as HTMLInputElement).value };
					}}
				/>
			</div>
		{/if}
	{/each}
</div>

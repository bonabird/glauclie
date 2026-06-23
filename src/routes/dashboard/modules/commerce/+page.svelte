<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { api, ApiError } from '$lib/api/client';
	import { apiUrl } from '$lib/env/public';
	import { formatPrice } from '$lib/shop';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { CommerceProduct, Module } from '$lib/types';

	let { data } = $props();

	const mod = $derived(data.modules.find((m: Module) => m.slug === 'commerce'));

	let saving = $state(false);
	let uploading = $state(false);
	let error = $state('');
	let success = $state('');

	let editingId = $state<string | null>(null);
	let name = $state('');
	let slug = $state('');
	let description = $state('');
	let price = $state('');
	let categories = $state('');
	let unlocksTier = $state('');
	let status = $state<'draft' | 'active' | 'archived'>('draft');
	let productPhotoFile = $state<File | null>(null);
	let digitalFile = $state<File | null>(null);
	let productPhotoInput = $state<HTMLInputElement | null>(null);
	let digitalFileInput = $state<HTMLInputElement | null>(null);
	let uploadProductId = $state<string | null>(null);
	let photoProductId = $state<string | null>(null);

	function resetForm() {
		editingId = null;
		name = '';
		slug = '';
		description = '';
		price = '';
		categories = '';
		unlocksTier = '';
		status = 'draft';
		productPhotoFile = null;
		digitalFile = null;
		if (productPhotoInput) productPhotoInput.value = '';
		if (digitalFileInput) digitalFileInput.value = '';
		error = '';
	}

	function editProduct(p: CommerceProduct) {
		editingId = p.id;
		name = p.name;
		slug = p.slug;
		description = p.description;
		price = (p.price_cents / 100).toFixed(2);
		categories = (p.categories ?? []).join(', ');
		unlocksTier = p.unlocks_tier ?? '';
		status = p.status ?? (p.active ? 'active' : 'draft');
		productPhotoFile = null;
		digitalFile = null;
		error = '';
		success = '';
	}

	async function uploadProductMedia(productId: string, file: File) {
		const fd = new FormData();
		fd.append('file', file);
		const res = await fetch(apiUrl(`/api/v1/commerce/products/${productId}/media`), {
			method: 'POST',
			body: fd,
			credentials: 'include'
		});
		const payload = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new ApiError(res.status, (payload as { error?: string }).error ?? 'Photo upload failed');
		}
	}

	async function uploadProductAsset(productId: string, file: File) {
		const fd = new FormData();
		fd.append('file', file);
		const res = await fetch(apiUrl(`/api/v1/commerce/products/${productId}/file`), {
			method: 'POST',
			body: fd,
			credentials: 'include'
		});
		const payload = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new ApiError(res.status, (payload as { error?: string }).error ?? 'File upload failed');
		}
	}

	async function saveProduct(e: Event) {
		e.preventDefault();
		saving = true;
		error = '';
		success = '';
		const priceCents = Math.round(parseFloat(price || '0') * 100);
		if (Number.isNaN(priceCents) || priceCents < 0) {
			error = 'Enter a valid price';
			saving = false;
			return;
		}
		const body = {
			name,
			slug,
			description,
			price_cents: priceCents,
			currency: 'eur',
			categories: categories
				.split(',')
				.map((category) => category.trim())
				.filter(Boolean),
			unlocks_tier: unlocksTier || null,
			status,
			active: status === 'active'
		};
		try {
			let saved: CommerceProduct;
			if (editingId) {
				saved = await api<CommerceProduct>(`/api/v1/commerce/products/${editingId}`, { method: 'PATCH', json: body });
				success = 'Product updated';
			} else {
				saved = await api<CommerceProduct>('/api/v1/commerce/products', { method: 'POST', json: body });
				success = 'Product created';
			}
			if (productPhotoFile) {
				await uploadProductMedia(saved.id, productPhotoFile);
				success = `${success}. Product photo uploaded`;
			}
			if (digitalFile) {
				await uploadProductAsset(saved.id, digitalFile);
				success = `${success}. Digital file uploaded`;
			}
			resetForm();
			await invalidateAll();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Save failed';
		} finally {
			saving = false;
		}
	}

	async function removeProduct(id: string) {
		if (!confirm('Delete this product?')) return;
		try {
			await api(`/api/v1/commerce/products/${id}`, { method: 'DELETE' });
			if (editingId === id) resetForm();
			await invalidateAll();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Delete failed';
		}
	}

	async function uploadFile(e: Event, productId: string) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploading = true;
		uploadProductId = productId;
		error = '';
		success = '';
		try {
			await uploadProductAsset(productId, file);
			success = 'Digital file uploaded';
			await invalidateAll();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Upload failed';
		} finally {
			uploading = false;
			uploadProductId = null;
			input.value = '';
		}
	}

	async function uploadPhoto(e: Event, productId: string) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploading = true;
		photoProductId = productId;
		error = '';
		success = '';
		try {
			await uploadProductMedia(productId, file);
			success = 'Product photo uploaded';
			await invalidateAll();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Upload failed';
		} finally {
			uploading = false;
			photoProductId = null;
			input.value = '';
		}
	}
</script>

{#if mod?.locked}
	<Card class="text-center">
		<p class="mb-2 text-lg font-semibold text-midnight">Commerce is not available</p>
		<p class="text-sm text-indigo">Upgrade your plan to sell digital products.</p>
	</Card>
{:else}
	<div class="space-y-6">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="text-2xl font-semibold text-midnight">Commerce</h1>
				<p class="mt-1 text-sm text-indigo">
					Create digital products, upload public photos, and provide the API endpoint for the client's website.
				</p>
			</div>
			{#if data.productsApiUrl}
				<div class="rounded-lg border border-sky-mist bg-white px-4 py-3 text-right">
					<p class="text-xs font-semibold uppercase tracking-wide text-indigo">Public products API</p>
					<a
						href={data.productsApiUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="break-all text-sm font-medium text-ocean hover:underline"
					>
						{data.productsApiUrl}
					</a>
				</div>
			{/if}
		</div>

		{#if data.loadError}
			<p class="text-sm text-danger">{data.loadError}</p>
		{/if}

		<div class="grid gap-6 lg:grid-cols-2">
			<Card>
				<h2 class="mb-4 text-lg font-semibold text-midnight">
					{editingId ? 'Edit product' : 'New product'}
				</h2>
				<form class="space-y-4" onsubmit={saveProduct}>
					<Input id="name" label="Name" bind:value={name} required />
					<Input
						id="slug"
						label="URL slug"
						bind:value={slug}
						placeholder="auto-generated from name if empty"
					/>
					<div class="space-y-1">
						<label for="description" class="block text-sm font-medium text-indigo">Description</label>
						<textarea
							id="description"
							bind:value={description}
							rows="4"
							class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-midnight focus:border-ocean focus:ring-2 focus:ring-ocean/30 focus:outline-none"
						></textarea>
					</div>
					<Input id="price" label="Price (EUR)" type="number" step="0.01" min="0" bind:value={price} required />
					<Input
						id="categories"
						label="Categories"
						bind:value={categories}
						placeholder="Desserts, Courses, Samples"
					/>
					<div class="space-y-1">
						<label for="unlocks_tier" class="block text-sm font-medium text-indigo">Unlocks tier</label>
						<select
							id="unlocks_tier"
							bind:value={unlocksTier}
							class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-midnight focus:border-ocean focus:ring-2 focus:ring-ocean/30 focus:outline-none"
						>
							<option value="">No tier unlock</option>
							<option value="free">Free</option>
							<option value="paid">Paid</option>
							<option value="vip">VIP</option>
						</select>
					</div>
					<div class="space-y-1">
						<label for="status" class="block text-sm font-medium text-indigo">Status</label>
						<select
							id="status"
							bind:value={status}
							class="w-full rounded-lg border border-sky-mist bg-sky-mist/60 px-3 py-2 text-midnight focus:border-ocean focus:ring-2 focus:ring-ocean/30 focus:outline-none"
						>
							<option value="draft">Draft</option>
							<option value="active">Active</option>
							<option value="archived">Archived</option>
						</select>
					</div>
					<div class="rounded-lg border border-sky-mist p-4">
						<h3 class="text-sm font-semibold text-midnight">Files</h3>
						<p class="mt-1 text-xs text-indigo">
							Optional on save. The product is created first, then these files are uploaded automatically.
						</p>
						<div class="mt-4 space-y-4">
							<div class="space-y-1">
								<label for="product_photo" class="block text-sm font-medium text-indigo">
									Storefront photo
								</label>
								<input
									id="product_photo"
									type="file"
									bind:this={productPhotoInput}
									accept="image/jpeg,image/png,image/webp"
									onchange={(e) => {
										productPhotoFile = e.currentTarget.files?.[0] ?? null;
									}}
									class="block w-full text-sm text-indigo file:mr-3 file:rounded-lg file:border-0 file:bg-ocean file:px-3 file:py-2 file:text-white"
								/>
								<p class="text-xs text-indigo">Public image, resized on upload. JPG, PNG, or WebP up to 10MB.</p>
							</div>
							<div class="space-y-1">
								<label for="digital_file" class="block text-sm font-medium text-indigo">
									Paid digital download
								</label>
								<input
									id="digital_file"
									type="file"
									bind:this={digitalFileInput}
									onchange={(e) => {
										digitalFile = e.currentTarget.files?.[0] ?? null;
									}}
									class="block w-full text-sm text-indigo file:mr-3 file:rounded-lg file:border-0 file:bg-ocean file:px-3 file:py-2 file:text-white"
								/>
								<p class="text-xs text-indigo">Private file delivered after payment. Stored in the private R2 bucket.</p>
							</div>
						</div>
					</div>
					{#if error}
						<p class="text-sm text-danger">{error}</p>
					{/if}
					{#if success}
						<p class="text-sm text-success">{success}</p>
					{/if}
					<div class="flex gap-2">
						<Button type="submit" disabled={saving}>
							{saving ? 'Saving…' : editingId ? 'Update product' : 'Create product'}
						</Button>
						{#if editingId}
							<Button type="button" variant="secondary" onclick={resetForm}>Cancel</Button>
						{/if}
					</div>
				</form>
			</Card>

			<Card>
				<h2 class="mb-4 text-lg font-semibold text-midnight">Your products</h2>
				{#if data.products.length === 0}
					<p class="text-sm text-indigo">No products yet. Create one to get started.</p>
				{:else}
					<ul class="divide-y divide-sky-mist">
						{#each data.products as product (product.id)}
							<li class="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
								<div class="flex items-start justify-between gap-3">
									<div class="flex gap-3">
										{#if product.media?.[0]?.thumbnail_url || product.image_url}
											<img
												src={product.media?.[0]?.thumbnail_url ?? product.image_url ?? ''}
												alt={product.name}
												class="h-14 w-20 rounded-lg object-cover"
											/>
										{/if}
										<div>
										<p class="font-medium text-midnight">{product.name}</p>
										<p class="text-sm text-indigo">
											{formatPrice(product.price_cents, product.currency)}
											· {product.status}
											· {product.has_file ? 'File attached' : 'No file'}
											{#if product.unlocks_tier}· Unlocks {product.unlocks_tier}{/if}
										</p>
										{#if product.categories?.length}
											<p class="mt-1 text-xs text-indigo">{product.categories.join(', ')}</p>
										{/if}
										</div>
									</div>
									<div class="flex shrink-0 gap-2">
										<Button variant="secondary" onclick={() => editProduct(product)}>Edit</Button>
										<Button variant="secondary" onclick={() => removeProduct(product.id)}>
											Delete
										</Button>
									</div>
								</div>
								<div class="flex flex-wrap gap-4">
									<label class="inline-flex cursor-pointer items-center gap-2 text-sm text-ocean hover:underline">
										<input
											type="file"
											accept="image/jpeg,image/png,image/webp"
											class="hidden"
											disabled={uploading && photoProductId === product.id}
											onchange={(e) => uploadPhoto(e, product.id)}
										/>
										{uploading && photoProductId === product.id
											? 'Uploading photo…'
											: product.media?.length
												? 'Add another photo'
												: 'Upload product photo'}
									</label>
									<label class="inline-flex cursor-pointer items-center gap-2 text-sm text-ocean hover:underline">
										<input
											type="file"
											class="hidden"
											disabled={uploading && uploadProductId === product.id}
											onchange={(e) => uploadFile(e, product.id)}
										/>
										{uploading && uploadProductId === product.id
											? 'Uploading…'
											: product.has_file
												? 'Replace digital file'
												: 'Upload digital file'}
									</label>
								</div>
								<div>
									<p class="mt-1 text-xs text-indigo">
										Photos are public and resized on upload. Digital files are stored privately in R2.
									</p>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</Card>
		</div>
	</div>
{/if}

<script lang="ts">
	import Icon from '$lib/components/icons/Icon.svelte';
	import { apiUrl, publicApiUrl } from '$lib/env/public';
	import { joinFullName, parsePublicCard } from '$lib/business-card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const card = $derived(parsePublicCard(data.card));
	const tenantSlug = $derived(data.tenantSlug);
	const cardPersonName = $derived(joinFullName(card.firstName, card.surname, card.legacyName));
	const cardHeading = $derived(cardPersonName || card.displayName);

	let scanId = $state('');
	let error = $state('');
	let savedToDevice = $state(false);
	let showShareModal = $state(false);
	let shareSubmitting = $state(false);
	let shareSuccess = $state(false);

	let visitorFirstName = $state('');
	let visitorSurname = $state('');
	let visitorEmail = $state('');
	let visitorPhone = $state('');
	let locationLabel = $state('');
	let shareConsent = $state(false);

	async function recordScan(): Promise<string | null> {
		if (scanId) return scanId;
		if (!publicApiUrl()) return null;
		try {
			const res = await fetch(apiUrl(`/api/v1/public/${tenantSlug}/card/scan`), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: '{}'
			});
			const body = await res.json();
			if (!res.ok) return null;
			scanId = body.scan_id;
			return scanId;
		} catch {
			return null;
		}
	}

	$effect(() => {
		data.tenantSlug;
		if (!publicApiUrl()) return;
		scanId = '';
		void recordScan();
	});

	function escapeVcard(value: string) {
		return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
	}

	function buildVcard() {
		const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
		const fullName = cardPersonName || card.displayName;
		const org =
			card.displayName && cardPersonName && card.displayName !== cardPersonName
				? card.displayName
				: '';
		if (card.firstName || card.surname) {
			lines.push(`N:${escapeVcard(card.surname)};${escapeVcard(card.firstName)};;;`);
		}
		if (fullName) lines.push(`FN:${escapeVcard(fullName)}`);
		if (org) lines.push(`ORG:${escapeVcard(org)}`);
		else if (card.displayName && !cardPersonName) {
			lines.push(`ORG:${escapeVcard(card.displayName)}`);
		}
		if (card.role) lines.push(`TITLE:${escapeVcard(card.role)}`);
		if (card.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVcard(card.email)}`);
		if (card.phone) lines.push(`TEL;TYPE=CELL:${escapeVcard(card.phone)}`);
		if (card.website) lines.push(`URL:${escapeVcard(websiteHref(card.website))}`);
		for (const link of card.socialLinks) {
			if (link.url) lines.push(`URL:${escapeVcard(link.url)}`);
		}
		lines.push('END:VCARD');
		return lines.join('\r\n');
	}

	function downloadVcard() {
		const blob = new Blob([buildVcard()], { type: 'text/vcard;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		const fileBase = (cardPersonName || card.displayName || 'contact').replace(/[^\w-]+/g, '-');
		anchor.href = url;
		anchor.download = `${fileBase}.vcf`;
		anchor.click();
		URL.revokeObjectURL(url);
		savedToDevice = true;
		showShareModal = true;
	}

	function closeShareModal() {
		showShareModal = false;
		error = '';
	}

	async function submitShare(e: Event) {
		e.preventDefault();
		if (!publicApiUrl()) {
			error = 'Sharing is unavailable — API URL is not configured.';
			return;
		}
		if (!shareConsent) {
			error = 'Please agree before sharing your details.';
			return;
		}
		shareSubmitting = true;
		error = '';
		try {
			const id = await recordScan();
			if (!id) {
				throw new Error('Could not start session — try again');
			}
			const consentRes = await fetch(apiUrl(`/api/v1/public/${tenantSlug}/card/consent`), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ scan_id: id, agreed: true })
			});
			if (!consentRes.ok) {
				const body = await consentRes.json();
				throw new Error(body.error ?? 'Could not record consent');
			}
			const leadRes = await fetch(apiUrl(`/api/v1/public/${tenantSlug}/card/lead`), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					scan_id: id,
					first_name: visitorFirstName,
					surname: visitorSurname,
					email: visitorEmail,
					phone: visitorPhone,
					location_label: locationLabel.trim() || undefined
				})
			});
			const body = await leadRes.json();
			if (!leadRes.ok) {
				throw new Error(body.error ?? 'Could not save details');
			}
			shareSuccess = true;
			setTimeout(() => {
				closeShareModal();
				shareSuccess = false;
			}, 1800);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not save details';
		} finally {
			shareSubmitting = false;
		}
	}

	function websiteHref(url: string) {
		if (!url) return '';
		return /^https?:\/\//i.test(url) ? url : `https://${url}`;
	}
</script>

<svelte:head>
	<title>{cardHeading || 'Contact'}</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center px-4 py-12"
	style="background:{card.brandColors.background};color:{card.brandColors.text};font-family:system-ui,sans-serif"
>
	<div class="w-full max-w-md text-center">
		{#if error && !showShareModal}
			<p class="text-red-300">{error}</p>
		{:else}
			<div
				class="rounded-2xl border border-white/15 p-6 text-left shadow-lg"
				style="background:{card.brandColors.secondary}"
			>
				{#if card.logoUrl}
					<img
						src={card.logoUrl}
						alt=""
						class="mx-auto mb-4 h-16 w-16 rounded-full object-cover"
					/>
				{/if}
				{#if cardPersonName}
					<h1 class="text-center text-2xl font-semibold">{cardPersonName}</h1>
				{/if}
				{#if card.displayName && (!cardPersonName || card.displayName !== cardPersonName)}
					<p
						class="text-center text-sm opacity-80"
						class:mt-1={!!cardPersonName}
						class:text-2xl={!cardPersonName}
						class:font-semibold={!cardPersonName}
					>
						{card.displayName}
					</p>
				{/if}
				{#if card.role}
					<p class="mt-1 text-center text-sm opacity-80">{card.role}</p>
				{/if}

				<ul class="mt-6 space-y-3 text-sm">
					{#if card.email}
						<li>
							<a
								href="mailto:{card.email}"
								class="flex items-center gap-2 underline-offset-2 hover:underline"
							>
								<span class="opacity-70">Email</span>
								<span>{card.email}</span>
							</a>
						</li>
					{/if}
					{#if card.phone}
						<li>
							<a
								href="tel:{card.phone}"
								class="flex items-center gap-2 underline-offset-2 hover:underline"
							>
								<span class="opacity-70">Phone</span>
								<span>{card.phone}</span>
							</a>
						</li>
					{/if}
					{#if card.website}
						<li>
							<a
								href={websiteHref(card.website)}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-2 underline-offset-2 hover:underline"
							>
								<span class="opacity-70">Website</span>
								<span>{card.website}</span>
							</a>
						</li>
					{/if}
				</ul>

				{#if card.socialLinks.length > 0}
					<div class="mt-6 flex flex-wrap justify-center gap-2">
						{#each card.socialLinks as link (link.url)}
							<a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								class="rounded-lg px-3 py-1.5 text-sm font-medium"
								style="background:{card.brandColors.primary};color:{card.brandColors.text}"
							>
								{link.platform}
							</a>
						{/each}
					</div>
				{/if}

				{#if card.cardLinks.length > 0}
					<div class="mt-6 flex flex-col gap-2">
						{#each card.cardLinks as link (link.url)}
							<a
								href={websiteHref(link.url)}
								target="_blank"
								rel="noopener noreferrer"
								class="block rounded-lg px-4 py-2.5 text-center text-sm font-medium"
								style="background:{card.brandColors.primary};color:{card.brandColors.text}"
							>
								{link.label}
							</a>
						{/each}
					</div>
				{/if}

				<button
					type="button"
					class="mt-6 w-full rounded-xl py-3 font-medium"
					style="background:{card.brandColors.primary};color:{card.brandColors.text}"
					onclick={downloadVcard}
				>
					{savedToDevice ? 'Saved — download again' : 'Save contact'}
				</button>
			</div>

			<button
				type="button"
				class="mt-4 text-sm opacity-80 underline-offset-2 hover:underline"
				onclick={() => (showShareModal = true)}
			>
				Share your details with {cardHeading}
			</button>
		{/if}
	</div>
</div>

{#if showShareModal}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && closeShareModal()}
	>
		<div
			class="w-full max-w-md rounded-2xl p-6 text-left shadow-xl"
			style="background:{card.brandColors.secondary};color:{card.brandColors.text}"
			role="dialog"
			aria-modal="true"
			aria-labelledby="share-modal-title"
		>
			<div class="mb-4 flex items-start justify-between gap-3">
				<div>
					<h2 id="share-modal-title" class="text-lg font-semibold">Share your details</h2>
					<p class="mt-1 text-sm opacity-80">
						Let {cardHeading} save your contact info. Optional — you can skip this.
					</p>
				</div>
				<button
					type="button"
					class="rounded-lg p-1 opacity-70 hover:opacity-100"
					aria-label="Close"
					onclick={closeShareModal}
				>
					<Icon name="x" class="h-5 w-5" />
				</button>
			</div>

			{#if shareSuccess}
				<p class="py-6 text-center text-sm">Thank you — your details have been shared.</p>
			{:else}
				<form class="space-y-3" onsubmit={submitShare}>
					<label class="block text-sm">
						First name
						<input
							required
							class="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
							bind:value={visitorFirstName}
						/>
					</label>
					<label class="block text-sm">
						Surname
						<input
							class="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
							bind:value={visitorSurname}
						/>
					</label>
					<label class="block text-sm">
						Email
						<input
							type="email"
							required
							class="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
							bind:value={visitorEmail}
						/>
					</label>
					<label class="block text-sm">
						Phone
						<input
							type="tel"
							class="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
							bind:value={visitorPhone}
						/>
					</label>
					<label class="block text-sm">
						Location (optional)
						<input
							class="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
							placeholder="City, venue, etc."
							bind:value={locationLabel}
						/>
					</label>
					<label class="flex items-start gap-2 text-sm">
						<input type="checkbox" class="mt-1" bind:checked={shareConsent} />
						<span>I agree to share my contact details with {cardHeading}.</span>
					</label>
					{#if error}
						<p class="text-sm text-red-300">{error}</p>
					{/if}
					<div class="flex flex-col gap-2 pt-1 sm:flex-row">
						<button
							type="submit"
							class="flex-1 rounded-xl py-3 font-medium disabled:opacity-60"
							style="background:{card.brandColors.primary};color:{card.brandColors.text}"
							disabled={shareSubmitting}
						>
							{shareSubmitting ? 'Saving…' : 'Share details'}
						</button>
						<button
							type="button"
							class="flex-1 rounded-xl border border-white/30 py-3 font-medium opacity-90"
							onclick={closeShareModal}
						>
							Not now
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}

<script lang="ts">
	import { goto } from '$app/navigation';
	import { api, ApiError } from '$lib/api/client';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { BrandColors, BusinessCard, CardAnalyticsSummary, Module, SocialLink } from '$lib/types';

	let { data } = $props();

	const mod = $derived(data.modules.find((m: Module) => m.slug === 'business_card'));
	let scanUrl = $state('');
	let summary = $state<CardAnalyticsSummary | null>(null);
	let saving = $state(false);
	let error = $state('');

	let firstName = $state('');
	let surname = $state('');
	let displayName = $state('');
	let role = $state('');
	let email = $state('');
	let phone = $state('');
	let website = $state('');
	let logoUrl = $state('');
	let published = $state(true);
	let colors = $state<BrandColors>({
		primary: '#0753b5',
		secondary: '#010f5a',
		background: '#00043c',
		text: '#ffffff'
	});
	let socialLinks = $state<SocialLink[]>([]);
	let newPlatform = $state('');
	let newSocialUrl = $state('');

	async function load() {
		const [cardRes, analyticsRes] = await Promise.all([
			api<{ card: BusinessCard; scan_url: string }>('/api/v1/business-card'),
			api<{ summary: CardAnalyticsSummary }>('/api/v1/analytics/business-card')
		]);
		const c = cardRes.card;
		scanUrl = cardRes.scan_url;
		summary = analyticsRes.summary;
		firstName = c.first_name ?? '';
		surname = c.surname ?? '';
		if (!firstName && !surname && c.name) {
			const parts = c.name.trim().split(/\s+/);
			firstName = parts[0] ?? '';
			surname = parts.slice(1).join(' ');
		}
		displayName = c.display_name;
		role = c.role;
		email = c.email;
		phone = c.phone;
		website = c.website;
		logoUrl = c.logo_url ?? '';
		published = c.published;
		colors =
			typeof c.brand_colors === 'object'
				? (c.brand_colors as BrandColors)
				: JSON.parse(String(c.brand_colors));
		socialLinks = Array.isArray(c.social_links)
			? c.social_links
			: JSON.parse(String(c.social_links));
		if (!email && data.tenant?.contact_email) email = data.tenant.contact_email;
		if (!website && data.tenant?.custom_domain) website = data.tenant.custom_domain;
		if (!logoUrl && data.tenant?.logo_url) logoUrl = data.tenant.logo_url;
	}

	$effect(() => {
		if (mod && !mod.locked) load();
	});

	async function save() {
		saving = true;
		error = '';
		try {
			await api('/api/v1/business-card', {
				method: 'PATCH',
				json: {
					first_name: firstName,
					surname,
					display_name: displayName,
					role,
					email,
					phone,
					website,
					logo_url: logoUrl || null,
					social_links: socialLinks,
					brand_colors: colors,
					published
				}
			});
			await load();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Save failed';
		} finally {
			saving = false;
		}
	}

	function addSocial() {
		if (!newPlatform.trim() || !newSocialUrl.trim()) return;
		socialLinks = [...socialLinks, { platform: newPlatform, url: newSocialUrl }];
		newPlatform = '';
		newSocialUrl = '';
	}

	function removeSocial(i: number) {
		socialLinks = socialLinks.filter((_, idx) => idx !== i);
	}
</script>

<svelte:head>
	<title>Business Card — Dashboard</title>
</svelte:head>

{#if mod?.locked}
	<Card class="text-center">
		<p class="mb-2 text-lg font-semibold text-midnight">Business Card is not available</p>
	</Card>
{:else}
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold text-midnight">Digital business card</h1>
			<p class="text-sm text-indigo">QR code opens your card — scanners can save it and optionally share their details.</p>
		</div>
		<div class="flex gap-2">
			<Button variant="secondary" onclick={() => goto('/dashboard/modules/business-card/leads')}>
				Lead feed
			</Button>
			<Button variant="accent" onclick={save} disabled={saving}>
				{saving ? 'Saving…' : 'Save card'}
			</Button>
		</div>
	</div>

	{#if error}
		<p class="mb-4 text-sm text-danger">{error}</p>
	{/if}

	{#if summary}
		<div class="mb-6 grid gap-4 sm:grid-cols-4">
			<Card><p class="text-sm text-indigo">Scans</p><p class="text-2xl font-semibold">{summary.total_scans}</p></Card>
			<Card><p class="text-sm text-indigo">Consent rate</p><p class="text-2xl font-semibold">{summary.consent_rate.toFixed(1)}%</p></Card>
			<Card><p class="text-sm text-indigo">Leads</p><p class="text-2xl font-semibold">{summary.total_leads}</p></Card>
			<Card>
				<p class="text-sm text-indigo">Landing page</p>
				<a href={scanUrl} target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-ocean hover:underline">Open →</a>
			</Card>
		</div>
	{/if}

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="space-y-6 lg:col-span-2">
			<Card>
				<h2 class="mb-4 font-semibold text-midnight">Card details</h2>
				<div class="grid gap-3 sm:grid-cols-2">
					<Input id="bc-first-name" label="First name" bind:value={firstName} />
					<Input id="bc-surname" label="Surname" bind:value={surname} />
					<Input id="bc-company" label="Company" bind:value={displayName} />
					<Input id="bc-role" label="Role" bind:value={role} />
					<Input id="bc-email" label="Email" bind:value={email} />
					<Input id="bc-phone" label="Phone" bind:value={phone} />
					<Input id="bc-website" label="Website" bind:value={website} />
					<Input id="bc-logo" label="Logo URL" bind:value={logoUrl} />
				</div>
				<label class="mt-3 flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={published} />
					Published (QR active)
				</label>
			</Card>

			<Card>
				<h2 class="mb-4 font-semibold text-midnight">Brand colours</h2>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<label class="text-sm">Primary<input type="color" class="mt-1 h-10 w-full" bind:value={colors.primary} /></label>
					<label class="text-sm">Secondary<input type="color" class="mt-1 h-10 w-full" bind:value={colors.secondary} /></label>
					<label class="text-sm">Background<input type="color" class="mt-1 h-10 w-full" bind:value={colors.background} /></label>
					<label class="text-sm">Text<input type="color" class="mt-1 h-10 w-full" bind:value={colors.text} /></label>
				</div>
			</Card>

			<Card>
				<h2 class="mb-4 font-semibold text-midnight">Social links</h2>
				<ul class="mb-4 space-y-1 text-sm">
					{#each socialLinks as link, i (i)}
						<li class="flex justify-between rounded bg-sky-mist/60 px-3 py-2">
							<span>{link.platform}: {link.url}</span>
							<button type="button" class="text-danger" onclick={() => removeSocial(i)}>Remove</button>
						</li>
					{/each}
				</ul>
				<div class="grid gap-2 sm:grid-cols-2">
					<Input id="soc-plat" label="Platform" bind:value={newPlatform} />
					<Input id="soc-url" label="URL" bind:value={newSocialUrl} />
				</div>
				<Button variant="secondary" class="mt-2" onclick={addSocial}>Add social link</Button>
			</Card>
		</div>

		<Card class="text-center">
			<h2 class="mb-4 font-semibold text-midnight">QR code</h2>
			<img
				src="/api/v1/business-card/qr.png"
				alt="QR code for contact landing page"
				class="mx-auto mb-4 rounded-lg border border-sky-mist"
				width="256"
				height="256"
			/>
			<p class="text-xs text-indigo">Scanners see your card first and can save it to their device.</p>
		</Card>
	</div>
{/if}

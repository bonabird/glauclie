<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PublicLinkPageData } from '$lib/server/public';
	import Icon from '$lib/components/icons/Icon.svelte';
	import { apiUrl } from '$lib/env/public';
	import { resolveIconName } from '$lib/icons';

	let { data } = $props();
	const pageData = $derived(data.data as PublicLinkPageData | null);
	const theme = $derived(pageData?.page.theme);

	let showCapture = $state(false);
	let captureEmail = $state('');
	let captureConsent = $state(false);
	let captureMsg = $state('');
	let captureError = $state(false);

	onMount(() => {
		if (!pageData) {
			goto('/login');
		}
	});

	async function handleLinkClick(link: PublicLinkPageData['links'][0]) {
		if (!pageData) return;
		const res = await fetch(
			apiUrl(`/api/v1/public/${pageData.slug}/links/${link.id}/click`),
			{ method: 'POST', credentials: 'include' }
		);
		const action = await res.json();
		if (!res.ok) return;

		if (action.action === 'email_capture') {
			showCapture = true;
			return;
		}
		if (action.action === 'gated_login') {
			window.location.href = `/login?redirect_to=/`;
			return;
		}
		if (action.action === 'community_tier' && action.url) {
			window.location.href = action.url;
			return;
		}
		if (action.url) {
			window.open(action.url, '_blank', 'noopener,noreferrer');
		}
	}

	async function submitCapture(e: Event) {
		e.preventDefault();
		if (!pageData) return;
		if (!captureConsent) {
			captureMsg = 'Consent is required';
			captureError = true;
			return;
		}
		const res = await fetch(apiUrl(`/api/v1/public/${pageData.slug}/subscribe`), {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: captureEmail, gdpr_consent: true })
		});
		const body = await res.json();
		if (res.ok) {
			captureMsg = 'Thanks for subscribing!';
			captureError = false;
			captureEmail = '';
			captureConsent = false;
		} else {
			captureMsg = body.error ?? 'Something went wrong';
			captureError = true;
		}
	}
</script>

<svelte:head>
	<title>{pageData?.page.title || pageData?.tenant.business_name || 'Glaucidae'}</title>
</svelte:head>

{#if pageData && theme}
	<div
		class="min-h-screen px-4 py-12"
		style="background:{theme.background_color};color:{theme.text_color};font-family:{theme.font_family}"
	>
		<div class="mx-auto max-w-md text-center">
			{#if pageData.page.avatar_url}
				<img
					src={pageData.page.avatar_url}
					alt=""
					class="mx-auto mb-4 h-24 w-24 rounded-full object-cover ring-2 ring-white/20"
				/>
			{/if}
			<h1 class="text-2xl font-bold">{pageData.page.title}</h1>
			{#if pageData.page.bio}
				<p class="mt-2 text-sm opacity-90">{pageData.page.bio}</p>
			{/if}

			<ul class="mt-8 space-y-3">
				{#each pageData.links as link (link.id)}
					<li>
						<button
							type="button"
							class="w-full rounded-xl px-4 py-3 text-sm font-medium transition hover:opacity-90"
							style="background:{theme.accent_color};color:{theme.text_color}"
							onclick={() => handleLinkClick(link)}
						>
							{#if resolveIconName(link.icon)}
								<Icon
									name={resolveIconName(link.icon)!}
									class="mr-2 inline-block h-4 w-4 align-[-2px]"
								/>
							{/if}
							{link.label}
						</button>
					</li>
				{/each}
			</ul>

			{#if showCapture}
				<form class="mt-8 rounded-xl bg-black/20 p-4 text-left" onsubmit={submitCapture}>
					<p class="mb-3 text-sm font-medium">Subscribe to our newsletter</p>
					<input
						type="email"
						required
						placeholder="you@example.com"
						class="mb-3 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm"
						bind:value={captureEmail}
					/>
					<label class="mb-3 flex gap-2 text-xs">
						<input type="checkbox" required bind:checked={captureConsent} />
						<span>I consent to receive emails and can unsubscribe anytime (GDPR).</span>
					</label>
					<button
						type="submit"
						class="w-full rounded-lg py-2 text-sm font-medium"
						style="background:{theme.accent_color}"
					>
						Subscribe
					</button>
					{#if captureMsg}
						<p class="mt-2 text-xs" class:text-red-300={captureError}>{captureMsg}</p>
					{/if}
				</form>
			{/if}

			<p class="mt-12 text-xs opacity-50">
				<a
					href="https://www.glaucidae.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:opacity-80 hover:underline"
				>
					Powered by Glaucidae
				</a>
			</p>
		</div>
	</div>
{/if}

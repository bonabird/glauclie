// See https://svelte.dev/docs/kit/types#app.d.ts
import type { SessionUser } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			user: SessionUser | null;
			/** Updated Cookie header after silent refresh (SSR fetches). */
			authCookie?: string;
			/** Set-Cookie lines to forward to the browser after silent refresh. */
			authSetCookies?: string[];
		}
	}
}

export {};

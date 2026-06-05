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

		interface PrivateEnv {
			/** Go API base URL for SSR and server hooks. */
			API_INTERNAL_URL?: string;
		}

		interface PublicEnv {
			/** Set to "false" to disable registration on demo deployments. */
			PUBLIC_ALLOW_REGISTRATION?: string;
			/** Go API URL for browser requests (e.g. https://api.glaucidae.com). Empty in local dev. */
			PUBLIC_API_URL?: string;
		}
	}
}

export {};

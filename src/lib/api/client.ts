import { apiUrl } from '$lib/env/public';

export class ApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

type FetchOptions = RequestInit & { json?: unknown };

async function tryRefreshSession(): Promise<boolean> {
	try {
		const res = await fetch(apiUrl('/api/v1/auth/refresh'), {
			method: 'POST',
			credentials: 'include'
		});
		return res.ok;
	} catch {
		return false;
	}
}

export async function api<T>(
	path: string,
	options: FetchOptions = {},
	retried = false
): Promise<T> {
	const { json, headers, ...rest } = options;
	const res = await fetch(apiUrl(path), {
		...rest,
		credentials: 'include',
		headers: {
			...(json ? { 'Content-Type': 'application/json' } : {}),
			...headers
		},
		body: json !== undefined ? JSON.stringify(json) : rest.body
	});

	if (res.status === 401 && !retried && !path.includes('/auth/refresh')) {
		const refreshed = await tryRefreshSession();
		if (refreshed) {
			return api(path, options, true);
		}
	}

	if (res.status === 204) {
		return undefined as T;
	}

	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new ApiError(res.status, (data as { error?: string }).error ?? 'Request failed');
	}
	return data as T;
}

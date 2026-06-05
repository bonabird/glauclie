export function joinFullName(first: string, surname: string, legacy = ''): string {
	const full = [first.trim(), surname.trim()].filter(Boolean).join(' ');
	return full || legacy.trim();
}

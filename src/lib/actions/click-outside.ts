import type { Action } from 'svelte/action';

export const clickOutside: Action<HTMLElement, () => void> = (node, onOutside) => {
	function handlePointerDown(event: PointerEvent) {
		if (!node.contains(event.target as Node)) {
			onOutside();
		}
	}

	document.addEventListener('pointerdown', handlePointerDown, true);

	return {
		destroy() {
			document.removeEventListener('pointerdown', handlePointerDown, true);
		}
	};
};

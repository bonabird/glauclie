<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import EasyMDE from 'easymde';
	import 'easymde/dist/easymde.min.css';

	let {
		value = $bindable(''),
		onImageUpload
	}: {
		value?: string;
		onImageUpload?: () => Promise<string | null>;
	} = $props();

	let container: HTMLTextAreaElement;
	let editor: EasyMDE | null = null;

	onMount(() => {
		editor = new EasyMDE({
			element: container,
			initialValue: value,
			spellChecker: false,
			toolbar: [
				'bold',
				'italic',
				'heading',
				'|',
				'quote',
				'unordered-list',
				'ordered-list',
				'|',
				'link',
				{
					name: 'image',
					action: async () => {
						if (!onImageUpload || !editor) return;
						const url = await onImageUpload();
						if (url) {
							const cm = editor.codemirror;
							const pos = cm.getCursor();
							cm.replaceRange(`![](${url})`, pos);
						}
					},
					className: 'fa fa-image',
					title: 'Insert image'
				},
				'|',
				'preview',
				'side-by-side',
				'|',
				'guide'
			]
		});
		editor.codemirror.on('change', () => {
			value = editor?.value() ?? '';
		});
	});

	onDestroy(() => {
		editor?.toTextArea();
		editor?.cleanup();
		editor = null;
	});

	export function insertAtCursor(text: string) {
		if (!editor) return;
		const cm = editor.codemirror;
		const pos = cm.getCursor();
		cm.replaceRange(text, pos);
		value = editor.value();
	}
</script>

<textarea bind:this={container} class="hidden"></textarea>

<style>
	:global(.EasyMDEContainer .CodeMirror) {
		background: rgb(170 208 247 / 0.4);
		color: #00043c;
		min-height: 280px;
	}
	:global(.editor-toolbar) {
		border-color: #aad0f7;
		background: #b2cdfe;
	}
</style>

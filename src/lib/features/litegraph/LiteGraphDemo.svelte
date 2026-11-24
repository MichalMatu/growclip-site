<!-- @runes -->
<script lang="ts">
	import { onMount } from 'svelte';
	import RefreshIcon from '~icons/tabler/refresh';
	import MaximizeIcon from '~icons/tabler/maximize';
	import MinimizeIcon from '~icons/tabler/minimize';

	import { LiteGraphDemoController, type DemoExampleId } from '$lib/features/litegraph/demoRuntime';
	import { loadLiteGraphClassic } from '$lib/features/litegraph/litegraphLoader';
	import type { DemoFlowExample } from '$lib/content/product';

	interface Props {
		examples: DemoFlowExample[];
		resetLabel: string;
		fullscreenLabel: string;
		exitFullscreenLabel: string;
		fullscreenUnavailable: string;
	}

	let { examples, resetLabel, fullscreenLabel, exitFullscreenLabel, fullscreenUnavailable }: Props =
		$props();

	let panelElement: HTMLElement | null = null;
	let fullscreen = $state(false);
	let expanded = $state(false);
	let fullscreenError = $state(false);
	let canvasElement: HTMLCanvasElement | null = null;
	let activeExample = $state<DemoExampleId>('climate');
	let ready = $state(false);
	let error = $state('');
	const activeExampleBody = $derived(
		examples.find((example) => example.id === activeExample)?.body ?? ''
	);

	let controller: LiteGraphDemoController | null = null;
	let disposed = false;
	let initialization: Promise<void> | null = null;
	let resizeObserver: ResizeObserver | null = null;

	function setError(initializationError: unknown) {
		error =
			initializationError instanceof Error
				? initializationError.message
				: String(initializationError);
	}

	function initializeDemo(): Promise<void> {
		if (disposed || !canvasElement) return Promise.resolve();
		if (initialization) return initialization;
		initialization = (async () => {
			try {
				await loadLiteGraphClassic();
				if (disposed || !canvasElement) return;
				controller = new LiteGraphDemoController(canvasElement, activeExample);
				controller.reset(activeExample);
				ready = true;
				error = '';
			} catch (initializationError) {
				controller?.destroy();
				controller = null;
				if (!disposed) setError(initializationError);
			} finally {
				initialization = null;
			}
		})();
		return initialization;
	}

	async function resetDemo() {
		try {
			if (!controller) {
				await initializeDemo();
				return;
			}
			controller.reset(activeExample);
			ready = true;
			error = '';
		} catch (resetError) {
			setError(resetError);
		}
	}

	async function selectExample(exampleId: DemoExampleId) {
		activeExample = exampleId;
		try {
			if (!controller) {
				await initializeDemo();
				return;
			}
			controller.setExample(exampleId);
			ready = true;
			error = '';
		} catch (exampleError) {
			setError(exampleError);
		}
	}

	function setExpanded(value: boolean) {
		expanded = value;
		fullscreen = value;
		document.documentElement.classList.toggle('demo-viewport-expanded', value);
		requestAnimationFrame(() => controller?.resize());
	}

	async function toggleFullscreen() {
		fullscreenError = false;
		if (expanded) {
			setExpanded(false);
			return;
		}
		if (panelElement && document.fullscreenElement === panelElement) {
			try {
				await document.exitFullscreen();
			} catch {
				fullscreenError = true;
			}
			return;
		}
		if (!panelElement) return;
		if (panelElement.requestFullscreen) {
			try {
				await panelElement.requestFullscreen();
				if (document.fullscreenElement === panelElement) {
					fullscreen = true;
					return;
				}
			} catch {
				// Some browsers and embedded contexts deny native fullscreen.
			}
		}
		setExpanded(true);
	}

	onMount(() => {
		void initializeDemo();
		const syncFullscreen = () => {
			fullscreen =
				expanded || (panelElement !== null && document.fullscreenElement === panelElement);
			controller?.resize();
		};
		document.addEventListener('fullscreenchange', syncFullscreen);
		const escapeExpanded = (event: { key: string; preventDefault: () => void }) => {
			if (event.key === 'Escape' && expanded) {
				event.preventDefault();
				setExpanded(false);
			}
		};
		document.addEventListener('keydown', escapeExpanded);
		const themeObserver = new window.MutationObserver(() => controller?.applyTheme());
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme', 'data-theme-mode']
		});

		if (canvasElement && typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => {
				controller?.resize();
			});
			resizeObserver.observe(canvasElement);
		}

		return () => {
			disposed = true;
			themeObserver.disconnect();
			document.removeEventListener('fullscreenchange', syncFullscreen);
			document.removeEventListener('keydown', escapeExpanded);
			document.documentElement.classList.remove('demo-viewport-expanded');
			resizeObserver?.disconnect();
			controller?.destroy();
			controller = null;
		};
	});
</script>

<article
	bind:this={panelElement}
	class="asset-frame device-panel"
	class:viewport-expanded={expanded}
>
	<div class="device-panel-header flex items-center justify-between gap-3 border-b px-4 py-3">
		<p class="text-sm font-semibold demo-title">Nodeflow / LiteGraph</p>
		<div class="flex flex-wrap justify-end gap-2">
			<button
				type="button"
				class="device-panel-button inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
				onclick={resetDemo}
				disabled={!ready && !error}
			>
				<RefreshIcon aria-hidden="true" />
				{resetLabel}
			</button>
			<button
				type="button"
				class="device-fullscreen-button inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
				aria-label={fullscreen ? exitFullscreenLabel : fullscreenLabel}
				aria-pressed={fullscreen}
				onclick={toggleFullscreen}
			>
				{#if fullscreen}<MinimizeIcon aria-hidden="true" />{:else}<MaximizeIcon
						aria-hidden="true"
					/>{/if}
				<span class="hidden sm:inline">{fullscreen ? exitFullscreenLabel : fullscreenLabel}</span>
			</button>
		</div>
	</div>

	{#if fullscreenError}<p class="px-4 py-2 text-xs demo-description" role="status">
			{fullscreenUnavailable}
		</p>{/if}
	<div class="device-panel-controls border-b px-3 py-3">
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
			{#each examples as example (example.id)}
				<button
					type="button"
					class={[
						'h-10 rounded-md border px-2 text-center text-[0.72rem] font-semibold leading-tight transition-colors',
						activeExample === example.id ? 'device-tab device-tab-active' : 'device-tab'
					]}
					aria-pressed={activeExample === example.id}
					onclick={() => selectExample(example.id)}
				>
					{example.title}
				</button>
			{/each}
		</div>
		<p class="mt-2 text-xs leading-5 demo-description">
			{activeExampleBody}
		</p>
	</div>

	<div class="device-canvas relative h-[500px] min-h-[500px] lg:h-[520px] lg:min-h-[520px]">
		<canvas bind:this={canvasElement} class="h-full w-full"></canvas>
		{#if error}
			<div class="absolute inset-0 grid place-items-center bg-neutral-950/92 p-6 text-center">
				<p class="max-w-md text-sm leading-6 text-red-200">{error}</p>
			</div>
		{:else if !ready}
			<div
				class="device-canvas absolute inset-0 grid place-items-center text-sm font-semibold demo-description"
			>
				LiteGraph loading
			</div>
		{/if}
	</div>
</article>

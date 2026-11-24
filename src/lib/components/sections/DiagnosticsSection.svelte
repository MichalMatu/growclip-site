<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';
	import AssetSlot from '$lib/components/AssetSlot.svelte';

	let {
		data,
		slot
	}: { data: ProductContent['diagnostics']; slot: ProductContent['media'][number] } = $props();
</script>

<section id="diagnostics" class="diagnostics-band">
	<div class="site-section diagnostics-layout">
		<div data-reveal>
			<p class="kicker">{data.kicker}</p>
			<h2 class="section-title">{data.title}</h2>
			<p class="section-copy">{data.copy}</p>
			<div class="diagnostics-list">
				{#each data.items as item (item.title)}
					<article>
						<h3>{item.title}</h3>
						<p>{item.body}</p>
					</article>
				{/each}
			</div>
		</div>
		<div data-reveal>
			<AssetSlot {slot} />
		</div>
	</div>
</section>

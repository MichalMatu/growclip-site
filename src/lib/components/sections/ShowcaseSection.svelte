<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';
	import AssetSlot from '$lib/components/AssetSlot.svelte';

	let { data, media }: { data: ProductContent['showcase']; media: ProductContent['media'] } =
		$props();
</script>

<section class="site-section media-section">
	<div class="section-heading" data-reveal>
		<p class="kicker">{data.kicker}</p>
		<h2 class="section-title">{data.title}</h2>
	</div>
	<div class="media-grid" data-reveal>
		{#each media as slot (slot.src)}
			<AssetSlot {slot} />
		{/each}
	</div>
</section>

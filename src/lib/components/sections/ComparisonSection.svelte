<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';

	let { data }: { data: ProductContent['comparison'] } = $props();
</script>

<section class="comparison-section">
	<div class="site-section">
		<div class="section-heading" data-reveal>
			<p class="kicker">{data.kicker}</p>
			<h2 class="section-title">{data.title}</h2>
			<p class="section-copy">{data.copy}</p>
		</div>
		<div class="comparison-grid" data-reveal>
			{#each data.items as item (item.alternative)}
				<article class="comparison-card">
					<h3>{item.alternative}</h3>
					<div>
						<p class="comparison-label">{data.limitationLabel}</p>
						<p>{item.limitation}</p>
					</div>
					<div>
						<p class="comparison-label">{data.growclipLabel}</p>
						<p>{item.growclip}</p>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

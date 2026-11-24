<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';

	let { data }: { data: ProductContent['capabilities'] } = $props();
</script>

<section id="capabilities" class="site-section">
	<div class="section-heading" data-reveal>
		<p class="kicker">{data.kicker}</p>
		<h2 class="section-title">{data.title}</h2>
		<p class="section-copy">{data.copy}</p>
	</div>

	<div class="site-grid" data-reveal>
		{#each data.items as item (item.title)}
			<article class="feature-card">
				<h3>{item.title}</h3>
				<p>{item.body}</p>
			</article>
		{/each}
	</div>
</section>

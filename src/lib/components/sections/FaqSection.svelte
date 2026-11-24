<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';

	let { data }: { data: ProductContent['faq'] } = $props();
</script>

<section id="faq" class="site-section faq-section">
	<div class="section-heading" data-reveal>
		<p class="kicker">{data.kicker}</p>
		<h2 class="section-title">{data.title}</h2>
	</div>
	<div class="faq-list" data-reveal>
		{#each data.items as item (item.question)}
			<details class="faq-item">
				<summary>{item.question}</summary>
				<p>{item.answer}</p>
			</details>
		{/each}
	</div>
</section>

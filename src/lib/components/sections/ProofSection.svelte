<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';
	import CheckIcon from '~icons/tabler/check';

	let { data }: { data: ProductContent['proof'] } = $props();
</script>

<section class="proof-strip" aria-label={data.title}>
	<div class="site-section proof-grid">
		<div data-reveal>
			<p class="kicker">{data.kicker}</p>
			<h2 class="section-title">{data.title}</h2>
			<p class="section-copy">{data.copy}</p>
		</div>
		<div class="proof-items" data-reveal>
			{#each data.items as item (item.title)}
				<article class="proof-item">
					<CheckIcon aria-hidden="true" />
					<h3>{item.title}</h3>
					<p>{item.body}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

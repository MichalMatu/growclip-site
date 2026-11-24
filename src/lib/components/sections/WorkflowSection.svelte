<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';

	let { data }: { data: ProductContent['workflow'] } = $props();
</script>

<section class="workflow-band">
	<div class="site-section">
		<div class="section-heading" data-reveal>
			<p class="kicker">{data.kicker}</p>
			<h2 class="section-title">{data.title}</h2>
			<p class="section-copy">{data.copy}</p>
		</div>
		<div class="workflow-grid" data-reveal>
			{#each data.steps as step (step.label)}
				<article class="workflow-step">
					<span>{step.label}</span>
					<h3>{step.title}</h3>
					<p>{step.body}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

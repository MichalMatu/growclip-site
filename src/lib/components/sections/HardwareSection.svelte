<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';
	import ArrowRightIcon from '~icons/tabler/arrow-right';
	import { elecrowHref } from '$lib/content/product';

	let { data }: { data: ProductContent['hardware'] } = $props();
</script>

<section id="hardware" class="hardware-band">
	<div class="site-section">
		<div class="section-heading" data-reveal>
			<p class="kicker">{data.kicker}</p>
			<h2 class="section-title">{data.title}</h2>
			<p class="section-copy">{data.copy}</p>
		</div>

		<details class="technical-card" data-reveal>
			<summary>{data.optionsTitle}</summary>
			<div class="hardware-options mt-4">
				{#each data.options as option (option.title)}
					<article class="feature-card">
						<h3>{option.title}</h3>
						<p>{option.body}</p>
					</article>
				{/each}
			</div>
		</details>

		<details class="technical-card" data-reveal>
			<summary>{data.technicalTitle}</summary>
			<p>{data.technicalBody}</p>
			<a href={elecrowHref} target="_blank" rel="noreferrer">
				{data.sourceLabel}
				<ArrowRightIcon aria-hidden="true" />
			</a>
		</details>
	</div>
</section>

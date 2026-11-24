<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';
	import CheckIcon from '~icons/tabler/check';
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

		<div class="hardware-layout" data-reveal>
			<article class="compact-card hardware-base">
				<h3>{data.baseTitle}</h3>
				<ul>
					{#each data.baseItems as item (item)}
						<li>
							<CheckIcon aria-hidden="true" />
							<span>{item}</span>
						</li>
					{/each}
				</ul>
			</article>

			<div>
				<h3 class="hardware-options-title">{data.optionsTitle}</h3>
				<div class="hardware-options">
					{#each data.options as option (option.title)}
						<article class="feature-card">
							<div class="option-heading">
								<h4>{option.title}</h4>
								<span class="option-status">{option.status}</span>
							</div>
							<p>{option.body}</p>
						</article>
					{/each}
				</div>
			</div>
		</div>

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

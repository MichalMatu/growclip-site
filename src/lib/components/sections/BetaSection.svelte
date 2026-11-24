<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';
	import CheckIcon from '~icons/tabler/check';
	import MailIcon from '~icons/tabler/mail';
	import { contactHref } from '$lib/content/product';

	let { data }: { data: ProductContent['beta'] } = $props();
</script>

<section class="beta-section">
	<div class="site-section beta-layout">
		<div data-reveal>
			<p class="kicker">{data.kicker}</p>
			<h2 class="section-title">{data.title}</h2>
			<p class="section-copy">{data.copy}</p>
			<p class="beta-note">{data.note}</p>
			<div class="beta-includes">
				<h3>{data.includesTitle}</h3>
				{#each data.includes as item (item.title)}
					<article>
						<CheckIcon aria-hidden="true" />
						<div>
							<h4>{item.title}</h4>
							<p>{item.body}</p>
						</div>
					</article>
				{/each}
			</div>
			<a class="primary-cta h-12 px-5 text-sm" href={contactHref}>
				<MailIcon aria-hidden="true" />
				{data.primaryCta}
			</a>
		</div>
		<div class="beta-fit" data-reveal>
			<div>
				<h3>{data.fitTitle}</h3>
				{#each data.fit as item (item.title)}
					<article>
						<CheckIcon aria-hidden="true" />
						<div>
							<h4>{item.title}</h4>
							<p>{item.body}</p>
						</div>
					</article>
				{/each}
			</div>
			<div>
				<h3>{data.notForTitle}</h3>
				{#each data.notFor as item (item.title)}
					<article>
						<span aria-hidden="true">-</span>
						<div>
							<h4>{item.title}</h4>
							<p>{item.body}</p>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>
</section>

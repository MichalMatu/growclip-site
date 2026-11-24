<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';
	import CheckIcon from '~icons/tabler/check';
	import MailIcon from '~icons/tabler/mail';
	import ArrowRightIcon from '~icons/tabler/arrow-right';
	import { contactHref } from '$lib/content/product';

	let { data }: { data: ProductContent['hero'] } = $props();
</script>

<section class="hero-section">
	<img class="hero-image" src={data.imageSrc} alt={data.imageAlt} fetchpriority="high" />
	<div class="hero-overlay"></div>
	<div class="hero-content">
		<div class="hero-copy" data-reveal>
			<p class="kicker">{data.kicker}</p>
			<h1>{data.title}</h1>
			<p class="hero-headline">{data.headline}</p>
			<p class="hero-body">{data.copy}</p>
			<p class="hero-availability">{data.availability}</p>
			<ul class="hero-highlights">
				{#each data.highlights as highlight (highlight)}
					<li>
						<CheckIcon aria-hidden="true" />
						<span>{highlight}</span>
					</li>
				{/each}
			</ul>

			<div class="hero-actions">
				<a class="primary-cta h-12 px-5 text-sm" href={contactHref}>
					<MailIcon aria-hidden="true" />
					{data.primaryCta}
				</a>
				<a class="secondary-cta h-12 px-5 text-sm" href="#demo">
					{data.secondaryCta}
					<ArrowRightIcon aria-hidden="true" />
				</a>
			</div>
		</div>

		<aside class="hero-proof" data-reveal>
			{#each data.stats as stat (stat.title)}
				<div class="hero-stat">
					<p class="hero-stat-value">{stat.value}</p>
					<h2>{stat.title}</h2>
					<p>{stat.body}</p>
				</div>
			{/each}
		</aside>
	</div>
</section>

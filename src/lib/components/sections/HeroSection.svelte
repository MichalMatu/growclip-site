<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';
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
	</div>
</section>

<!-- @runes -->
<script lang="ts">
	import type { ProductContent } from '$lib/content/product';
	import MailIcon from '~icons/tabler/mail';
	import { contactHref } from '$lib/content/product';

	let { data }: { data: ProductContent['beta'] } = $props();
</script>

<section class="beta-section">
	<div class="site-section">
		<div data-reveal>
			<p class="kicker">{data.kicker}</p>
			<h2 class="section-title">{data.title}</h2>
			<p class="section-copy">{data.copy}</p>
			<p class="beta-note">{data.note}</p>
			<a class="primary-cta h-12 px-5 text-sm" href={contactHref}>
				<MailIcon aria-hidden="true" />
				{data.primaryCta}
			</a>
		</div>
	</div>
</section>

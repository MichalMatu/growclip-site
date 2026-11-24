<!-- @runes -->
<script lang="ts">
	import { onMount } from 'svelte';
	import HeroSection from './sections/HeroSection.svelte';
	import CapabilitiesSection from './sections/CapabilitiesSection.svelte';
	import HardwareSection from './sections/HardwareSection.svelte';
	import ShowcaseSection from './sections/ShowcaseSection.svelte';
	import BetaSection from './sections/BetaSection.svelte';
	import FaqSection from './sections/FaqSection.svelte';
	import CloudOffIcon from '~icons/tabler/cloud-off';
	import MailIcon from '~icons/tabler/mail';

	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import ThemeToggle, { type ThemePreference } from '$lib/components/ThemeToggle.svelte';
	import { contactHref, getProductContent, type Locale } from '$lib/content/product';

	type LiteGraphDemoComponent =
		typeof import('$lib/features/litegraph/LiteGraphDemo.svelte').default;

	let { locale }: { locale: Locale } = $props();
	let themePreference = $state<ThemePreference>('system');
	let themeReady = $state(false);
	let showMobileCta = $state(false);
	let demoRootElement: HTMLElement | null = null;
	let LiteGraphDemoComponent = $state<LiteGraphDemoComponent | null>(null);
	let demoLoadError = $state('');
	const content = $derived(getProductContent(locale));
	const publicUrl = $derived(
		'https://michalmatu.github.io/growclip-site/' + (locale === 'en' ? 'en/' : '')
	);
	const socialImage = 'https://michalmatu.github.io/growclip-site/media/growclip-hero.webp';
	let demoImportPromise: Promise<void> | null = null;

	function isThemePreference(value: string | null): value is ThemePreference {
		return value === 'system' || value === 'light' || value === 'dark';
	}

	function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
		if (preference === 'dark') {
			return 'dark';
		}
		if (preference === 'light') {
			return 'light';
		}
		return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function applyTheme(preference: ThemePreference) {
		const nextResolvedTheme = resolveTheme(preference);
		themePreference = preference;
		document.documentElement.dataset.themeMode = nextResolvedTheme;
		document.documentElement.dataset.theme =
			nextResolvedTheme === 'dark' ? 'business' : 'corporate';
		document.documentElement.dataset.themePreference = preference;
		document.documentElement.style.colorScheme = nextResolvedTheme;
	}

	function loadLiteGraphDemo() {
		if (LiteGraphDemoComponent) {
			return Promise.resolve();
		}
		if (demoImportPromise) {
			return demoImportPromise;
		}

		demoImportPromise = import('$lib/features/litegraph/LiteGraphDemo.svelte')
			.then((module) => {
				LiteGraphDemoComponent = module.default;
				demoLoadError = '';
			})
			.catch((error: unknown) => {
				demoLoadError = error instanceof Error ? error.message : String(error);
			})
			.finally(() => {
				demoImportPromise = null;
			});

		return demoImportPromise;
	}

	onMount(() => {
		let savedTheme: string | null = null;
		try {
			savedTheme = window.localStorage.getItem('growclip.theme');
		} catch {
			// Storage can be disabled; the current session still supports theme changes.
		}
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let revealObserver: IntersectionObserver | null = null;
		let demoObserver: IntersectionObserver | null = null;
		let parallaxFrame = 0;

		document.documentElement.lang = locale;
		applyTheme(isThemePreference(savedTheme) ? savedTheme : 'system');
		themeReady = true;

		const handleSystemThemeChange = () => {
			if (themePreference === 'system') {
				applyTheme('system');
			}
		};

		const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
		if (reduceMotion.matches) {
			for (const element of revealElements) {
				element.classList.add('is-visible');
			}
		} else {
			revealObserver = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							entry.target.classList.add('is-visible');
							revealObserver?.unobserve(entry.target);
						}
					}
				},
				{ rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
			);
			for (const element of revealElements) {
				revealObserver.observe(element);
			}
		}

		if (demoRootElement) {
			demoObserver = new IntersectionObserver(
				(entries) => {
					if (entries.some((entry) => entry.isIntersecting)) {
						void loadLiteGraphDemo();
						demoObserver?.disconnect();
					}
				},
				{ rootMargin: '0px', threshold: 0.01 }
			);
			demoObserver.observe(demoRootElement);
		}

		const updateMobileCta = () => {
			if (window.innerWidth >= 640) {
				showMobileCta = false;
				return;
			}

			const hero = document.querySelector<HTMLElement>('.hero-section');
			if (!hero || hero.getBoundingClientRect().bottom > window.innerHeight * 0.15) {
				showMobileCta = false;
				return;
			}

			const blockedSelectors = ['#demo', '.beta-section', '#faq', '.site-footer'];
			showMobileCta = !blockedSelectors.some((selector) => {
				const section = document.querySelector<HTMLElement>(selector);
				if (!section) {
					return false;
				}
				const rect = section.getBoundingClientRect();
				return rect.top < window.innerHeight - 24 && rect.bottom > window.innerHeight * 0.42;
			});
		};

		const updateScrollEffects = () => {
			parallaxFrame = 0;
			if (reduceMotion.matches) {
				document.documentElement.style.setProperty('--hero-parallax', '0px');
			} else {
				const offset = Math.min(window.scrollY * 0.08, 56);
				document.documentElement.style.setProperty('--hero-parallax', `${offset}px`);
			}
			updateMobileCta();
		};

		const requestScrollEffects = () => {
			if (!parallaxFrame) {
				parallaxFrame = window.requestAnimationFrame(updateScrollEffects);
			}
		};

		mediaQuery.addEventListener('change', handleSystemThemeChange);
		window.addEventListener('scroll', requestScrollEffects, { passive: true });
		window.addEventListener('resize', requestScrollEffects);
		updateScrollEffects();

		return () => {
			mediaQuery.removeEventListener('change', handleSystemThemeChange);
			window.removeEventListener('scroll', requestScrollEffects);
			window.removeEventListener('resize', requestScrollEffects);
			revealObserver?.disconnect();
			demoObserver?.disconnect();
			if (parallaxFrame) {
				window.cancelAnimationFrame(parallaxFrame);
			}
		};
	});

	function closeMobileMenu() {
		document.querySelector('.site-mobile-menu')?.removeAttribute('open');
	}

	function setThemePreference(nextPreference: ThemePreference) {
		applyTheme(nextPreference);
		try {
			window.localStorage.setItem('growclip.theme', nextPreference);
		} catch {
			// The applied theme remains usable without persistence.
		}
	}
</script>

<svelte:head>
	<title>{content.meta.title}</title>
	<meta name="description" content={content.meta.description} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={content.meta.socialTitle} />
	<meta property="og:description" content={content.meta.socialDescription} />
	<meta property="og:image" content={socialImage} />
	<meta property="og:image:alt" content={content.hero.imageAlt} />
	<meta property="og:url" content={publicUrl} />
	<meta property="og:locale" content={locale === 'pl' ? 'pl_PL' : 'en_US'} />
	<meta property="og:locale:alternate" content={locale === 'pl' ? 'en_US' : 'pl_PL'} />
	<meta name="twitter:image" content={socialImage} />
	<link rel="canonical" href={publicUrl} />
	<link rel="alternate" hreflang="pl" href="https://michalmatu.github.io/growclip-site/" />
	<link rel="alternate" hreflang="en" href="https://michalmatu.github.io/growclip-site/en/" />
	<link rel="alternate" hreflang="x-default" href="https://michalmatu.github.io/growclip-site/" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={content.meta.socialTitle} />
	<meta name="twitter:description" content={content.meta.socialDescription} />
</svelte:head>

<div class="site-shell">
	<header class="site-header sticky top-0 z-30 border-b backdrop-blur">
		<nav
			class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
		>
			<a
				href="#top"
				class="flex shrink-0 items-center gap-2 text-neutral-950"
				aria-label="GrowClip"
			>
				<span class="brand-mark flex h-9 w-9 items-center justify-center rounded-lg">
					<CloudOffIcon />
				</span>
				<span class="text-sm font-semibold tracking-normal">GrowClip</span>
			</a>

			<div class="hidden items-center gap-4 text-sm font-medium lg:gap-6 lg:flex">
				<a class="nav-link" href="#demo">{content.nav.demo}</a>
				<a class="nav-link" href="#diagnostics">{content.nav.diagnostics}</a>
				<a class="nav-link" href="#capabilities">{content.nav.capabilities}</a>
				<a class="nav-link" href="#hardware">{content.nav.hardware}</a>
				<a class="nav-link" href="#faq">{content.nav.faq}</a>
			</div>

			<div class="flex items-center gap-2">
				<details class="site-mobile-menu dropdown dropdown-end lg:hidden">
					<summary
						class="btn btn-ghost btn-square"
						aria-label={locale === 'pl' ? 'Menu nawigacji' : 'Navigation menu'}>☰</summary
					>
					<ul
						class="dropdown-content menu z-40 mt-2 w-52 rounded-box border border-base-300 bg-base-100 p-2"
					>
						<li><a onclick={closeMobileMenu} href="#demo">{content.nav.demo}</a></li>
						<li><a onclick={closeMobileMenu} href="#diagnostics">{content.nav.diagnostics}</a></li>
						<li>
							<a onclick={closeMobileMenu} href="#capabilities">{content.nav.capabilities}</a>
						</li>
						<li><a onclick={closeMobileMenu} href="#hardware">{content.nav.hardware}</a></li>
						<li><a onclick={closeMobileMenu} href="#faq">{content.nav.faq}</a></li>
					</ul>
				</details>
				<a class="primary-cta hidden h-11 px-5 text-sm sm:inline-flex" href={contactHref}>
					<MailIcon aria-hidden="true" />
					{content.nav.contact}
				</a>
				<ThemeToggle
					labels={content.nav.theme}
					preference={themePreference}
					ready={themeReady}
					onChange={setThemePreference}
				/>
				<LanguageToggle ariaLabel={content.nav.language} {locale} />
			</div>
		</nav>
	</header>

	<main id="top">
		<HeroSection data={content.hero} />

		<section id="demo" class="site-section demo-section">
			<div class="demo-shell">
				<div class="section-heading" data-reveal>
					<h2 class="section-title">{content.demo.title}</h2>
					<p class="section-copy">{content.demo.copy}</p>
				</div>

				<div bind:this={demoRootElement} class="mt-4" data-reveal>
					{#if LiteGraphDemoComponent}
						<LiteGraphDemoComponent
							examples={content.demo.examples}
							resetLabel={content.demo.reset}
						/>
					{:else}
						<article class="asset-frame device-panel demo-loader" aria-busy={!demoLoadError}>
							<div class="device-panel-header border-b px-4 py-3">
								<p class="text-sm font-semibold text-neutral-50">Nodeflow LiteGraph demo</p>
								<p class="mt-1 text-xs text-neutral-400">
									{demoLoadError || content.demo.loading}
								</p>
							</div>
							<div
								class="device-canvas demo-loader-canvas grid h-[500px] min-h-[500px] place-items-center lg:h-[520px] lg:min-h-[520px]"
							>
								<div class="demo-loader-pulse" aria-hidden="true"></div>
							</div>
						</article>
					{/if}
				</div>
				<div class="node-library-preview mt-5" data-reveal>
					<h3 class="text-sm font-semibold">{content.demo.libraryTitle}</h3>
					<div class="mt-3 grid gap-3 sm:grid-cols-3">
						{#each content.demo.libraryGroups as group (group.label)}
							<div class="node-library-group">
								<h4 class="text-xs font-semibold">{group.label}</h4>
								<ul class="mt-2 flex flex-wrap gap-1.5">
									{#each group.nodes as node (node)}
										<li>{node}</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<CapabilitiesSection data={content.capabilities} />

		<HardwareSection data={content.hardware} />

		<ShowcaseSection data={content.showcase} media={content.media} />

		<BetaSection data={content.beta} />

		<FaqSection data={content.faq} />
	</main>

	<footer class="site-footer border-t">
		<div
			class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
		>
			<p>{content.footer.tagline}</p>
			<a href={contactHref}>{content.nav.contact}</a>
		</div>
	</footer>

	{#if showMobileCta}
		<div class="mobile-sticky-cta sm:hidden">
			<a class="primary-cta h-11 px-4 text-sm" href={contactHref}>
				<MailIcon aria-hidden="true" />
				{content.hero.primaryCta}
			</a>
		</div>
	{/if}
</div>

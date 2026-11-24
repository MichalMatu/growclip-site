import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const locale of ['pl', 'en']) {
	for (const theme of ['light', 'dark']) {
		for (const viewport of [
			{ name: 'desktop', width: 1440, height: 920 },
			{ name: 'mobile', width: 390, height: 844 }
		]) {
			test(locale + '-' + theme + '-' + viewport.name, async ({ page }, info) => {
				test.setTimeout(90000);
				const errors: string[] = [];
				page.on('pageerror', (error) => errors.push(error.message));
				await page.setViewportSize(viewport);
				await page.emulateMedia({
					colorScheme: theme as 'light' | 'dark',
					reducedMotion: 'reduce'
				});
				await page.goto(locale === 'pl' ? '/' : '/en/');
				await expect(page.locator('.theme-toggle button').first()).toBeEnabled();
				await expect(page.locator('html')).toHaveAttribute('data-theme-mode', theme);
				await expect(page.locator('html')).toHaveAttribute('lang', locale);
				await expect(page.locator('h1')).toHaveCount(1);
				for (const [name, selector] of Object.entries({
					hero: '.hero-section',
					demo: '#demo',
					gallery: '.media-section',
					cta: '.beta-section'
				})) {
					const section = page.locator(selector);
					await section.scrollIntoViewIfNeeded();
					if (name === 'demo') await expect(section.locator('.device-panel-button')).toBeEnabled();
					for (const img of await section.locator('img').all()) {
						await img.scrollIntoViewIfNeeded();
						await expect
							.poll(() =>
								img.evaluate(
									(el) =>
										(el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0
								)
							)
							.toBe(true);
					}
					await expect
						.poll(() =>
							page.evaluate(
								() => document.documentElement.scrollWidth - document.documentElement.clientWidth
							)
						)
						.toBeLessThanOrEqual(1);
					const shot = await section.screenshot({ animations: 'disabled' });
					expect(shot.byteLength).toBeGreaterThan(10000);
					await info.attach(name + '.png', { body: shot, contentType: 'image/png' });
					await section.screenshot({
						path: info.outputPath(name + '.png'),
						animations: 'disabled'
					});
				}
				const violations = (
					await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
				).violations;
				const blocking = violations.filter(
					(v) => v.impact === 'serious' || v.impact === 'critical'
				);
				expect(blocking.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
					[]
				);
				expect(errors).toEqual([]);
			});
		}
	}
}

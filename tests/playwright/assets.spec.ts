import { expect, test } from '@playwright/test';

for (const route of ['/', '/en/']) {
	test('product gallery loads without cropping on ' + route, async ({ page }, info) => {
		for (const viewport of [
			{ width: 1440, height: 900 },
			{ width: 390, height: 844 }
		]) {
			await page.setViewportSize(viewport);
			await page.goto(route);
			const gallery = page.locator('.media-grid');
			const images = gallery.locator('img');
			await expect(images).toHaveCount(4);
			for (const img of await images.all()) {
				await img.scrollIntoViewIfNeeded();
				await expect
					.poll(() =>
						img.evaluate(
							(el: HTMLImageElement) =>
								el.complete && el.naturalWidth === 1440 && el.naturalHeight === 900
						)
					)
					.toBe(true);
				await expect(img).toHaveCSS('object-fit', 'contain');
				await expect(img).toHaveAttribute('alt', /.+/);
			}
			await expect
				.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
				.toBe(true);
			await info.attach('gallery-' + viewport.width + '.png', {
				body: await gallery.screenshot({ animations: 'disabled' }),
				contentType: 'image/png'
			});
		}
	});
}

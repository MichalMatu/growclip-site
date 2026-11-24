import { expect, test } from '@playwright/test';

for (const route of ['/', '/en/']) {
	test('SEO metadata is complete on ' + route, async ({ page }) => {
		await page.goto(route);
		const url = 'https://michalmatu.github.io/growclip-site' + route;
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', url);
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', url);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			'https://michalmatu.github.io/growclip-site/media/growclip-hero.webp'
		);
		await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
			'content',
			'https://michalmatu.github.io/growclip-site/media/growclip-hero.webp'
		);
		await expect(page.locator('link[hreflang="pl"]')).toHaveCount(1);
		await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
		await expect(page.locator('h1')).toHaveCount(1);
	});
}
test('sitemap and robots declare both public routes', async ({ request }) => {
	const sitemap = await request.get('/sitemap.xml');
	expect(sitemap.ok()).toBeTruthy();
	const xml = await sitemap.text();
	expect(xml).toContain('<loc>https://michalmatu.github.io/growclip-site/</loc>');
	expect(xml).toContain('<loc>https://michalmatu.github.io/growclip-site/en/</loc>');
	const robots = await request.get('/robots.txt');
	expect(robots.ok()).toBeTruthy();
	expect(await robots.text()).toContain(
		'Sitemap: https://michalmatu.github.io/growclip-site/sitemap.xml'
	);
});

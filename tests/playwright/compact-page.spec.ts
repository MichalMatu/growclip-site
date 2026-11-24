import { expect, test } from '@playwright/test';
for (const route of ['/', '/en/']) {
	test('compact landing has one source of truth per section ' + route, async ({ page }) => {
		await page.goto(route);
		await expect(page.locator('main > section')).toHaveCount(7);
		await expect(page.locator('main > section').nth(1)).toHaveAttribute('id', 'demo');
		await expect(page.locator('main img[src*="product-event-detail.webp"]')).toHaveCount(1);
		await expect(page.locator('#capabilities')).toContainText('Zigbee');
		await expect(page.locator('#capabilities')).toContainText('64');
		await expect(page.locator('#capabilities')).toContainText('Data Logger');
		await expect(page.locator('#faq details')).toHaveCount(3);
		await expect(page.locator('.media-grid img')).toHaveCount(4);
	});
}

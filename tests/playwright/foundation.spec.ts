import { expect, test } from '@playwright/test';

test('uses the product palette and semantic card tokens in both themes', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Jasny' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'corporate');
	const light = await page
		.locator('body')
		.evaluate((body) => getComputedStyle(body).backgroundColor);
	await page.getByRole('button', { name: 'Ciemny' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'business');
	expect(
		await page.locator('body').evaluate((body) => getComputedStyle(body).backgroundColor)
	).not.toBe(light);
	await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'dark');
});

test('offers mobile section navigation', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await page.getByLabel('Menu nawigacji').click();
	await expect(page.locator('details.dropdown a[href="#demo"]')).toBeVisible();
	await page.locator('details.dropdown a[href="#demo"]').click();
	await expect(page).toHaveURL(/#demo$/);
});

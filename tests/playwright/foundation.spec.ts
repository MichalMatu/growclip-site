import { expect, test } from '@playwright/test';

test('uses the product palette and semantic card tokens in both themes', async ({ page }) => {
	await page.goto('/');
	const lightButton = page.getByRole('button', { name: 'Jasny' });
	await expect(lightButton).toBeEnabled();
	await lightButton.click();
	await expect(lightButton).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'corporate');
	const light = await page
		.locator('body')
		.evaluate((body) => getComputedStyle(body).backgroundColor);
	const darkButton = page.getByRole('button', { name: 'Ciemny' });
	await darkButton.click();
	await expect(darkButton).toHaveAttribute('aria-pressed', 'true');
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

test('theme is persisted across reload and locale change, and system mode follows preference', async ({
	page
}) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/');
	const dark = page.getByRole('button', { name: 'Ciemny' });
	await expect(dark).toBeEnabled();
	await dark.click();
	await expect(dark).toHaveAttribute('aria-pressed', 'true');
	await expect.poll(() => page.evaluate(() => localStorage.getItem('growclip.theme'))).toBe('dark');
	await page.reload();
	await expect(page.getByRole('button', { name: 'Ciemny' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'business');
	await page.goto('/en/');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'business');
	const system = page.locator('.theme-toggle button').first();
	await expect(system).toBeEnabled();
	await system.click();
	await expect(system).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'corporate');
	await page.emulateMedia({ colorScheme: 'dark' });
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'business');
});

test('theme controls are disabled in server HTML until hydration', async ({ request }) => {
	const response = await request.get('/');
	expect(response.ok()).toBeTruthy();
	const html = await response.text();
	const toggle = html.match(/<div class="theme-toggle"[^>]*>([\s\S]*?)<\/div>/)?.[1];
	expect(toggle).toBeTruthy();
	const buttons = toggle?.match(/<button[^>]*>/g) ?? [];
	expect(buttons).toHaveLength(3);
	for (const button of buttons) expect(button).toMatch(/\bdisabled\b/);
});

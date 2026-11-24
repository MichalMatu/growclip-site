import { expect, test } from '@playwright/test';

test('Polish and English have independent server-rendered URLs', async ({ page, request }) => {
	const pl = await request.get('/');
	const en = await request.get('/en/');
	expect(pl.ok()).toBeTruthy();
	expect(en.ok()).toBeTruthy();
	expect(await pl.text()).toContain('<html lang="pl">');
	expect(await en.text()).toContain('<html lang="en">');
	expect(await en.text()).toContain('Local growbox automation');
	await page.goto('/en/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/$/);
	await page.getByRole('link', { name: 'PL', exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
	await expect(page.getByText(/Automatyzacja growboxa\. Lokalne reguły/i)).toBeVisible();
});

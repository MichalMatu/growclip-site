import { expect, test } from '@playwright/test';

type Canvas = HTMLCanvasElement & {
	data: { clear_background_color: string; use_gradients: boolean; graph: unknown };
};
type Snapshot = { background: string; gradients: boolean; width: number; height: number };
test('GrowClip canvas theme follows page theme without graph reset; fullscreen expands and restores', async ({
	page
}) => {
	await page.goto('/');
	await expect(page.locator('.theme-toggle button').first()).toBeEnabled();
	await page.getByRole('button', { name: 'Ciemny' }).click();
	await page.locator('#demo').scrollIntoViewIfNeeded();
	await expect(page.locator('#demo .device-panel-button')).toBeEnabled();
	const canvas = page.locator('#demo canvas');
	const snapshot = (): Promise<Snapshot> =>
		canvas.evaluate((el) => {
			const c = el as Canvas;
			return {
				background: c.data.clear_background_color,
				gradients: c.data.use_gradients,
				width: c.width,
				height: c.height
			};
		});
	const dark = await snapshot();
	expect(dark.gradients).toBe(false);
	await canvas.evaluate((el) => {
		const c = el as Canvas & { originalGraph?: unknown };
		c.originalGraph = c.data.graph;
	});
	await page.getByRole('button', { name: 'Jasny' }).click();
	await expect.poll(async () => (await snapshot()).background).not.toBe(dark.background);
	expect(
		await canvas.evaluate((el) => {
			const c = el as Canvas & { originalGraph?: unknown };
			return Boolean(c.originalGraph && c.originalGraph === c.data.graph);
		})
	).toBe(true);
	const normal = await snapshot();
	const fullscreen = page.locator('#demo .device-fullscreen-button');
	await fullscreen.click();
	await expect(fullscreen).toHaveAttribute('aria-pressed', 'true');
	await expect.poll(async () => (await snapshot()).width).toBeGreaterThanOrEqual(normal.width);
	await expect
		.poll(() =>
			page.evaluate(() => {
				const panel = document.querySelector('#demo .device-panel');
				return (
					document.fullscreenElement === panel ||
					Boolean(panel?.classList.contains('viewport-expanded'))
				);
			})
		)
		.toBe(true);
	await expect
		.poll(() =>
			page.locator('#demo .device-panel').evaluate((el) => {
				const r = el.getBoundingClientRect();
				return (
					Math.abs(r.left) < 2 &&
					Math.abs(r.top) < 2 &&
					Math.abs(r.width - innerWidth) < 2 &&
					Math.abs(r.height - innerHeight) < 2
				);
			})
		)
		.toBe(true);
	await fullscreen.click();
	await expect(fullscreen).toHaveAttribute('aria-pressed', 'false');
	await expect.poll(async () => (await snapshot()).width).toBe(normal.width);
	await expect(page.locator('#demo .device-tab').first()).toHaveAttribute('aria-pressed', 'true');
});

test('fullscreen denial uses viewport fallback and Escape restores the page', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(Element.prototype, 'requestFullscreen', {
			configurable: true,
			value: () => Promise.reject(new Error('test: fullscreen denied'))
		});
	});
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/en/');
	await page.locator('#demo').scrollIntoViewIfNeeded();
	await expect(page.locator('#demo .device-panel-button')).toBeEnabled();
	const button = page.locator('#demo .device-fullscreen-button');
	await button.click();
	await expect(button).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('#demo .device-panel')).toHaveClass(/viewport-expanded/);
	await expect
		.poll(() =>
			page.locator('#demo .device-panel').evaluate((el) => {
				const r = el.getBoundingClientRect();
				return (
					Math.abs(r.left) < 2 &&
					Math.abs(r.top) < 2 &&
					Math.abs(r.width - innerWidth) < 2 &&
					Math.abs(r.height - innerHeight) < 2
				);
			})
		)
		.toBe(true);
	await page.keyboard.press('Escape');
	await expect(button).toHaveAttribute('aria-pressed', 'false');
	await expect(page.locator('html')).not.toHaveClass(/demo-viewport-expanded/);
	await expect(page.locator('#demo .device-panel')).not.toHaveClass(/viewport-expanded/);
});

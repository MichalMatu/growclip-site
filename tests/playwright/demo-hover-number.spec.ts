import { expect, test } from '@playwright/test';

type Canvas = HTMLCanvasElement & {
	data: {
		ds: { scale: number; offset: number[] };
		graph: {
			_nodes: {
				type: string;
				title: string;
				size: number[];
				properties: Record<string, unknown>;
				pos: number[];
			}[];
		};
	};
};

for (const theme of ['Jasny', 'Ciemny']) {
	test('stable demo panel on hover and canonical Number geometry: ' + theme, async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: theme, exact: true }).click();
		const panel = page.locator('#demo .device-panel');
		await panel.scrollIntoViewIfNeeded();
		await expect(page.locator('#demo .device-panel-button')).toBeEnabled();
		const canvas = page.locator('#demo canvas');
		await canvas.scrollIntoViewIfNeeded();
		await expect(panel).toHaveCSS('transform', 'none');
		expect(await panel.evaluate((el) => el.parentElement?.hasAttribute('data-reveal'))).toBe(false);
		const snapshot = () =>
			panel.evaluate((el) => {
				const r = el.getBoundingClientRect();
				const c = el.querySelector('canvas') as Canvas;
				return {
					x: r.x,
					y: r.y + window.scrollY,
					width: r.width,
					height: r.height,
					scale: c.data.ds.scale,
					offset: [...c.data.ds.offset],
					numbers: c.data.graph._nodes
						.filter((n) => n.type === 'Input/Number')
						.map((n) => ({ title: n.title, size: [...n.size], pos: [...n.pos] }))
				};
			});
		const bounds = await canvas.boundingBox();
		if (!bounds) throw Error('canvas missing');
		await page.mouse.move(1, 1);
		await page.waitForTimeout(650);
		const before = await snapshot();
		expect(before.numbers).toHaveLength(2);
		for (const n of before.numbers) {
			expect(n.title).toBe('Number');
			expect(n.size).toEqual([280, 140]);
		}
		expect(before.numbers[1].pos[1] - before.numbers[0].pos[1]).toBeGreaterThanOrEqual(170);
		await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, { steps: 8 });
		await page.waitForTimeout(250);
		await expect(panel).toHaveCSS('transform', 'none');
		expect(await canvas.evaluate((el) => el.matches(':hover'))).toBe(true);
		expect(await snapshot()).toEqual(before);
		await page.mouse.move(bounds.x + bounds.width * 0.7, bounds.y + bounds.height * 0.7, {
			steps: 8
		});
		await expect(panel).toHaveCSS('transform', 'none');
		expect(await canvas.evaluate((el) => el.matches(':hover'))).toBe(true);
		expect(await snapshot()).toEqual(before);
	});
}

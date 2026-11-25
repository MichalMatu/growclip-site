import { expect, test } from '@playwright/test';

type Node = {
	id: number | string;
	type: string;
	pos: number[];
	size: number[];
	properties: Record<string, unknown>;
};
type DemoCanvas = HTMLCanvasElement & {
	data: { ds: { scale: number; offset: number[] }; graph: { _nodes: Node[] } };
};

test('all example nodes do not overlap; Number drag and Compare buttons change simulated state', async ({
	page
}) => {
	await page.goto('/');
	const reset = page.locator('#demo .device-panel-button');
	const canvas = page.locator('#demo canvas');
	const tabs = page.locator('#demo .device-tab');
	await page.locator('#demo').scrollIntoViewIfNeeded();
	await reset.scrollIntoViewIfNeeded();
	await expect(reset).toBeEnabled();
	for (let i = 0; i < 4; i++) {
		await tabs.nth(i).click();
		const nodes = await canvas.evaluate((el) =>
			(el as DemoCanvas).data.graph._nodes.map((n) => ({
				type: n.type,
				pos: [...n.pos],
				size: [...n.size]
			}))
		);
		for (let a = 0; a < nodes.length; a++)
			for (let b = a + 1; b < nodes.length; b++) {
				const n = nodes[a],
					m = nodes[b];
				const overlap =
					n.pos[0] < m.pos[0] + m.size[0] &&
					m.pos[0] < n.pos[0] + n.size[0] &&
					n.pos[1] - 30 < m.pos[1] + m.size[1] &&
					m.pos[1] - 30 < n.pos[1] + n.size[1];
				expect(overlap, n.type + ' / ' + m.type + ' in example ' + i).toBe(false);
			}
	}
	await tabs.nth(0).click();
	await canvas.scrollIntoViewIfNeeded();
	const point = async (type: string, kind: 'gauge' | 'compare', id?: number | string) =>
		canvas.evaluate(
			(el, { type, kind, id }) => {
				const c = el as DemoCanvas,
					n = c.data.graph._nodes.find((n) => n.type === type && (id === undefined || n.id === id));
				if (!n) throw Error('node missing ' + type);
				const { scale, offset } = c.data.ds,
					r = c.getBoundingClientRect();
				const localX = kind === 'gauge' ? n.size[0] / 2 : (n.size[0] - 200) / 2 + 15 + 5 * 34;
				const localY = kind === 'gauge' ? n.size[1] / 2 + 5 : n.size[1] - 22;
				return {
					x: r.left + (n.pos[0] + localX + offset[0]) * scale,
					y: r.top + (n.pos[1] + localY + offset[1]) * scale,
					id: n.id,
					value: n.properties.value,
					operator: n.properties.operator
				};
			},
			{ type, kind, id }
		);
	const before = await point('Input/Number', 'gauge');
	await page.mouse.move(before.x, before.y);
	await page.mouse.down();
	await page.mouse.move(before.x, before.y - 12, { steps: 4 });
	await page.mouse.up();
	await expect
		.poll(async () => Number((await point('Input/Number', 'gauge', before.id)).value))
		.toBeGreaterThan(Number(before.value));
	const after = await point('Input/Number', 'gauge', before.id);
	await page.mouse.move(after.x + 5, after.y + 5, { steps: 4 });
	expect((await point('Input/Number', 'gauge', before.id)).value).toBe(after.value);
	await tabs.nth(1).click();
	await canvas.scrollIntoViewIfNeeded();
	const button = await point('Processing/Compare', 'compare');
	expect(button.operator).toBe('<');
	await page.mouse.click(button.x, button.y);
	await expect.poll(async () => (await point('Processing/Compare', 'compare')).operator).toBe('>');
	await expect
		.poll(() =>
			canvas.evaluate(
				(el) =>
					(el as DemoCanvas).data.graph._nodes.find((n) => n.type === 'Processing/Compare')
						?.properties.result
			)
		)
		.toBe(false);
});

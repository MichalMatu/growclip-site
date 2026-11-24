import { expect, test, type Page } from '@playwright/test';

type DemoNode = { title: string; properties: Record<string, unknown> };
type DemoGraph = { _nodes: DemoNode[]; status: number };
type DemoCanvas = { graph: DemoGraph | null; is_rendering: boolean; _events_binded: boolean };
type CanvasElement = HTMLCanvasElement & { data: DemoCanvas };
type TestWindow = Window & { previousDemo?: DemoCanvas; previousGraph?: DemoGraph };

async function activeStates(page: Page) {
	return page.locator('#demo canvas').evaluate((element) => {
		const graph = (element as CanvasElement).data?.graph;
		return Object.fromEntries(
			(graph?._nodes ?? [])
				.filter((node) => typeof node.properties?.active === 'boolean')
				.map((node) => [String(node.properties.label), node.properties.active])
		);
	});
}

test('four IPO scenarios, causal output, reset, resize and retired graph cleanup', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/');
	await page.locator('#demo').scrollIntoViewIfNeeded();
	const canvas = page.locator('#demo canvas');
	const reset = page.locator('#demo .device-panel-button');
	const tabs = page.locator('#demo .device-tab');
	await expect(reset).toBeEnabled();
	await expect
		.poll(() => activeStates(page))
		.toEqual({ 'Shelly Fan': false, 'Telegram Alert': false });
	// Drive an input of the actual running graph; do not contact hardware.
	await canvas.evaluate((element) => {
		const node = (element as CanvasElement).data.graph?._nodes.find(
			(n) => n.title === 'Air Quality'
		);
		if (!node) throw Error('missing input');
		node.properties.temperature = 29;
	});
	await expect
		.poll(() => activeStates(page))
		.toEqual({ 'Shelly Fan': true, 'Telegram Alert': true });
	await canvas.evaluate((element) => {
		const w = window as TestWindow;
		w.previousDemo = (element as CanvasElement).data;
		w.previousGraph = w.previousDemo.graph ?? undefined;
	});
	await reset.click();
	await expect
		.poll(() => activeStates(page))
		.toEqual({ 'Shelly Fan': false, 'Telegram Alert': false });
	await expect
		.poll(() =>
			canvas.evaluate((element) => {
				const w = window as TestWindow;
				return Boolean(
					w.previousDemo &&
					w.previousGraph &&
					w.previousDemo !== (element as CanvasElement).data &&
					!w.previousDemo.is_rendering &&
					!w.previousDemo._events_binded &&
					w.previousDemo.graph === null &&
					w.previousGraph.status !== (element as CanvasElement).data.graph?.status
				);
			})
		)
		.toBe(true);
	await tabs.nth(1).click();
	await expect
		.poll(() => activeStates(page))
		.toEqual({ 'RF433 Mister': true, 'Humidity Note': true });
	await tabs.nth(2).click();
	await expect.poll(() => activeStates(page)).toEqual({ 'Shelly Pump': true, 'local state': true });
	await canvas.evaluate((element) => {
		const node = (element as CanvasElement).data.graph?._nodes.find(
			(n) => n.properties?.mqtt_id === 'soil_vwc'
		);
		if (!node) throw Error('missing MQTT input');
		node.properties.fresh = 0;
	});
	await expect
		.poll(() => activeStates(page))
		.toEqual({ 'Shelly Pump': false, 'local state': false });
	await tabs.nth(3).click();
	await expect.poll(() => activeStates(page)).toEqual({ 'CO2 Alert': true, 'Sensor Alert': true });
	await page.setViewportSize({ width: 390, height: 844 });
	await expect
		.poll(() =>
			canvas.evaluate((element) => {
				const c = element as HTMLCanvasElement;
				return c.width > 100 && c.height > 100 && c.getBoundingClientRect().right <= innerWidth + 1;
			})
		)
		.toBe(true);
	for (let i = 0; i < 3; i++) {
		await tabs.nth(i).click();
		await reset.click();
		await expect(reset).toBeEnabled();
	}
	await expect.poll(() => activeStates(page)).toEqual({ 'Shelly Pump': true, 'local state': true });
	expect(errors).toEqual([]);
});

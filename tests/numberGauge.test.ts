import { describe, expect, it } from 'vitest';
import { readGaugeValue, gaugeColor, gaugeRatio } from '../src/lib/features/litegraph/numberGauge';
describe('Number visual and numeric contract', () => {
	it('uses continuous canonical cyan-green-red colors', () => {
		expect(gaugeColor(0)).toBe('rgb(0,212,255)');
		expect(gaugeColor(0.5)).toBe('rgb(0,255,136)');
		expect(gaugeColor(1)).toBe('rgb(255,68,68)');
	});
	it('rounds and rejects invalid authoring values instead of fabricating defaults', () => {
		const p = { min: 0, max: 100, value: 27.234, precision: 2 };
		expect(readGaugeValue(p)).toBe(27.23);
		expect(gaugeRatio({ ...p, value: 50 })).toBe(0.5);
		expect(readGaugeValue({ ...p, value: 101 })).toBeNull();
		expect(readGaugeValue({ ...p, precision: 3 })).toBeNull();
		expect(readGaugeValue({ ...p, value: NaN })).toBeNull();
	});
});

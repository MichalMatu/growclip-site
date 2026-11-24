import { describe, expect, it } from 'vitest';
import {
	compareDemoValues,
	demoTimeAllowed,
	demoOutputActive
} from '../src/lib/features/litegraph/demoLogic';

describe('demo causal logic', () => {
	it('compares numeric sensor values and rejects invalid inputs', () => {
		expect(compareDemoValues(31.6, 32, '<')).toBe(true);
		expect(compareDemoValues(32, 32, '<')).toBe(false);
		expect(compareDemoValues(32, 32, '>=')).toBe(true);
		expect(compareDemoValues(NaN, 32, '<')).toBe(false);
		expect(compareDemoValues(undefined, 32, '>')).toBe(false);
		expect(compareDemoValues(1, 2, '?')).toBe(false);
	});
	it('handles daytime and overnight time gates with exclusive end', () => {
		expect(demoTimeAllowed('14:32:08', '08:00', '22:00')).toBe(true);
		expect(demoTimeAllowed('23:41:12', '22:00', '06:00')).toBe(true);
		expect(demoTimeAllowed('05:59:59', '22:00', '06:00')).toBe(true);
		expect(demoTimeAllowed('06:00', '22:00', '06:00')).toBe(false);
		expect(demoTimeAllowed('12:00', '22:00', '06:00')).toBe(false);
		expect(demoTimeAllowed('24:00', '08:00', '22:00')).toBe(false);
		expect(demoTimeAllowed('12:00', '08:00', '08:00')).toBe(false);
	});
	it('activates only when both conditions are explicitly true', () => {
		for (const [time, condition] of [
			[true, false],
			[false, true],
			[false, false],
			[undefined, true],
			[true, 1]
		])
			expect(demoOutputActive(time, condition)).toBe(false);
		expect(demoOutputActive(true, true)).toBe(true);
	});
});

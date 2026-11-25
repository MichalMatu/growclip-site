import { describe, expect, it } from 'vitest';
import {
	compareDemoValues,
	demoTimeAllowed,
	demoOutputActive,
	demoTimeSignal,
	demoFilterSignal,
	evaluateHysteresis
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
		expect(demoOutputActive(demoTimeSignal('12:00'), true)).toBe(true);
		expect(demoOutputActive(demoTimeSignal('12:00', false), true)).toBe(false);
		expect(demoOutputActive(demoTimeSignal('12:00'), 1)).toBe(false);
	});
});

describe('current product preview contracts', () => {
	it('propagates time metadata, blocks invalid and upstream-false signals, wraps midnight', () => {
		const range = { fromHour: 22, fromMinute: 0, toHour: 6, toMinute: 0 };
		const time = demoTimeSignal('23:41:12');
		expect(demoFilterSignal(time, range)).toEqual(time);
		expect(demoFilterSignal(demoTimeSignal('06:00'), range).bool).toBe(false);
		expect(demoFilterSignal({ ...time, bool: false }, range).bool).toBe(false);
		expect(demoFilterSignal(time, { ...range, fromHour: 25 }).bool).toBe(false);
		expect(demoFilterSignal(true, range).bool).toBe(false);
	});
	it('fails closed on missing hysteresis readings and retains valid middle-band state', () => {
		expect(evaluateHysteresis(29, 27.2, 24.5, false).state).toBe(true);
		expect(evaluateHysteresis(26, 27.2, 24.5, true).state).toBe(true);
		expect(evaluateHysteresis(NaN, 27.2, 24.5, true)).toMatchObject({ valid: false, state: false });
		expect(evaluateHysteresis(25, 25, 25, true)).toMatchObject({ valid: false, state: false });
		expect(evaluateHysteresis(20, 22, 25, false).state).toBe(true);
	});
});

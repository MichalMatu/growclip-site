// Pure local demonstration logic; no device commands or external services.
export function compareDemoValues(a: unknown, b: unknown, operator: string): boolean {
	if (typeof a !== 'number' || typeof b !== 'number' || !Number.isFinite(a) || !Number.isFinite(b))
		return false;
	switch (operator) {
		case '>':
			return a > b;
		case '<':
			return a < b;
		case '>=':
			return a >= b;
		case '<=':
			return a <= b;
		case '==':
			return a === b;
		case '!=':
			return a !== b;
		default:
			return false;
	}
}

function seconds(value: unknown): number | null {
	if (typeof value !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(value)) return null;
	const [h, m, s = 0] = value.split(':').map(Number);
	return h < 24 && m < 60 && s < 60 ? h * 3600 + m * 60 + s : null;
}

export function demoTimeAllowed(now: unknown, from: unknown, to: unknown): boolean {
	const n = seconds(now),
		f = seconds(from),
		t = seconds(to);
	if (n === null || f === null || t === null || f === t) return false;
	return f < t ? n >= f && n < t : n >= f || n < t;
}

export type DemoTimeSignal = {
	epoch: number;
	localWallEpochSeconds: number;
	tzFormat: string;
	bool: boolean;
};
// A fixed synthetic date keeps all examples reproducible without using the browser clock.
const DEMO_DAY = Date.UTC(2026, 0, 1) / 1000;
export function demoTimeSignal(time: unknown, available = true): DemoTimeSignal {
	const n = seconds(time);
	const valid = available && n !== null;
	return {
		epoch: valid ? DEMO_DAY + n : 0,
		localWallEpochSeconds: valid ? DEMO_DAY + n : 0,
		tzFormat: valid ? 'UTC0' : '',
		bool: valid
	};
}
function validTime(value: unknown): value is DemoTimeSignal {
	if (!value || typeof value !== 'object') return false;
	const v = value as DemoTimeSignal;
	return (
		Number.isFinite(v.epoch) &&
		v.epoch > 0 &&
		Number.isFinite(v.localWallEpochSeconds) &&
		v.localWallEpochSeconds > 0 &&
		typeof v.tzFormat === 'string' &&
		!!v.tzFormat &&
		typeof v.bool === 'boolean'
	);
}
export function demoFilterSignal(time: unknown, props: Record<string, unknown>): DemoTimeSignal {
	if (!validTime(time)) return demoTimeSignal(null);
	const values = [props.fromHour, props.fromMinute, props.toHour, props.toMinute];
	const valid = values.every(
		(v, i) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= (i % 2 === 0 ? 23 : 59)
	);
	if (!valid || !time.bool) return { ...time, bool: false };
	const [fh, fm, th, tm] = values as number[];
	const fmt = (h: number, m: number) =>
		String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
	const date = new Date(time.localWallEpochSeconds * 1000);
	return {
		...time,
		bool: demoTimeAllowed(fmt(date.getUTCHours(), date.getUTCMinutes()), fmt(fh, fm), fmt(th, tm))
	};
}
export function demoOutputActive(time: unknown, condition: unknown): boolean {
	return validTime(time) && time.bool === true && condition === true;
}
export type HysteresisEvaluation = {
	direction: 'falling' | 'rising' | null;
	state: boolean;
	valid: boolean;
};

export function evaluateHysteresis(
	value: number,
	onThreshold: number,
	offThreshold: number,
	previousState: boolean
): HysteresisEvaluation {
	if (
		!Number.isFinite(value) ||
		!Number.isFinite(onThreshold) ||
		!Number.isFinite(offThreshold) ||
		onThreshold === offThreshold
	) {
		return { direction: null, state: false, valid: false };
	}

	if (onThreshold > offThreshold) {
		return {
			direction: 'rising',
			state: previousState ? value > offThreshold : value >= onThreshold,
			valid: true
		};
	}

	return {
		direction: 'falling',
		state: previousState ? value < offThreshold : value <= onThreshold,
		valid: true
	};
}

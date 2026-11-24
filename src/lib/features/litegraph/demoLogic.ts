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

export function demoOutputActive(time: unknown, condition: unknown): boolean {
	return time === true && condition === true;
}

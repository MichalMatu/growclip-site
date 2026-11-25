// Public, device-independent numeric gauge semantics and presentation.
export function readGaugeValue(p: Record<string, unknown> | undefined): number | null {
	if (!p) return null;
	const { min, max, value, precision } = p;
	if (
		typeof min !== 'number' ||
		typeof max !== 'number' ||
		typeof value !== 'number' ||
		typeof precision !== 'number' ||
		![min, max, value].every(Number.isFinite) ||
		!(min < max) ||
		!Number.isFinite(max - min) ||
		!Number.isInteger(precision) ||
		precision < 0 ||
		precision > 2
	)
		return null;
	const factor = 10 ** precision;
	const rounded = Math.round(value * factor) / factor;
	return Number.isFinite(rounded) && rounded >= min && rounded <= max ? rounded : null;
}
export function gaugeRatio(p: Record<string, unknown> | undefined): number {
	const value = readGaugeValue(p);
	return value !== null && typeof p?.min === 'number' && typeof p.max === 'number'
		? Math.max(0, Math.min(1, (value - p.min) / (p.max - p.min)))
		: 0.5;
}
export function gaugeColor(ratio: number): string {
	const t = Math.max(0, Math.min(1, ratio));
	const colors =
		t < 0.5
			? [0, Math.round(212 + 86 * t), Math.round(255 - 238 * t)]
			: [
					Math.round(510 * (t - 0.5)),
					Math.round(255 - 374 * (t - 0.5)),
					Math.round(136 - 136 * (t - 0.5))
				];
	return 'rgb(' + colors.join(',') + ')';
}

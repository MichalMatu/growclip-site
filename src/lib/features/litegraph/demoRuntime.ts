import {
	compareDemoValues,
	demoOutputActive,
	demoTimeSignal,
	demoFilterSignal,
	evaluateHysteresis,
	type HysteresisEvaluation
} from './demoLogic';
import {
	NODEFLOW_COLORS,
	applyNodeflowCanvasTheme,
	resolveNodeflowCanvasTheme
} from './nodeflowTheme';
import { readGaugeValue, gaugeRatio, gaugeColor } from './numberGauge';

type Vec2 = [number, number];

export type DemoExampleId = 'climate' | 'nightHumidity' | 'mqttBridge' | 'safetyAlert';

type LiteGraphNode = {
	connect: (slot: number, target: LiteGraphNode, targetSlot: number) => void;
	demoType?: string;
	pos: Vec2;
	properties?: Record<string, unknown>;
	size?: Vec2;
	title?: string;
};

type LiteGraphGroup = {
	color?: string;
	font_size?: number;
	note?: string;
	note_font_size?: number;
	pos: Vec2;
	size: Vec2;
	title: string;
};

type LiteGraphNodeBase = {
	flags?: { collapsed?: boolean };
	mouseOver?: boolean;
	pos?: Vec2;
	captureInput?: (capture: boolean) => void;
	setDirtyCanvas?: (foreground: boolean, background?: boolean) => void;
	addInput: (name: string, type: string, extra?: Record<string, unknown>) => void;
	addOutput: (name: string, type: string, extra?: Record<string, unknown>) => void;
	color?: string;
	getInputData: (slot: number) => unknown;
	onDrawForeground?: (ctx: CanvasRenderingContext2D) => void;
	onExecute?: () => void;
	properties?: Record<string, unknown>;
	setOutputData: (slot: number, data: unknown) => void;
	size?: Vec2;
	title?: string;
};

type LiteGraphNamespace = {
	LGraphGroup?: new (title?: string) => LiteGraphGroup;
	LGraphNode: new () => LiteGraphNodeBase;
	SPLINE_LINK?: number;
	createNode: (type: string) => LiteGraphNode | null;
	registerNodeType: (type: string, nodeClass: unknown) => void;
	wheel_listeners_are_passive?: boolean;
};

type LiteGraphGraph = {
	change?: () => void;
	add: (node: LiteGraphNode | LiteGraphGroup) => void;
	start: () => void;
	stop: () => void;
};

type LiteGraphCanvas = {
	adjustMouseEvent?: (event: LiteGraphWheelEvent) => void;
	stopRendering?: () => void;
	unbindEvents?: () => void;
	setGraph?: (graph: null) => void;
	allow_dragcanvas?: boolean;
	connections_width?: number;
	ds?: {
		changeScale?: (value: number, zoomingCenter?: [number, number]) => void;
		max_scale?: number;
		min_scale?: number;
		offset: Vec2;
		scale: number;
	};
	graph?: LiteGraphGraph;
	links_render_mode?: number;
	render_connection_arrows?: boolean;
	render_curved_connections?: boolean;
	render_shadows?: boolean;
	resize: () => void;
	round_radius?: number;
	background_image?: string | null;
	render_canvas_border?: boolean;
	connections_border?: boolean;
	setDirty: (foreground: boolean, background: boolean) => void;
	show_info?: boolean;
	use_gradients?: boolean;
	viewport?: [number, number, number, number];
};

type LiteGraphCanvasConstructor = {
	new (canvas: HTMLCanvasElement, graph: LiteGraphGraph): LiteGraphCanvas;
	link_type_colors?: Record<string, string>;
	prototype?: LiteGraphCanvas & {
		processMouseWheel?: (event: LiteGraphWheelEvent) => false | void;
	};
};

type LiteGraphWindow = Window & {
	__growclipMarketingWheelPatched?: boolean;
	__growclipMarketingNodesRegistered?: boolean;
	LGraph?: new () => LiteGraphGraph;
	LGraphGroup?: new (title?: string) => LiteGraphGroup;
	LGraphCanvas?: LiteGraphCanvasConstructor;
	LiteGraph?: LiteGraphNamespace;
	NodeflowStyle?: typeof NODEFLOW_STYLE;
};

type DemoNodeSpec = {
	pos: Vec2;
	properties?: Record<string, unknown>;
	title?: string;
	type: string;
};

type DemoConnectionSpec = {
	from: string;
	fromSlot: number;
	to: string;
	toSlot: number;
};

type DemoExample = {
	connections: DemoConnectionSpec[];
	nodes: Record<string, DemoNodeSpec>;
};

type DemoGroupSpec = {
	color: string;
	note: string;
	pos: Vec2;
	size: Vec2;
	title: string;
};

type LiteGraphWheelEvent = WheelEvent & {
	detail?: number;
	wheelDeltaY?: number;
};

const DEFAULT_EXAMPLE: DemoExampleId = 'climate';

const NODEFLOW_FONTS = {
	MAIN: '12px monospace',
	STATUS: '11px monospace'
} as const;

const SLOT_COLORS = {
	CONDITION: { off: '#15803d', on: '#22c55e' },
	TIME: { off: '#b45309', on: '#fbbf24' },
	VALUE: { off: '#0891b2', on: '#22d3ee' }
} as const;

const SLOT_TYPES = {
	BOOLEAN: 'boolean',
	NUMBER: 'number',
	TIME: 'time'
} as const;

const SLOT_LABELS = {
	COMPARE_TO: 'compare to',
	CONDITION: 'condition',
	TIME_IN: 'time in',
	TIME_OK: 'time ok',
	VALUE: 'value'
} as const;

function slotColorMeta(
	colors: { off: string; on: string },
	extra: Record<string, unknown> = {}
): Record<string, unknown> {
	return {
		color_off: colors.off,
		color_on: colors.on,
		...extra
	};
}

function valueSlot(extra: Record<string, unknown> = {}) {
	return slotColorMeta(SLOT_COLORS.VALUE, extra);
}

function timeSlot(extra: Record<string, unknown> = {}) {
	return slotColorMeta(SLOT_COLORS.TIME, { label: 'time', ...extra });
}

function conditionSlot(extra: Record<string, unknown> = {}) {
	return slotColorMeta(SLOT_COLORS.CONDITION, extra);
}

const BUTTON_STYLES = {
	danger: {
		background: '#87404a',
		hover: '#99505a',
		pressed: '#723640',
		stroke: 'rgba(255,214,220,0.14)',
		text: '#fff5f6'
	},
	neutral: {
		background: '#3a4550',
		hover: '#465361',
		pressed: '#303943',
		stroke: 'rgba(255,255,255,0.1)',
		text: '#f3f6f9'
	},
	success: {
		background: '#377a4f',
		hover: '#42905d',
		pressed: '#2d6642',
		stroke: 'rgba(199,255,216,0.16)',
		text: '#f4fff7'
	},
	warning: {
		background: '#7a6234',
		hover: '#8b7140',
		pressed: '#66522b',
		stroke: 'rgba(255,237,191,0.15)',
		text: '#fff8e7'
	}
} as const;

const METRIC_CARD_DEFAULT_SIZE: Vec2 = [280, 140];
const ACTION_CARD_DEFAULT_SIZE: Vec2 = [280, 156];
const MQTT_PUBLISH_SIZE: Vec2 = [280, 172];
const KNOB_SIZE: Vec2 = [280, 140];
const ACTION_CARD_INPUT_GUTTER = 104;
const ACTION_CARD_BUTTON_HEIGHT = 24;
const ACTION_CARD_BUTTON_WIDTH = 55;
const ACTION_CARD_BUTTON_GAP = 10;
const ACTION_CARD_BUTTON_BOTTOM = 16;
const LITEGRAPH_TITLE_HEIGHT = 30;
const DEMO_GROUP_HEADER_SPACE = 76;

const NODEFLOW_STYLE = {
	COLORS: NODEFLOW_COLORS,
	FONTS: NODEFLOW_FONTS,
	getDefaultSizeForType(type: string): Vec2 {
		if (type === 'Input/Number') {
			return [...KNOB_SIZE] as Vec2;
		}
		if (type === 'Sensor/DS3231') {
			return [280, 140];
		}
		if (type === 'Sensor/BLE Sensor') {
			return [340, 140];
		}
		if (type === 'Sensor/MQTT Input') {
			return [280, 168];
		}
		if (type === 'Processing/Hysteresis') {
			return [280, 200];
		}
		if (type === 'Processing/Time Filter') {
			return [260, 96];
		}
		if (type === 'Devices/MQTT Publish') {
			return [...MQTT_PUBLISH_SIZE] as Vec2;
		}
		if (type.startsWith('Devices/')) {
			return [...ACTION_CARD_DEFAULT_SIZE] as Vec2;
		}
		return [...METRIC_CARD_DEFAULT_SIZE] as Vec2;
	},
	clipTextToWidth,
	drawCenteredTextBlock,
	drawNodeBodyText
} as const;

const DEMO_EXAMPLES: Record<DemoExampleId, DemoExample> = {
	climate: {
		nodes: {
			scd41: {
				type: 'Sensor/SCD41',
				pos: [24, 42],
				properties: { co2: 740, humidity: 61.5, temperature: 25.6 }
			},
			onThreshold: {
				type: 'Input/Number',
				pos: [24, 276],
				title: 'ON threshold',
				properties: { max: 40, min: 10, precision: 1, value: 27.2 }
			},
			offThreshold: {
				type: 'Input/Number',
				pos: [24, 456],
				title: 'OFF threshold',
				properties: { max: 40, min: 10, precision: 1, value: 24.5 }
			},
			timeSource: {
				type: 'Sensor/DS3231',
				pos: [24, 636],
				properties: { source: 'DS3231/NTP', time: '14:32:08' }
			},
			hysteresis: {
				type: 'Processing/Hysteresis',
				pos: [438, 124],
				properties: { off: 24.5, on: 27.2, state: false, value: 25.6 }
			},
			time: {
				type: 'Processing/Time Filter',
				pos: [438, 380],
				properties: { fromHour: 8, fromMinute: 0, result: true, toHour: 22, toMinute: 0 }
			},
			fan: {
				type: 'Devices/Shelly Plug',
				pos: [840, 78],
				title: 'Shelly Fan',
				properties: {
					client_id: 'shelly-fan',
					label: 'Shelly Fan',
					power: 18.4,
					status: 'ON',
					voltage: 230
				}
			},
			alert: {
				type: 'Devices/Telegram Notification',
				pos: [840, 326],
				title: 'Telegram Alert',
				properties: {
					edge: 'both',
					label: 'Telegram Alert',
					message: 'Temperature threshold active'
				}
			}
		},
		connections: [
			{ from: 'scd41', fromSlot: 0, to: 'hysteresis', toSlot: 0 },
			{ from: 'onThreshold', fromSlot: 0, to: 'hysteresis', toSlot: 1 },
			{ from: 'offThreshold', fromSlot: 0, to: 'hysteresis', toSlot: 2 },
			{ from: 'timeSource', fromSlot: 0, to: 'time', toSlot: 0 },
			{ from: 'hysteresis', fromSlot: 0, to: 'fan', toSlot: 1 },
			{ from: 'time', fromSlot: 0, to: 'fan', toSlot: 0 },
			{ from: 'hysteresis', fromSlot: 0, to: 'alert', toSlot: 1 },
			{ from: 'time', fromSlot: 0, to: 'alert', toSlot: 0 }
		]
	},
	nightHumidity: {
		nodes: {
			ble: {
				type: 'Sensor/BLE Sensor',
				pos: [24, 54],
				title: 'Canopy BLE',
				properties: {
					sensor_id: 'canopy_ble',
					age_sec: 2,
					battery: 88,
					humidity: 54.2,
					online: true,
					rssi: -61,
					temperature: 23.4
				}
			},
			threshold: {
				type: 'Input/Number',
				pos: [24, 286],
				title: 'humidity limit',
				properties: { max: 90, min: 30, precision: 0, value: 58 }
			},
			timeSource: {
				type: 'Sensor/DS3231',
				pos: [24, 466],
				properties: { source: 'DS3231/NTP', time: '23:41:12' }
			},
			compare: {
				type: 'Processing/Compare',
				pos: [438, 82],
				properties: { operator: '<', threshold: 58, valueLabel: 'humidity' }
			},
			time: {
				type: 'Processing/Time Filter',
				pos: [438, 320],
				properties: { fromHour: 22, fromMinute: 0, result: true, toHour: 6, toMinute: 0 }
			},
			socket: {
				type: 'Devices/433MHz Socket',
				pos: [840, 78],
				title: 'RF433 Mister',
				properties: { device_id: 'mister', label: 'RF433 Mister', mode: 'and', action_mode: 'auto' }
			},
			alert: {
				type: 'Devices/Telegram Notification',
				pos: [840, 326],
				title: 'Humidity Note',
				properties: { edge: 'both', label: 'Humidity Note', message: 'Night RH below target' }
			}
		},
		connections: [
			{ from: 'ble', fromSlot: 1, to: 'compare', toSlot: 0 },
			{ from: 'threshold', fromSlot: 0, to: 'compare', toSlot: 1 },
			{ from: 'timeSource', fromSlot: 0, to: 'time', toSlot: 0 },
			{ from: 'compare', fromSlot: 0, to: 'socket', toSlot: 1 },
			{ from: 'time', fromSlot: 0, to: 'socket', toSlot: 0 },
			{ from: 'compare', fromSlot: 0, to: 'alert', toSlot: 1 },
			{ from: 'time', fromSlot: 0, to: 'alert', toSlot: 0 }
		]
	},
	mqttBridge: {
		nodes: {
			mqttInput: {
				type: 'Sensor/MQTT Input',
				pos: [24, 72],
				properties: {
					mqtt_id: 'soil_vwc',
					label: 'MQTT Input',
					status: 'fresh',
					value: 31.6,
					fresh: 1,
					age_sec: 2
				}
			},
			threshold: {
				type: 'Input/Number',
				pos: [24, 292],
				title: 'soil target',
				properties: { max: 80, min: 5, precision: 0, value: 32 }
			},
			timeSource: {
				type: 'Sensor/DS3231',
				pos: [24, 492],
				properties: { source: 'System/RTC', time: '09:05:44' }
			},
			compare: {
				type: 'Processing/Compare',
				pos: [438, 82],
				properties: { operator: '<', threshold: 32, valueLabel: 'soil VWC' }
			},
			time: {
				type: 'Processing/Time Filter',
				pos: [438, 312],
				properties: { fromHour: 7, fromMinute: 0, result: true, toHour: 21, toMinute: 0 }
			},
			pump: {
				type: 'Devices/Shelly Plug',
				pos: [840, 64],
				title: 'Shelly Pump',
				properties: {
					client_id: 'shelly-pump',
					label: 'Shelly Pump',
					power: 42.8,
					status: 'ON',
					voltage: 230
				}
			},
			publish: {
				type: 'Devices/MQTT Publish',
				pos: [840, 324],
				properties: {
					mqtt_id: 'pump_state',
					label: 'local state'
				}
			}
		},
		connections: [
			{ from: 'mqttInput', fromSlot: 0, to: 'compare', toSlot: 0 },
			{ from: 'threshold', fromSlot: 0, to: 'compare', toSlot: 1 },
			{ from: 'timeSource', fromSlot: 0, to: 'time', toSlot: 0 },
			{ from: 'time', fromSlot: 0, to: 'pump', toSlot: 0 },
			{ from: 'time', fromSlot: 0, to: 'publish', toSlot: 0 },
			{ from: 'compare', fromSlot: 0, to: 'pump', toSlot: 1 },
			{ from: 'compare', fromSlot: 0, to: 'publish', toSlot: 1 }
		]
	},
	safetyAlert: {
		nodes: {
			scd41: {
				type: 'Sensor/SCD41',
				pos: [24, 48],
				properties: { co2: 1280, humidity: 63.1, temperature: 26.1 }
			},
			co2Limit: {
				type: 'Input/Number',
				pos: [24, 488],
				title: 'CO2 limit',
				properties: { max: 2500, min: 400, precision: 0, value: 1200 }
			},
			timeSource: {
				type: 'Sensor/DS3231',
				pos: [24, 848],
				properties: { source: 'DS3231/NTP', time: '18:18:22' }
			},
			co2Compare: {
				type: 'Processing/Compare',
				pos: [438, 70],
				properties: { operator: '>', threshold: 1200, valueLabel: 'co2 ppm' }
			},
			ble: {
				type: 'Sensor/BLE Sensor',
				pos: [24, 272],
				title: 'Rack BLE',
				properties: {
					sensor_id: 'rack_ble',
					age_sec: 120,
					battery: 12,
					humidity: 62.5,
					online: false,
					rssi: -89,
					temperature: 25.9
				}
			},
			time: {
				type: 'Processing/Time Filter',
				pos: [438, 532],
				properties: { fromHour: 0, fromMinute: 0, result: true, toHour: 23, toMinute: 59 }
			},
			co2Alert: {
				type: 'Devices/Telegram Notification',
				pos: [920, 68],
				title: 'CO2 Alert',
				properties: {
					edge: 'both',
					label: 'CO2 Alert',
					message: 'CO2 above configured limit'
				}
			},
			offlineCompare: {
				type: 'Processing/Compare',
				pos: [438, 292],
				properties: { operator: '==', threshold: 0, valueLabel: 'online' }
			},
			offlineZero: {
				type: 'Input/Number',
				pos: [24, 668],
				title: 'offline = 0',
				properties: { max: 1, min: 0, precision: 0, value: 0 }
			},
			sensorAlert: {
				type: 'Devices/Telegram Notification',
				pos: [920, 340],
				title: 'Sensor Alert',
				properties: {
					edge: 'both',
					label: 'Sensor Alert',
					message: 'BLE sensor offline'
				}
			}
		},
		connections: [
			{ from: 'scd41', fromSlot: 2, to: 'co2Compare', toSlot: 0 },
			{ from: 'co2Limit', fromSlot: 0, to: 'co2Compare', toSlot: 1 },
			{ from: 'timeSource', fromSlot: 0, to: 'time', toSlot: 0 },
			{ from: 'time', fromSlot: 0, to: 'co2Alert', toSlot: 0 },
			{ from: 'time', fromSlot: 0, to: 'sensorAlert', toSlot: 0 },
			{ from: 'co2Compare', fromSlot: 0, to: 'co2Alert', toSlot: 1 },
			{ from: 'ble', fromSlot: 4, to: 'offlineCompare', toSlot: 0 },
			{ from: 'offlineZero', fromSlot: 0, to: 'offlineCompare', toSlot: 1 },
			{ from: 'offlineCompare', fromSlot: 0, to: 'sensorAlert', toSlot: 1 }
		]
	}
};

function toFiniteNumber(value: unknown, fallback: number): number {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function readNumber(
	properties: Record<string, unknown> | undefined,
	key: string,
	fallback: number
): number {
	return toFiniteNumber(properties?.[key], fallback);
}

function readString(
	properties: Record<string, unknown> | undefined,
	key: string,
	fallback: string
): string {
	const value = properties?.[key];
	return typeof value === 'string' && value.trim() ? value : fallback;
}

function readBoolean(
	properties: Record<string, unknown> | undefined,
	key: string,
	fallback: boolean
): boolean {
	const value = properties?.[key];
	return typeof value === 'boolean' ? value : fallback;
}

function clipTextToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
	if (!text || ctx.measureText(text).width <= maxWidth) {
		return text;
	}
	let clipped = text;
	while (clipped.length > 1 && ctx.measureText(`${clipped}...`).width > maxWidth) {
		clipped = clipped.slice(0, -1);
	}
	return `${clipped}...`;
}

function resolveNodeBodyRect(
	node: LiteGraphNodeBase,
	options: {
		bottomPadding?: number;
		leftPadding?: number;
		outputGutter?: number;
		rightPadding?: number;
		topPadding?: number;
	} = {}
) {
	const size = node.size ?? METRIC_CARD_DEFAULT_SIZE;
	const left = options.leftPadding ?? 18;
	const right = options.rightPadding ?? 12;
	const top = options.topPadding ?? 42;
	const bottom = options.bottomPadding ?? 18;
	const outputGutter = options.outputGutter ?? 96;
	return {
		h: Math.max(0, size[1] - top - bottom),
		w: Math.max(0, size[0] - left - right - outputGutter),
		x: left,
		y: top
	};
}

function drawNodeBodyText(
	ctx: CanvasRenderingContext2D,
	node: LiteGraphNodeBase,
	lines: readonly string[],
	options: {
		align?: CanvasTextAlign;
		bottomPadding?: number;
		color?: string;
		font?: string;
		leftPadding?: number;
		lineHeight?: number;
		maxLines?: number;
		outputGutter?: number;
		rightPadding?: number;
		topPadding?: number;
		verticalAlign?: 'top' | 'center';
	} = {}
) {
	const rect = resolveNodeBodyRect(node, options);
	if (rect.w <= 0 || rect.h <= 0) {
		return;
	}
	const lineHeight = options.lineHeight ?? 18;
	const visible = lines
		.map((line) => String(line ?? '').trim())
		.filter(Boolean)
		.slice(
			0,
			Math.min(options.maxLines ?? lines.length, Math.max(1, Math.floor(rect.h / lineHeight)))
		);
	const align = options.align ?? 'left';
	const x = align === 'center' ? rect.x + rect.w / 2 : align === 'right' ? rect.x + rect.w : rect.x;
	const totalHeight = visible.length * lineHeight;
	const yStart =
		options.verticalAlign === 'center'
			? rect.y + Math.max(0, (rect.h - totalHeight) / 2) + lineHeight / 2
			: rect.y + lineHeight / 2;

	ctx.save();
	ctx.font = options.font ?? NODEFLOW_FONTS.MAIN;
	ctx.fillStyle = options.color ?? NODEFLOW_COLORS.TEXT;
	ctx.textAlign = align;
	ctx.textBaseline = 'middle';
	visible.forEach((line, index) => {
		ctx.fillText(clipTextToWidth(ctx, line, rect.w), x, yStart + index * lineHeight);
	});
	ctx.restore();
}

function drawCenteredTextBlock(
	ctx: CanvasRenderingContext2D,
	node: LiteGraphNodeBase,
	lines: readonly string[],
	options: {
		color?: string;
		font?: string;
		leftPadding?: number;
		lineHeight?: number;
		rightPadding?: number;
	} = {}
) {
	drawNodeBodyText(ctx, node, lines, {
		align: 'center',
		color: options.color,
		font: options.font ?? NODEFLOW_FONTS.MAIN,
		leftPadding: options.leftPadding ?? 24,
		lineHeight: options.lineHeight ?? 18,
		outputGutter: 24,
		rightPadding: options.rightPadding ?? 24,
		topPadding: 42,
		verticalAlign: 'center'
	});
}

function drawActionCardLines(
	ctx: CanvasRenderingContext2D,
	node: LiteGraphNodeBase,
	lines: readonly string[],
	options: {
		bottomPadding?: number;
		lineHeight?: number;
		maxLines?: number;
		topPadding?: number;
	} = {}
) {
	drawNodeBodyText(ctx, node, lines, {
		color: NODEFLOW_COLORS.TEXT,
		font: NODEFLOW_FONTS.MAIN,
		leftPadding: ACTION_CARD_INPUT_GUTTER,
		lineHeight: options.lineHeight ?? 16,
		maxLines: options.maxLines ?? lines.length,
		outputGutter: 0,
		rightPadding: 16,
		bottomPadding: options.bottomPadding ?? 18,
		topPadding: options.topPadding ?? 38
	});
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	ctx.beginPath();
	if (typeof ctx.roundRect === 'function') {
		ctx.roundRect(x, y, width, height, radius);
		return;
	}
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
}

function drawHysteresisBand(
	ctx: CanvasRenderingContext2D,
	node: LiteGraphNodeBase,
	value: number,
	onThreshold: number,
	offThreshold: number,
	evaluation: HysteresisEvaluation
) {
	const size = node.size ?? METRIC_CARD_DEFAULT_SIZE;
	const x = Math.max(108, Math.round(size[0] * 0.39));
	const width = Math.max(80, size[0] - x - 16);
	const y = 61;
	const height = 12;
	const stateLabel = evaluation.state ? 'ON' : 'OFF';
	const stateColor = evaluation.state ? NODEFLOW_COLORS.SUCCESS : NODEFLOW_COLORS.ERROR;

	ctx.save();
	ctx.font = NODEFLOW_FONTS.STATUS;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'right';
	ctx.fillStyle = evaluation.valid ? stateColor : NODEFLOW_COLORS.ERROR;
	ctx.fillText(
		evaluation.valid ? `${formatFixed(value)} · ${stateLabel}` : 'INVALID · OFF',
		x + width,
		48
	);

	if (!evaluation.valid || evaluation.direction === null) {
		drawRoundedRect(ctx, x, y, width, height, 5);
		ctx.fillStyle = NODEFLOW_COLORS.ERROR;
		ctx.globalAlpha = 0.65;
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.fillStyle = NODEFLOW_COLORS.TEXT;
		ctx.textAlign = 'center';
		ctx.fillText(
			!Number.isFinite(value)
				? 'No input value'
				: !Number.isFinite(onThreshold) || !Number.isFinite(offThreshold)
					? 'Set thresholds'
					: 'ON = OFF',
			x + width / 2,
			92
		);
		ctx.fillText('output fails closed', x + width / 2, 112);
		ctx.restore();
		return;
	}

	const thresholdSpan = Math.abs(onThreshold - offThreshold);
	const domainMin = Math.min(onThreshold, offThreshold) - thresholdSpan * 0.55;
	const domainMax = Math.max(onThreshold, offThreshold) + thresholdSpan * 0.55;
	const toX = (input: number) => x + ((input - domainMin) / (domainMax - domainMin)) * width;
	const lowX = toX(Math.min(onThreshold, offThreshold));
	const highX = toX(Math.max(onThreshold, offThreshold));
	const lowColor =
		evaluation.direction === 'rising' ? NODEFLOW_COLORS.ERROR : NODEFLOW_COLORS.SUCCESS;
	const highColor =
		evaluation.direction === 'rising' ? NODEFLOW_COLORS.SUCCESS : NODEFLOW_COLORS.ERROR;

	drawRoundedRect(ctx, x, y, width, height, 5);
	ctx.clip();
	ctx.fillStyle = lowColor;
	ctx.globalAlpha = 0.88;
	ctx.fillRect(x, y, lowX - x, height);
	ctx.fillStyle = stateColor;
	ctx.globalAlpha = 0.28;
	ctx.fillRect(lowX, y, highX - lowX, height);
	ctx.fillStyle = highColor;
	ctx.globalAlpha = 0.88;
	ctx.fillRect(highX, y, x + width - highX, height);
	ctx.restore();

	ctx.save();
	drawRoundedRect(ctx, x, y, width, height, 5);
	ctx.strokeStyle = 'rgba(255,255,255,0.28)';
	ctx.lineWidth = 1;
	ctx.stroke();
	const markerX = Math.max(x, Math.min(x + width, toX(value)));
	ctx.beginPath();
	ctx.moveTo(markerX, y - 3);
	ctx.lineTo(markerX, y + height + 3);
	ctx.strokeStyle = NODEFLOW_COLORS.TEXT;
	ctx.lineWidth = 2;
	ctx.stroke();

	const lowLabel =
		evaluation.direction === 'rising'
			? `OFF ≤ ${formatFixed(offThreshold)}`
			: `ON ≤ ${formatFixed(onThreshold)}`;
	const highLabel =
		evaluation.direction === 'rising'
			? `ON ≥ ${formatFixed(onThreshold)}`
			: `OFF ≥ ${formatFixed(offThreshold)}`;
	ctx.font = NODEFLOW_FONTS.STATUS;
	ctx.fillStyle = NODEFLOW_COLORS.TEXT;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	ctx.fillText(lowLabel, x, 88);
	ctx.textAlign = 'right';
	ctx.fillText(highLabel, x + width, 88);
	ctx.textAlign = 'center';
	ctx.fillStyle = stateColor;
	ctx.fillText(`middle band keeps ${stateLabel}`, x + width / 2, 107);
	ctx.fillStyle = NODEFLOW_COLORS.NEUTRAL;
	ctx.fillText(`${evaluation.direction} value activates ON`, x + width / 2, 125);
	ctx.restore();
}

function drawButton(
	ctx: CanvasRenderingContext2D,
	rect: { h: number; w: number; x: number; y: number },
	label: string,
	tone: keyof typeof BUTTON_STYLES
) {
	const style = BUTTON_STYLES[tone];
	ctx.save();
	drawRoundedRect(ctx, rect.x, rect.y, rect.w, rect.h, Math.min(8, rect.h / 2));
	ctx.fillStyle = style.background;
	ctx.fill();
	ctx.strokeStyle = style.stroke;
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.fillStyle = style.text;
	ctx.font = '600 11px sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 0.5);
	ctx.restore();
}

function getActionButtonRowBounds(
	node: LiteGraphNodeBase,
	keys: readonly string[],
	options: { buttonWidth?: number } = {}
) {
	const size = node.size ?? ACTION_CARD_DEFAULT_SIZE;
	const buttonWidth = options.buttonWidth ?? ACTION_CARD_BUTTON_WIDTH;
	const totalWidth =
		keys.length * buttonWidth + Math.max(0, keys.length - 1) * ACTION_CARD_BUTTON_GAP;
	const contentWidth = Math.max(80, size[0] - ACTION_CARD_INPUT_GUTTER - 16);
	const contentCenter = ACTION_CARD_INPUT_GUTTER + contentWidth / 2;
	const startX = Math.max(2, Math.min(size[0] - totalWidth - 2, contentCenter - totalWidth / 2));
	const y = Math.max(0, size[1] - ACTION_CARD_BUTTON_BOTTOM - ACTION_CARD_BUTTON_HEIGHT);
	return keys.map((key, index) => ({
		h: ACTION_CARD_BUTTON_HEIGHT,
		key,
		w: buttonWidth,
		x: startX + index * (buttonWidth + ACTION_CARD_BUTTON_GAP),
		y
	}));
}

function drawActionButtons(ctx: CanvasRenderingContext2D, node: LiteGraphNodeBase) {
	const buttons = getActionButtonRowBounds(node, ['auto', 'on', 'off']);
	drawButton(ctx, buttons[0], 'AUTO', 'neutral');
	drawButton(ctx, buttons[1], 'ON', 'success');
	drawButton(ctx, buttons[2], 'OFF', 'danger');
}

function drawMqttPublishButtons(ctx: CanvasRenderingContext2D, node: LiteGraphNodeBase) {
	const buttons = getActionButtonRowBounds(node, ['auto', 'publish'], { buttonWidth: 72 });
	drawButton(ctx, buttons[0], 'AUTO', 'neutral');
	drawButton(ctx, buttons[1], 'SEND', 'neutral');
}

function formatFixed(value: number, precision = 1): string {
	return value.toFixed(precision);
}

function formatMetric(value: number | null, suffix: string, digits = 1): string {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return '-';
	}
	const formatted = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(digits);
	return suffix ? `${formatted} ${suffix}` : formatted;
}

function formatActionMetric(value: number, digits: number, suffix: string): string {
	return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(digits)} ${suffix}`;
}

function preview(value: unknown, limit = 42): string {
	const text = String(value ?? '')
		.replace(/\s+/g, ' ')
		.trim();
	if (!text) {
		return '(empty)';
	}
	return text.length > limit ? `${text.slice(0, limit - 1)}...` : text;
}

function formatFreshValue(value: number): string {
	return value >= 0.5 ? 'yes' : 'no';
}

function timeWindowFromProperties(properties: Record<string, unknown> | undefined): string {
	const format = (h: unknown, m: unknown) =>
		`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
	return `${format(properties?.fromHour, properties?.fromMinute)} - ${format(properties?.toHour, properties?.toMinute)}`;
}

function installNodeflowStyle(win: LiteGraphWindow) {
	win.NodeflowStyle = NODEFLOW_STYLE;
	if (win.LGraphCanvas) {
		win.LGraphCanvas.link_type_colors = {
			...(win.LGraphCanvas.link_type_colors ?? {}),
			boolean: SLOT_COLORS.CONDITION.on,
			number: SLOT_COLORS.VALUE.on,
			time: SLOT_COLORS.TIME.on
		};
	}
}

function installSoftWheelZoom(win: LiteGraphWindow, liteGraph: LiteGraphNamespace) {
	const prototype = win.LGraphCanvas?.prototype;
	if (!prototype || win.__growclipMarketingWheelPatched) {
		return;
	}

	prototype.processMouseWheel = function processMouseWheel(this: LiteGraphCanvas, event) {
		if (!this.graph || !this.allow_dragcanvas || !this.ds) {
			return;
		}

		const delta =
			typeof event.wheelDeltaY === 'number'
				? event.wheelDeltaY
				: typeof event.deltaY === 'number'
					? -event.deltaY
					: Number(event.detail || 0) * -60;
		this.adjustMouseEvent?.(event);

		const x = event.clientX;
		const y = event.clientY;
		const isInside =
			!this.viewport ||
			(x >= this.viewport[0] &&
				x < this.viewport[0] + this.viewport[2] &&
				y >= this.viewport[1] &&
				y < this.viewport[1] + this.viewport[3]);
		if (!isInside) {
			return false;
		}

		const zoomStep = 1.04;
		const nextScale =
			delta > 0 ? this.ds.scale * zoomStep : delta < 0 ? this.ds.scale / zoomStep : this.ds.scale;
		this.ds.changeScale?.(nextScale, [event.clientX, event.clientY]);
		this.graph.change?.();

		if (!liteGraph.wheel_listeners_are_passive && event.cancelable) {
			event.preventDefault();
		}
		return false;
	};

	win.__growclipMarketingWheelPatched = true;
}

function applyCanvasStyle(canvas: LiteGraphCanvas, liteGraph: LiteGraphNamespace) {
	canvas.render_curved_connections = true;
	canvas.links_render_mode = liteGraph.SPLINE_LINK ?? 2;
	canvas.connections_width = 4;
	canvas.round_radius = 12;
	canvas.use_gradients = false;
	canvas.background_image = null;
	canvas.render_canvas_border = false;
	canvas.connections_border = true;
	applyNodeflowCanvasTheme(canvas);
	canvas.render_shadows = true;
	canvas.render_connection_arrows = false;
	canvas.show_info = false;
	if (canvas.ds) {
		canvas.ds.min_scale = 0.2;
		canvas.ds.max_scale = 1.6;
	}
}

function getNodeSize(node: LiteGraphNode): Vec2 {
	const fallback = NODEFLOW_STYLE.getDefaultSizeForType(node.demoType ?? '');
	return [
		Math.max(toFiniteNumber(node.size?.[0], fallback[0]), fallback[0]),
		Math.max(toFiniteNumber(node.size?.[1], fallback[1]), fallback[1])
	];
}

function getGroupSize(group: LiteGraphGroup): Vec2 {
	return [
		Math.max(toFiniteNumber(group.size?.[0], 140), 140),
		Math.max(toFiniteNumber(group.size?.[1], 80), 80)
	];
}

function fitExampleToCanvas(
	target: HTMLCanvasElement,
	canvas: LiteGraphCanvas,
	nodes: readonly LiteGraphNode[],
	groups: readonly LiteGraphGroup[] = []
) {
	if (!canvas.ds || nodes.length === 0) {
		return;
	}
	const minX = Math.min(
		...nodes.map((node) => node.pos[0]),
		...groups.map((group) => group.pos[0])
	);
	const minY = Math.min(
		...nodes.map((node) => node.pos[1] - LITEGRAPH_TITLE_HEIGHT),
		...groups.map((group) => group.pos[1])
	);
	const maxX = Math.max(
		...nodes.map((node) => node.pos[0] + getNodeSize(node)[0]),
		...groups.map((group) => group.pos[0] + getGroupSize(group)[0])
	);
	const maxY = Math.max(
		...nodes.map((node) => node.pos[1] + getNodeSize(node)[1]),
		...groups.map((group) => group.pos[1] + getGroupSize(group)[1])
	);
	const graphWidth = Math.max(1, maxX - minX);
	const graphHeight = Math.max(1, maxY - minY);
	const width = Math.max(320, target.clientWidth || target.width);
	const height = Math.max(320, target.clientHeight || target.height);
	const margin = width < 520 ? 16 : 28;
	const maxScale = width < 520 ? 0.58 : 1.15;
	const fitScale = Math.min((width - margin * 2) / graphWidth, (height - margin * 2) / graphHeight);
	const scale = Math.min(maxScale, Math.max(0.2, fitScale));
	const horizontalMargin = Math.max(margin / scale, (width / scale - graphWidth) / 2);
	canvas.ds.scale = scale;
	canvas.ds.offset = [horizontalMargin - minX, margin / scale - minY];
}

function registerMarketingNodes(liteGraph: LiteGraphNamespace, win: LiteGraphWindow) {
	if (win.__growclipMarketingNodesRegistered) {
		return;
	}

	installNodeflowStyle(win);
	const NodeBase = liteGraph.LGraphNode;

	class SCD41InputNode extends NodeBase {
		constructor() {
			super();
			this.title = 'Air Quality';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Sensor/SCD41');
			this.properties = { co2: 720, humidity: 62, temperature: 25.4 };
			this.addOutput('temperature', SLOT_TYPES.NUMBER, valueSlot({ label: 'Temperature' }));
			this.addOutput('humidity', SLOT_TYPES.NUMBER, valueSlot());
			this.addOutput('co2', SLOT_TYPES.NUMBER, valueSlot());
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			const props = this.properties;
			drawNodeBodyText(
				ctx,
				this,
				[
					`temp: ${formatMetric(readNumber(props, 'temperature', 25.4), 'C')}`,
					`humidity: ${formatMetric(readNumber(props, 'humidity', 62.0), '%')}`,
					`co2: ${formatMetric(readNumber(props, 'co2', 720), 'ppm', 0)}`
				],
				{
					bottomPadding: 18,
					leftPadding: 18,
					lineHeight: 18,
					maxLines: 3,
					outputGutter: 104,
					topPadding: 42
				}
			);
		};

		onExecute = () => {
			const props = this.properties;
			for (const [index, field] of ['temperature', 'humidity', 'co2'].entries()) {
				const value = props?.[field];
				this.setOutputData(
					index,
					props?.fresh !== false && typeof value === 'number' && Number.isFinite(value)
						? value
						: null
				);
			}
		};
	}

	class BleSensorNode extends NodeBase {
		constructor() {
			super();
			this.title = 'BLE Sensor';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Sensor/BLE Sensor');
			this.properties = {
				sensor_id: 'demo_ble',
				field_ids: ['temperature', 'humidity', 'battery', 'rssi', 'online', 'age_sec'],
				age_sec: 2,
				battery: 88,
				humidity: 60.2,
				online: true,
				rssi: -64,
				temperature: 24.8
			};
			this.addOutput('temperature', SLOT_TYPES.NUMBER, valueSlot({ label: 'Temperature' }));
			this.addOutput('humidity', SLOT_TYPES.NUMBER, valueSlot({ label: 'Humidity' }));
			this.addOutput('battery', SLOT_TYPES.NUMBER, valueSlot({ label: 'Battery' }));
			this.addOutput('rssi', SLOT_TYPES.NUMBER, valueSlot());
			this.addOutput('online', SLOT_TYPES.NUMBER, valueSlot({ label: 'Online' }));
			this.addOutput('age_sec', SLOT_TYPES.NUMBER, valueSlot({ label: 'Age (s)' }));
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			const props = this.properties;
			const online = readBoolean(props, 'online', true);
			drawNodeBodyText(
				ctx,
				this,
				[
					`Temp ${formatMetric(online ? readNumber(props, 'temperature', 24.8) : null, '°C')}  Hum ${formatMetric(online ? readNumber(props, 'humidity', 60.2) : null, '%')}`,
					`Bat ${formatMetric(online ? readNumber(props, 'battery', 88) : null, '%', 0)}  RSSI ${formatMetric(readNumber(props, 'rssi', -64), 'dBm', 0)}`,
					`Status: ${online ? 'Online' : 'Offline'} | Age: ${formatMetric(readNumber(props, 'age_sec', 2), 's', 0)}`
				],
				{
					leftPadding: 18,
					lineHeight: 18,
					maxLines: 3,
					outputGutter: 92,
					topPadding: 44
				}
			);
		};

		onExecute = () => {
			const p = this.properties;
			const online = readBoolean(p, 'online', true);
			this.setOutputData(0, online ? readNumber(p, 'temperature', 24.8) : NaN);
			this.setOutputData(1, online ? readNumber(p, 'humidity', 60.2) : NaN);
			this.setOutputData(2, online ? readNumber(p, 'battery', 88) : null);
			this.setOutputData(3, readNumber(p, 'rssi', -64));
			this.setOutputData(4, online ? 1 : 0);
			this.setOutputData(5, readNumber(p, 'age_sec', 2));
		};
	}

	class MqttInputNode extends NodeBase {
		constructor() {
			super();
			this.title = 'MQTT Input';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Sensor/MQTT Input');
			this.properties = {
				age_sec: 3,
				fresh: 1,
				mqtt_id: 'demo_input',
				label: 'MQTT Input',
				status: 'fresh',
				value: 42
			};
			this.addOutput('value', SLOT_TYPES.NUMBER, valueSlot());
			this.addOutput('fresh', SLOT_TYPES.NUMBER, valueSlot({ label: 'Fresh' }));
			this.addOutput('age_sec', SLOT_TYPES.NUMBER, valueSlot({ label: 'Age (s)' }));
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			const props = this.properties;
			this.title = readString(props, 'mqtt_id', 'MQTT Input');
			drawNodeBodyText(
				ctx,
				this,
				[
					`Input: ${preview(readString(props, 'mqtt_id', 'demo_input'), 32)}`,
					`Value: ${formatMetric(readNumber(props, 'fresh', 1) >= 0.5 ? readNumber(props, 'value', 42) : null, '%')}`,
					`Fresh: ${formatFreshValue(readNumber(props, 'fresh', 1))} | age: ${formatMetric(readNumber(props, 'age_sec', 3), 's')}`,
					`Status: ${readNumber(props, 'fresh', 1) >= 0.5 ? 'fresh' : 'stale'}`
				],
				{
					bottomPadding: 16,
					leftPadding: 18,
					lineHeight: 16,
					maxLines: 5,
					outputGutter: 64,
					topPadding: 38
				}
			);
		};

		onExecute = () => {
			const p = this.properties;
			const fresh = readNumber(p, 'fresh', 1) >= 0.5;
			this.setOutputData(0, fresh ? readNumber(p, 'value', 42) : NaN);
			this.setOutputData(1, fresh ? 1 : 0);
			this.setOutputData(2, readNumber(p, 'age_sec', 3));
		};
	}

	class NumberInputNode extends NodeBase {
		private previousY: number | null = null;
		constructor() {
			super();
			this.title = 'Number';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Input/Number');
			this.properties = { max: 100, min: 0, precision: 2, value: 50 };
			this.addOutput(SLOT_LABELS.VALUE, SLOT_TYPES.NUMBER, valueSlot({ label: '' }));
		}
		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			if (this.flags?.collapsed) return;
			const size = this.size ?? KNOB_SIZE;
			const value = readGaugeValue(this.properties);
			const ratio = gaugeRatio(this.properties);
			const color = gaugeColor(ratio);
			const theme = resolveNodeflowCanvasTheme();
			const cx = size[0] / 2,
				cy = size[1] / 2 + 5;
			const radius = Math.min(...size) * 0.38,
				inner = radius - 6;
			const start = Math.PI * 0.75,
				end = start + Math.PI * 1.5;
			const ring = (angle: number, fill: string) => {
				ctx.beginPath();
				ctx.arc(cx, cy, radius, start, angle);
				ctx.arc(cx, cy, inner, angle, start, true);
				ctx.closePath();
				ctx.fillStyle = fill;
				ctx.fill();
			};
			ctx.save();
			ring(end, theme.widgetBackgroundColor);
			if (ratio > 0.001) {
				ctx.shadowColor = color;
				ctx.shadowBlur = 10;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;
				ring(start + Math.PI * 1.5 * ratio, color);
				ctx.shadowColor = 'transparent';
				ctx.shadowBlur = 0;
			}
			ctx.beginPath();
			ctx.arc(cx, cy, inner - 4, 0, Math.PI * 2);
			ctx.fillStyle = theme.nodeBackgroundColor;
			ctx.fill();
			ctx.fillStyle = theme.widgetTextColor;
			ctx.font =
				'300 ' +
				Math.min(36, Math.floor(radius * 0.55)) +
				'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(value === null ? '—' : String(value), cx, cy, Math.max(24, (inner - 8) * 2));
			if (this.mouseOver) {
				ctx.fillStyle = theme.widgetSecondaryTextColor;
				ctx.font =
					'300 ' +
					Math.min(15, Math.floor(radius * 0.2)) +
					'px -apple-system, BlinkMacSystemFont, sans-serif';
				ctx.fillText('drag ↕', cx, cy + radius * 0.45);
			}
			ctx.restore();
		};
		onMouseDown = (event: { button: number; canvasX: number; canvasY: number }) => {
			if (event.button !== 0 || !this.pos || readGaugeValue(this.properties) === null) return false;
			const size = this.size ?? KNOB_SIZE;
			const x = event.canvasX - this.pos[0],
				y = event.canvasY - this.pos[1];
			if (
				y < 20 ||
				Math.hypot(x - size[0] / 2, y - size[1] / 2 - 5) > Math.min(...size) * 0.38 + 10
			)
				return false;
			this.previousY = event.canvasY;
			this.captureInput?.(true);
			return true;
		};
		onMouseMove = (event: { buttons?: number; canvasY: number }) => {
			if (this.previousY === null) return;
			if (event.buttons === 0) {
				this.onMouseUp();
				return;
			}
			const p = this.properties;
			if (!p || typeof p.min !== 'number' || typeof p.max !== 'number') return;
			const ratio = Math.max(
				0,
				Math.min(1, gaugeRatio(p) - (event.canvasY - this.previousY) * 0.01)
			);
			const value = readGaugeValue({ ...p, value: p.min + (p.max - p.min) * ratio });
			this.previousY = event.canvasY;
			if (value === null) return;
			p.value = value;
			this.onExecute();
			this.setDirtyCanvas?.(true, true);
		};
		onMouseUp = () => {
			this.previousY = null;
			this.captureInput?.(false);
		};
		onExecute = () => this.setOutputData(0, readGaugeValue(this.properties));
	}

	class TimeSourceNode extends NodeBase {
		constructor() {
			super();
			this.title = 'Time';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Sensor/DS3231');
			this.properties = { source: 'DS3231/NTP', time: '12:00:00' };
			this.addOutput('time', SLOT_TYPES.TIME, timeSlot());
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			const props = this.properties;
			drawNodeBodyText(
				ctx,
				this,
				[
					`Time: ${readString(props, 'time', '12:00:00')}`,
					`Source: ${readString(props, 'source', 'DS3231/NTP')}`
				],
				{
					lineHeight: 18,
					maxLines: 2,
					outputGutter: 72,
					topPadding: 42,
					verticalAlign: 'center'
				}
			);
		};

		onExecute = () => {
			this.setOutputData(
				0,
				demoTimeSignal(this.properties?.time, this.properties?.available !== false)
			);
		};
	}

	class TimeFilterNode extends NodeBase {
		constructor() {
			super();
			this.title = 'Time Filter';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Processing/Time Filter');
			this.properties = { fromHour: 8, fromMinute: 0, result: true, toHour: 22, toMinute: 0 };
			this.addInput(SLOT_LABELS.TIME_IN, SLOT_TYPES.TIME, timeSlot());
			this.addOutput(SLOT_LABELS.TIME_OK, SLOT_TYPES.TIME, timeSlot());
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			ctx.save();
			ctx.font = NODEFLOW_FONTS.MAIN;
			ctx.fillStyle = NODEFLOW_COLORS.TEXT;
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'center';
			ctx.fillText(
				timeWindowFromProperties(this.properties) +
					(this.properties?.result === true ? ' | ON' : ' | OFF'),
				(this.size?.[0] ?? 280) / 2,
				(this.size?.[1] ?? 140) / 2
			);
			ctx.restore();
		};

		onExecute = () => {
			const p = this.properties ?? (this.properties = {});
			const result = demoFilterSignal(this.getInputData(0), p);
			p.result = result.bool;
			this.setOutputData(0, result);
		};
	}

	const compareOperators = ['<', '<=', '==', '!=', '>=', '>'] as const;
	function compareButtons(size: Vec2) {
		const width = 30,
			height = 24,
			gap = 4;
		const left =
			(size[0] - compareOperators.length * width - (compareOperators.length - 1) * gap) / 2;
		return compareOperators.map((operator, i) => ({
			operator,
			x: left + i * (width + gap),
			y: size[1] - 10 - height,
			w: width,
			h: height
		}));
	}
	class CompareNode extends NodeBase {
		constructor() {
			super();
			this.title = 'Compare';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Processing/Compare');
			this.properties = { operator: '>=', threshold: 50, valueLabel: 'value' };
			this.addInput(SLOT_LABELS.VALUE, SLOT_TYPES.NUMBER, valueSlot());
			this.addInput(SLOT_LABELS.COMPARE_TO, SLOT_TYPES.NUMBER, valueSlot());
			this.addOutput(SLOT_LABELS.CONDITION, SLOT_TYPES.BOOLEAN, conditionSlot());
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			const props = this.properties;
			const operator = readString(props, 'operator', '>');
			this.title = `${typeof props?.value === 'number' && Number.isFinite(props.value) ? formatFixed(props.value, 2) : '?'} ${operator} ${typeof props?.threshold === 'number' && Number.isFinite(props.threshold) ? formatFixed(props.threshold, 2) : '?'}`;
			if (this.flags?.collapsed) return;
			const size = this.size ?? METRIC_CARD_DEFAULT_SIZE;
			const theme = resolveNodeflowCanvasTheme();
			ctx.save();
			ctx.font = '600 14px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = props?.result === true ? NODEFLOW_COLORS.SUCCESS : NODEFLOW_COLORS.TEXT;
			ctx.fillText(props?.result === true ? 'TRUE' : 'FALSE', size[0] / 2, 62);
			for (const b of compareButtons(size)) {
				drawRoundedRect(ctx, b.x, b.y, b.w, b.h, 4);
				ctx.fillStyle = theme.widgetBackgroundColor;
				ctx.fill();
				ctx.strokeStyle =
					b.operator === operator ? theme.widgetTextColor : theme.widgetOutlineColor;
				ctx.lineWidth = b.operator === operator ? 2 : 1;
				ctx.stroke();
				ctx.fillStyle = theme.widgetTextColor;
				ctx.font = '700 12px monospace';
				ctx.fillText(b.operator, b.x + b.w / 2, b.y + b.h / 2);
			}
			ctx.restore();
		};

		onMouseDown = (event: { button: number }, local: unknown) => {
			if (event.button !== 0 || this.flags?.collapsed || !Array.isArray(local)) return false;
			const [x, y] = local;
			const b = compareButtons(this.size ?? METRIC_CARD_DEFAULT_SIZE).find(
				(b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
			);
			if (!b || !this.properties) return false;
			this.properties.operator = b.operator;
			this.onExecute();
			this.setDirtyCanvas?.(true, true);
			return true;
		};

		onExecute = () => {
			const p = this.properties ?? (this.properties = {});
			const a = this.getInputData(0),
				b = this.getInputData(1);
			p.value = a;
			p.threshold = b;
			p.result = compareDemoValues(a, b, readString(p, 'operator', '>='));
			this.setOutputData(0, p.result);
		};
	}

	class HysteresisNode extends NodeBase {
		constructor() {
			super();
			this.title = 'Hysteresis';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Processing/Hysteresis');
			this.properties = { off: 24.5, on: 27.2, state: false, value: 25.6 };
			this.addInput(SLOT_LABELS.VALUE, SLOT_TYPES.NUMBER, valueSlot());
			this.addInput('ON threshold', SLOT_TYPES.NUMBER, valueSlot());
			this.addInput('OFF threshold', SLOT_TYPES.NUMBER, valueSlot());
			this.addOutput(SLOT_LABELS.CONDITION, SLOT_TYPES.BOOLEAN, conditionSlot());
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			const props = this.properties;
			const value = typeof props?.value === 'number' ? props.value : NaN;
			const onThreshold = typeof props?.on === 'number' ? props.on : NaN;
			const offThreshold = typeof props?.off === 'number' ? props.off : NaN;
			const evaluation = evaluateHysteresis(
				value,
				onThreshold,
				offThreshold,
				readBoolean(props, 'state', false)
			);
			drawHysteresisBand(ctx, this, value, onThreshold, offThreshold, evaluation);
		};

		onExecute = () => {
			const props = this.properties ?? (this.properties = {});
			const numberInput = (slot: number) => {
				const value = this.getInputData(slot);
				return typeof value === 'number' ? value : NaN;
			};
			const value = numberInput(0);
			const onThreshold = numberInput(1);
			const offThreshold = numberInput(2);
			const evaluation = evaluateHysteresis(
				value,
				onThreshold,
				offThreshold,
				readBoolean(props, 'state', false)
			);
			props.value = value;
			props.on = onThreshold;
			props.off = offThreshold;
			props.state = evaluation.valid && evaluation.state;
			this.setOutputData(0, evaluation.valid ? evaluation.state : false);
		};
	}

	class ShellyPlugNode extends NodeBase {
		constructor() {
			super();
			this.title = 'Shelly Plug';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Devices/Shelly Plug');
			this.properties = {
				client_id: 'shelly-fan',
				mode: 'and',
				action_mode: 'auto',
				out: 'shelly',
				label: 'shelly',
				power: 18.4,
				status: 'ON',
				voltage: 230
			};
			this.addInput(SLOT_LABELS.TIME_OK, SLOT_TYPES.TIME, timeSlot());
			this.addInput(SLOT_LABELS.CONDITION, SLOT_TYPES.BOOLEAN, conditionSlot());
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			const props = this.properties;
			this.title = readString(props, 'label', 'shelly');
			drawActionCardLines(
				ctx,
				this,
				[
					`State: ${readString(props, 'status', 'OFF')}`,
					`P: ${formatActionMetric(props?.active === true ? readNumber(props, 'power', 18.4) : 0, 1, 'W')}  V: ${formatActionMetric(readNumber(props, 'voltage', 230), 0, 'V')}`,
					`CID: ${readString(props, 'client_id', 'shelly')}`,
					props?.active === true ? 'Simulated ON' : 'Simulated OFF'
				],
				{ bottomPadding: 46, lineHeight: 14, maxLines: 4, topPadding: 38 }
			);
			drawActionButtons(ctx, this);
		};

		onExecute = () => {
			const p = this.properties ?? (this.properties = {});
			p.active = demoOutputActive(this.getInputData(0), this.getInputData(1));
			p.status = p.active ? 'ON' : 'OFF';
		};
	}

	class RFSocketNode extends NodeBase {
		constructor() {
			super();
			this.title = '433MHz Socket';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Devices/433MHz Socket');
			this.properties = {
				device_id: 'demo_socket',
				label: 'socket',
				mode: 'and',
				action_mode: 'auto'
			};
			this.addInput(SLOT_LABELS.TIME_OK, SLOT_TYPES.TIME, timeSlot());
			this.addInput(SLOT_LABELS.CONDITION, SLOT_TYPES.BOOLEAN, conditionSlot());
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			const props = this.properties;
			this.title = readString(props, 'label', 'socket');
			drawActionCardLines(
				ctx,
				this,
				[
					`Label: ${readString(props, 'label', 'socket')}`,
					`Device: ${readString(props, 'device_id', 'not selected')}`,
					props?.active === true ? 'Rule match: TRUE' : 'Rule match: FALSE'
				],
				{ bottomPadding: 46, lineHeight: 16, maxLines: 4 }
			);
			drawActionButtons(ctx, this);
		};

		onExecute = () => {
			const p = this.properties ?? (this.properties = {});
			p.active = demoOutputActive(this.getInputData(0), this.getInputData(1));
			p.status = p.active ? 'ON' : 'OFF';
		};
	}

	class TelegramNotificationNode extends NodeBase {
		constructor() {
			super();
			this.title = 'Telegram Notification';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Devices/Telegram Notification');
			this.properties = {
				edge: 'both',
				label: 'telegram',
				message: 'GrowClip alert',
				mode: 'and',
				action_mode: 'auto',
				out: 'telegram'
			};
			this.addInput(SLOT_LABELS.TIME_OK, SLOT_TYPES.TIME, timeSlot());
			this.addInput(SLOT_LABELS.CONDITION, SLOT_TYPES.BOOLEAN, conditionSlot());
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			const props = this.properties;
			this.title = readString(props, 'label', 'telegram');
			const message = readString(props, 'message', 'GrowClip alert');
			drawActionCardLines(
				ctx,
				this,
				[
					`Label: ${readString(props, 'label', 'telegram')}`,
					`Message: ${message.length > 30 ? `${message.slice(0, 27)}...` : message}`,
					props?.active === true ? 'Rule match: TRUE' : 'Rule match: FALSE'
				],
				{ lineHeight: 16, maxLines: 5 }
			);
		};

		onExecute = () => {
			const p = this.properties ?? (this.properties = {});
			p.active = demoOutputActive(this.getInputData(0), this.getInputData(1));
			p.status = p.active ? 'ON' : 'OFF';
		};
	}

	class MqttPublishNode extends NodeBase {
		constructor() {
			super();
			this.title = 'MQTT Publish';
			this.size = NODEFLOW_STYLE.getDefaultSizeForType('Devices/MQTT Publish');
			this.properties = {
				mqtt_id: 'demo_output',
				label: 'publish',
				mode: 'and',
				action_mode: 'auto',
				out: 'mqtt',
				activation: 'high'
			};
			this.addInput(SLOT_LABELS.TIME_OK, SLOT_TYPES.TIME, timeSlot());
			this.addInput(SLOT_LABELS.CONDITION, SLOT_TYPES.BOOLEAN, conditionSlot());
		}

		onDrawForeground = (ctx: CanvasRenderingContext2D) => {
			const props = this.properties;
			drawActionCardLines(
				ctx,
				this,
				[
					`Output: ${preview(readString(props, 'mqtt_id', 'demo_output'), 32)}`,
					'Payload: owned by MQTT catalog',
					props?.active === true ? 'Rule match: TRUE' : 'Rule match: FALSE'
				],
				{ bottomPadding: 46, lineHeight: 16, maxLines: 4, topPadding: 36 }
			);
			drawMqttPublishButtons(ctx, this);
		};

		onExecute = () => {
			const p = this.properties ?? (this.properties = {});
			p.active = demoOutputActive(this.getInputData(0), this.getInputData(1));
			p.status = p.active ? 'ON' : 'OFF';
		};
	}

	liteGraph.registerNodeType('Sensor/SCD41', SCD41InputNode);
	liteGraph.registerNodeType('Sensor/BLE Sensor', BleSensorNode);
	liteGraph.registerNodeType('Sensor/MQTT Input', MqttInputNode);
	liteGraph.registerNodeType('Sensor/DS3231', TimeSourceNode);
	liteGraph.registerNodeType('Input/Number', NumberInputNode);
	liteGraph.registerNodeType('Processing/Time Filter', TimeFilterNode);
	liteGraph.registerNodeType('Processing/Compare', CompareNode);
	liteGraph.registerNodeType('Processing/Hysteresis', HysteresisNode);
	liteGraph.registerNodeType('Devices/Shelly Plug', ShellyPlugNode);
	liteGraph.registerNodeType('Devices/433MHz Socket', RFSocketNode);
	liteGraph.registerNodeType('Devices/Telegram Notification', TelegramNotificationNode);
	liteGraph.registerNodeType('Devices/MQTT Publish', MqttPublishNode);

	win.__growclipMarketingNodesRegistered = true;
}

export class LiteGraphDemoController {
	private activeExample: DemoExampleId;
	private canvas: LiteGraphCanvas | null = null;
	private graph: LiteGraphGraph | null = null;
	private groups: LiteGraphGroup[] = [];
	private nodes: LiteGraphNode[] = [];
	private readonly target: HTMLCanvasElement;

	constructor(target: HTMLCanvasElement, initialExample: DemoExampleId = DEFAULT_EXAMPLE) {
		this.target = target;
		this.activeExample = initialExample;
	}

	destroy() {
		this.graph?.stop();
		this.canvas?.stopRendering?.();
		this.canvas?.unbindEvents?.();
		this.canvas?.setGraph?.(null);
		this.graph = null;
		this.canvas = null;
		this.groups = [];
		this.nodes = [];
	}

	applyTheme() {
		if (this.canvas) applyNodeflowCanvasTheme(this.canvas);
	}

	resize() {
		if (!this.canvas) {
			return;
		}
		this.canvas.resize();
		fitExampleToCanvas(this.target, this.canvas, this.nodes, this.groups);
		this.canvas.setDirty(true, true);
	}

	reset(exampleId: DemoExampleId = this.activeExample) {
		this.activeExample = exampleId;
		const win = window as LiteGraphWindow;
		const liteGraph = win.LiteGraph;
		if (!liteGraph || !win.LGraph || !win.LGraphCanvas) {
			throw new Error('LiteGraph runtime is not available');
		}

		registerMarketingNodes(liteGraph, win);
		installNodeflowStyle(win);
		installSoftWheelZoom(win, liteGraph);

		this.destroy();
		this.graph = new win.LGraph();
		this.canvas = new win.LGraphCanvas(this.target, this.graph);
		applyCanvasStyle(this.canvas, liteGraph);

		const example = DEMO_EXAMPLES[exampleId];
		const createdNodes = new Map<string, LiteGraphNode>();
		Object.entries(example.nodes).forEach(([id, spec]) => {
			createdNodes.set(id, this.createNode(liteGraph, spec));
		});
		this.nodes = Array.from(createdNodes.values());
		this.groups = this.createIpoGroups(win, this.nodes);
		example.connections.forEach((connection) => {
			const source = createdNodes.get(connection.from);
			const target = createdNodes.get(connection.to);
			if (!source || !target) throw new Error('Invalid demo connection endpoint');
			source.connect(connection.fromSlot, target, connection.toSlot);
		});

		this.canvas.resize();
		fitExampleToCanvas(this.target, this.canvas, this.nodes, this.groups);

		this.graph.start();
		this.resize();
	}

	setExample(exampleId: DemoExampleId) {
		this.reset(exampleId);
	}

	private createNode(liteGraph: LiteGraphNamespace, spec: DemoNodeSpec): LiteGraphNode {
		const node = liteGraph.createNode(spec.type);
		if (!node) {
			throw new Error(`LiteGraph node was not registered: ${spec.type}`);
		}
		node.pos = [spec.pos[0], spec.pos[1] + DEMO_GROUP_HEADER_SPACE];
		if (spec.title && spec.type !== 'Input/Number') {
			node.title = spec.title;
		}
		node.demoType = spec.type;
		node.size = NODEFLOW_STYLE.getDefaultSizeForType(spec.type);
		node.properties = {
			...(node.properties ?? {}),
			...(spec.properties ?? {})
		};
		this.graph?.add(node);
		return node;
	}

	private createIpoGroups(win: LiteGraphWindow, nodes: readonly LiteGraphNode[]): LiteGraphGroup[] {
		const GroupCtor = win.LiteGraph?.LGraphGroup ?? win.LGraphGroup;
		if (!GroupCtor || !this.graph || nodes.length === 0) {
			return [];
		}

		const minNodeY = Math.min(...nodes.map((node) => node.pos[1]));
		const maxNodeY = Math.max(...nodes.map((node) => node.pos[1] + getNodeSize(node)[1]));
		const maxNodeX = Math.max(...nodes.map((node) => node.pos[0] + getNodeSize(node)[0]));
		const groupY = Math.max(0, minNodeY - 82);
		const groupHeight = Math.max(430, maxNodeY - groupY + 42);
		const specs: DemoGroupSpec[] = [
			{
				title: 'Input',
				note: 'Sensors, constants\nand time source',
				pos: [8, groupY],
				size: [384, groupHeight],
				color: '#6483b0'
			},
			{
				title: 'Processing',
				note: 'Compare, hysteresis\nand time gates',
				pos: [410, groupY],
				size: [380, groupHeight],
				color: '#528b75'
			},
			{
				title: 'Output',
				note: 'Actuator or\nnotification',
				pos: [810, groupY],
				size: [Math.max(330, maxNodeX - 810 + 34), groupHeight],
				color: '#a58b60'
			}
		];

		return specs.map((spec) => {
			const group = new GroupCtor(spec.title);
			group.title = spec.title;
			group.pos = spec.pos;
			group.size = spec.size;
			group.color = spec.color;
			group.font_size = 19;
			group.note = '';
			group.note_font_size = 12;
			this.graph?.add(group);
			return group;
		});
	}
}

// Public visual-only adapter pinned to GrowClip 64dc7713b0b360d5d56e04b36533a33285e4b688.
// No product runtime, network or device code.
const DEFAULT_NODEFLOW_COLORS = {
	TEXT: '#e8eaed',
	SUCCESS: '#2ecc71',
	ERROR: '#e74c3c',
	WARNING: '#f39c12',
	NEUTRAL: '#95a5a6'
} as const;

export type NodeflowColors = Record<keyof typeof DEFAULT_NODEFLOW_COLORS, string>;

export type NodeflowCanvasTheme = {
	backgroundColor: string;
	nodeTitleColor: string;
	nodeSelectedTitleColor: string;
	nodeTextColor: string;
	nodeColor: string;
	nodeBackgroundColor: string;
	nodeBoxColor: string;
	nodeOutlineColor: string;
	widgetBackgroundColor: string;
	widgetOutlineColor: string;
	widgetTextColor: string;
	widgetSecondaryTextColor: string;
	linkColor: string;
	eventLinkColor: string;
	connectingLinkColor: string;
	slotOffColor: string;
	slotOnColor: string;
	nodeModeColors: string[];
	colors: NodeflowColors;
};

type ThemeSource = Document | Element | null | undefined;
type ScalarCanvasThemeKey = Exclude<keyof NodeflowCanvasTheme, 'colors' | 'nodeModeColors'>;

type LiteGraphThemeTarget = {
	NODE_TITLE_COLOR?: string;
	NODE_SELECTED_TITLE_COLOR?: string;
	NODE_TEXT_COLOR?: string;
	NODE_DEFAULT_COLOR?: string;
	NODE_DEFAULT_BGCOLOR?: string;
	NODE_DEFAULT_BOXCOLOR?: string;
	NODE_BOX_OUTLINE_COLOR?: string;
	WIDGET_BGCOLOR?: string;
	WIDGET_OUTLINE_COLOR?: string;
	WIDGET_TEXT_COLOR?: string;
	WIDGET_SECONDARY_TEXT_COLOR?: string;
	LINK_COLOR?: string;
	EVENT_LINK_COLOR?: string;
	CONNECTING_LINK_COLOR?: string;
	NODE_MODES_COLORS?: string[];
};

type CanvasThemeTarget = {
	clear_background_color?: string;
	node_title_color?: string;
	default_link_color?: string;
	default_connection_color?: {
		input_off?: string;
		input_on?: string;
		output_off?: string;
		output_on?: string;
	};
	setDirty?: (foreground: boolean, background: boolean) => void;
};

type NodeflowThemeWindow = Window & {
	LiteGraph?: LiteGraphThemeTarget;
	NodeflowStyle?: { COLORS?: NodeflowColors };
	MutationObserver?: typeof MutationObserver;
};

export const NODEFLOW_COLORS: NodeflowColors = { ...DEFAULT_NODEFLOW_COLORS };

export const DEFAULT_NODEFLOW_CANVAS_THEME: NodeflowCanvasTheme = {
	backgroundColor: '#222',
	nodeTitleColor: '#999',
	nodeSelectedTitleColor: '#fff',
	nodeTextColor: DEFAULT_NODEFLOW_COLORS.TEXT,
	nodeColor: '#333',
	nodeBackgroundColor: '#353535',
	nodeBoxColor: '#666',
	nodeOutlineColor: '#fff',
	widgetBackgroundColor: '#222',
	widgetOutlineColor: '#666',
	widgetTextColor: '#ddd',
	widgetSecondaryTextColor: '#999',
	linkColor: '#9a9',
	eventLinkColor: '#a86',
	connectingLinkColor: '#afa',
	slotOffColor: '#778',
	slotOnColor: '#7f7',
	nodeModeColors: ['#666', '#422', '#333', '#224', '#626'],
	colors: { ...DEFAULT_NODEFLOW_COLORS }
};

const SCALAR_CSS_VARS: Record<ScalarCanvasThemeKey, string> = {
	backgroundColor: '--nf-canvas-background',
	nodeTitleColor: '--nf-canvas-node-title',
	nodeSelectedTitleColor: '--nf-canvas-node-title-selected',
	nodeTextColor: '--nf-canvas-node-text',
	nodeColor: '--nf-canvas-node',
	nodeBackgroundColor: '--nf-canvas-node-body',
	nodeBoxColor: '--nf-canvas-node-box',
	nodeOutlineColor: '--nf-canvas-node-outline',
	widgetBackgroundColor: '--nf-canvas-widget-bg',
	widgetOutlineColor: '--nf-canvas-widget-outline',
	widgetTextColor: '--nf-canvas-widget-text',
	widgetSecondaryTextColor: '--nf-canvas-widget-secondary-text',
	linkColor: '--nf-canvas-link',
	eventLinkColor: '--nf-canvas-event-link',
	connectingLinkColor: '--nf-canvas-connecting-link',
	slotOffColor: '--nf-canvas-slot-off',
	slotOnColor: '--nf-canvas-slot-on'
};

const STATUS_CSS_VARS: Record<keyof NodeflowColors, string> = {
	TEXT: SCALAR_CSS_VARS.nodeTextColor,
	SUCCESS: '--nf-canvas-success',
	ERROR: '--nf-canvas-error',
	WARNING: '--nf-canvas-warning',
	NEUTRAL: '--nf-canvas-neutral'
};

const NODE_MODE_CSS_VARS = [
	'--nf-canvas-mode-always',
	'--nf-canvas-mode-event',
	'--nf-canvas-mode-never',
	'--nf-canvas-mode-trigger',
	'--nf-canvas-mode-request'
] as const;

function isDocumentLike(source: ThemeSource): source is Document {
	return Boolean(source && 'documentElement' in source);
}

function resolveThemeElement(source?: ThemeSource): Element | null {
	if (isDocumentLike(source)) {
		return source.documentElement;
	}
	if (source) {
		return source;
	}
	return typeof document === 'undefined' ? null : document.documentElement;
}

function resolveWindow(element: Element | null): NodeflowThemeWindow | null {
	if (element?.ownerDocument?.defaultView) {
		return element.ownerDocument.defaultView as NodeflowThemeWindow;
	}
	return typeof window === 'undefined' ? null : (window as NodeflowThemeWindow);
}

function readStyles(element: Element | null): CSSStyleDeclaration | null {
	const targetWindow = resolveWindow(element);
	if (element && typeof targetWindow?.getComputedStyle === 'function') {
		return targetWindow.getComputedStyle(element);
	}
	if (element && typeof getComputedStyle === 'function') {
		return getComputedStyle(element);
	}
	return null;
}

function readCssVar(styles: CSSStyleDeclaration | null, name: string, fallback: string): string {
	const value = styles?.getPropertyValue(name)?.trim();
	return value || fallback;
}

export function resolveNodeflowCanvasTheme(source?: ThemeSource): NodeflowCanvasTheme {
	const styles = readStyles(resolveThemeElement(source));
	const theme: NodeflowCanvasTheme = {
		...DEFAULT_NODEFLOW_CANVAS_THEME,
		nodeModeColors: [...DEFAULT_NODEFLOW_CANVAS_THEME.nodeModeColors],
		colors: { ...DEFAULT_NODEFLOW_COLORS }
	};

	for (const [key, variable] of Object.entries(SCALAR_CSS_VARS) as Array<
		[ScalarCanvasThemeKey, string]
	>) {
		theme[key] = readCssVar(styles, variable, theme[key]);
	}

	for (const [key, variable] of Object.entries(STATUS_CSS_VARS) as Array<
		[keyof NodeflowColors, string]
	>) {
		theme.colors[key] = readCssVar(styles, variable, theme.colors[key]);
	}

	theme.nodeTextColor = theme.colors.TEXT;
	theme.nodeModeColors = NODE_MODE_CSS_VARS.map((variable, index) =>
		readCssVar(styles, variable, DEFAULT_NODEFLOW_CANVAS_THEME.nodeModeColors[index])
	);
	return theme;
}

function applyLiteGraphTheme(
	liteGraph: LiteGraphThemeTarget | undefined,
	theme: NodeflowCanvasTheme
) {
	if (!liteGraph) return;

	liteGraph.NODE_TITLE_COLOR = theme.nodeTitleColor;
	liteGraph.NODE_SELECTED_TITLE_COLOR = theme.nodeSelectedTitleColor;
	liteGraph.NODE_TEXT_COLOR = theme.nodeTextColor;
	liteGraph.NODE_DEFAULT_COLOR = theme.nodeColor;
	liteGraph.NODE_DEFAULT_BGCOLOR = theme.nodeBackgroundColor;
	liteGraph.NODE_DEFAULT_BOXCOLOR = theme.nodeBoxColor;
	liteGraph.NODE_BOX_OUTLINE_COLOR = theme.nodeOutlineColor;
	liteGraph.WIDGET_BGCOLOR = theme.widgetBackgroundColor;
	liteGraph.WIDGET_OUTLINE_COLOR = theme.widgetOutlineColor;
	liteGraph.WIDGET_TEXT_COLOR = theme.widgetTextColor;
	liteGraph.WIDGET_SECONDARY_TEXT_COLOR = theme.widgetSecondaryTextColor;
	liteGraph.LINK_COLOR = theme.linkColor;
	liteGraph.EVENT_LINK_COLOR = theme.eventLinkColor;
	liteGraph.CONNECTING_LINK_COLOR = theme.connectingLinkColor;
	liteGraph.NODE_MODES_COLORS = [...theme.nodeModeColors];
}

function applyCanvasTheme(canvasArg: unknown, theme: NodeflowCanvasTheme) {
	if (!canvasArg || typeof canvasArg !== 'object') return;

	const canvas = canvasArg as CanvasThemeTarget;
	canvas.clear_background_color = theme.backgroundColor;
	canvas.node_title_color = theme.nodeTitleColor;
	canvas.default_link_color = theme.linkColor;
	canvas.default_connection_color = {
		...(canvas.default_connection_color ?? {}),
		input_off: theme.slotOffColor,
		input_on: theme.slotOnColor,
		output_off: theme.slotOffColor,
		output_on: theme.slotOnColor
	};
	canvas.setDirty?.(true, true);
}

function applySharedNodeflowColors(
	targetWindow: NodeflowThemeWindow | null,
	theme: NodeflowCanvasTheme
) {
	Object.assign(NODEFLOW_COLORS, theme.colors);
	if (targetWindow?.NodeflowStyle) {
		targetWindow.NodeflowStyle.COLORS = NODEFLOW_COLORS;
	}
}

export function applyNodeflowCanvasTheme(
	canvasArg?: unknown,
	options: { source?: ThemeSource; targetWindow?: NodeflowThemeWindow | null } = {}
): NodeflowCanvasTheme {
	const sourceElement = resolveThemeElement(options.source);
	const targetWindow = options.targetWindow ?? resolveWindow(sourceElement);
	const theme = resolveNodeflowCanvasTheme(sourceElement);

	applySharedNodeflowColors(targetWindow, theme);
	applyLiteGraphTheme(targetWindow?.LiteGraph, theme);
	applyCanvasTheme(canvasArg, theme);
	return theme;
}

export function installNodeflowCanvasTheme(
	canvasArg: unknown,
	options: { source?: ThemeSource; targetWindow?: NodeflowThemeWindow | null } = {}
): () => void {
	const sourceElement = resolveThemeElement(options.source);
	const targetWindow = options.targetWindow ?? resolveWindow(sourceElement);
	const Observer =
		targetWindow?.MutationObserver ??
		(typeof MutationObserver !== 'undefined' ? MutationObserver : undefined);

	let cancelScheduledApply: (() => void) | null = null;
	const apply = () => applyNodeflowCanvasTheme(canvasArg, { source: sourceElement, targetWindow });
	const scheduleApply = () => {
		if (cancelScheduledApply) return;

		if (typeof targetWindow?.requestAnimationFrame === 'function') {
			const frame = targetWindow.requestAnimationFrame(() => {
				cancelScheduledApply = null;
				apply();
			});
			cancelScheduledApply = () => targetWindow.cancelAnimationFrame?.(frame);
			return;
		}

		const timeout = setTimeout(() => {
			cancelScheduledApply = null;
			apply();
		}, 0);
		cancelScheduledApply = () => clearTimeout(timeout);
	};

	apply();

	if (!sourceElement || !Observer) {
		return () => cancelScheduledApply?.();
	}

	const observer = new Observer(scheduleApply);
	observer.observe(sourceElement, {
		attributes: true,
		attributeFilter: ['data-theme', 'class', 'style']
	});

	return () => {
		cancelScheduledApply?.();
		observer.disconnect();
	};
}

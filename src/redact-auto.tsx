"use client";

import {
	createElement,
	type ElementType,
	type ReactElement,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { RedactContext } from "./context.js";
import { applyBlurStyle } from "./modes/blur.js";
import { getMaskStyle, maskValue } from "./modes/mask.js";
import { replaceValue } from "./modes/replace.js";
import type { BuiltInPatternName } from "./patterns/index.js";
import { cancelScheduledScan, scanRoot, scheduleScan } from "./scanner.js";

const DEFAULT_PATTERNS: BuiltInPatternName[] = ["email", "phone", "ssn", "credit-card", "ip"];
const DEFAULT_CUSTOM_PATTERNS: RegExp[] = [];

export interface RedactAutoProps {
	children: React.ReactNode;
	patterns?: BuiltInPatternName[];
	customPatterns?: RegExp[];
	/** Overrides the provider's default blur radius (px) for auto-detected spans. */
	blurRadius?: number;
	/** Overrides the provider's default mask character for auto-detected spans. */
	maskChar?: string;
	/**
	 * Element type used for the scanning wrapper. Defaults to "div", which can break
	 * flex/grid layouts when RedactAuto is placed inside one. Use e.g. "span" or
	 * "section" to match the surrounding layout.
	 */
	as?: ElementType;
}

function restoreAutoRedactions(root: HTMLElement): void {
	const nodes = root.querySelectorAll<HTMLElement>("[data-redact-auto]");
	for (const node of nodes) {
		const original = node.getAttribute("data-redact-original") ?? node.textContent ?? "";
		const parent = node.parentNode;
		if (!parent) continue;
		parent.replaceChild(document.createTextNode(original), node);
	}
	root.normalize();
}

/**
 * Scans children for PII and wraps matches in data-redact spans.
 * Uses MutationObserver + debounced scan when content changes.
 */
export function RedactAuto({
	children,
	patterns: patternNames = DEFAULT_PATTERNS,
	customPatterns = DEFAULT_CUSTOM_PATTERNS,
	blurRadius: propBlurRadius,
	maskChar: propMaskChar,
	as = "div",
}: RedactAutoProps): ReactElement {
	const rootRef = useRef<HTMLElement>(null);
	const ctx = useContext(RedactContext);
	const blurRadius = propBlurRadius ?? ctx?.blurRadius;
	const maskChar = propMaskChar ?? ctx?.maskChar;

	// Stable keys derived from the (possibly freshly-allocated-per-render) arrays so the
	// scan effect doesn't tear down and re-scan on every parent re-render.
	const patternsKey = useMemo(() => patternNames.join(","), [patternNames]);
	const customPatternsKey = useMemo(
		() => customPatterns.map((re) => `${re.source}//${re.flags}`).join("|"),
		[customPatterns],
	);

	const createSpan = useCallback(
		(text: string, hint?: string): HTMLSpanElement => {
			const span = document.createElement("span");
			span.setAttribute("data-redact", "");
			span.setAttribute("data-redact-auto", "");
			span.setAttribute("data-redact-original", text);
			if (hint) span.setAttribute("data-redact-hint", hint);
			span.setAttribute("aria-hidden", "true");
			const mode = ctx?.mode ?? "blur";

			if (mode === "blur") {
				span.textContent = text;
				applyBlurStyle(span, blurRadius);
			} else if (mode === "mask") {
				span.textContent = maskValue(text, maskChar);
				Object.assign(span.style, getMaskStyle(text));
				span.style.userSelect = "none";
			} else if (mode === "replace") {
				span.textContent = replaceValue(text, hint as Parameters<typeof replaceValue>[1]);
			} else {
				span.textContent = text;
				applyBlurStyle(span, blurRadius);
			}
			return span;
		},
		[ctx?.mode, blurRadius, maskChar],
	);

	// patternsKey/customPatternsKey are stable string proxies for patternNames/customPatterns —
	// depending on those (rather than the arrays themselves, which callers often pass as fresh
	// literals every render) avoids tearing down and re-scanning on every parent re-render.
	// biome-ignore lint/correctness/useExhaustiveDependencies: depending on patternsKey/customPatternsKey (stable) instead of patternNames/customPatterns (identity changes every render) is intentional — see comment above.
	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		// Make mode switches and disable transitions deterministic by reverting auto spans first.
		cancelScheduledScan(root);
		restoreAutoRedactions(root);
		if (!ctx?.enabled) return;

		const options = { patternNames, customPatterns };
		scanRoot(root, options, createSpan);

		const observer = new MutationObserver(() => {
			scheduleScan(root, options, createSpan);
		});
		observer.observe(root, { childList: true, subtree: true, characterData: true });

		return () => {
			observer.disconnect();
			cancelScheduledScan(root);
		};
	}, [ctx?.enabled, patternsKey, customPatternsKey, createSpan]);

	return createElement(as, { ref: rootRef }, children);
}

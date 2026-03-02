"use client";

import { type ReactElement, useCallback, useContext, useEffect, useRef } from "react";
import { RedactContext } from "./context.js";
import { getBlurProps } from "./modes/blur.js";
import { getMaskStyle, maskValue } from "./modes/mask.js";
import { replaceValue } from "./modes/replace.js";
import type { BuiltInPatternName } from "./patterns/index.js";
import { cancelScheduledScan, scanRoot, scheduleScan } from "./scanner.js";

export interface RedactAutoProps {
	children: React.ReactNode;
	patterns?: BuiltInPatternName[];
	customPatterns?: RegExp[];
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
	patterns: patternNames = ["email", "phone", "ssn", "credit-card", "ip"],
	customPatterns = [],
}: RedactAutoProps): ReactElement {
	const rootRef = useRef<HTMLDivElement>(null);
	const ctx = useContext(RedactContext);

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
				span.className = getBlurProps().className;
			} else if (mode === "mask") {
				span.textContent = maskValue(text);
				Object.assign(span.style, getMaskStyle(text));
				span.style.userSelect = "none";
			} else if (mode === "replace") {
				span.textContent = replaceValue(text, hint as Parameters<typeof replaceValue>[1]);
			} else {
				span.textContent = text;
				span.className = getBlurProps().className;
			}
			return span;
		},
		[ctx?.mode],
	);

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
	}, [ctx?.enabled, patternNames, customPatterns, createSpan]);

	return <div ref={rootRef}>{children}</div>;
}

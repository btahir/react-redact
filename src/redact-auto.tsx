"use client";

import { type ReactElement, useCallback, useContext, useEffect, useRef } from "react";
import { RedactContext } from "./context.js";
import { getBlurProps } from "./modes/blur.js";
import { getMaskStyle, maskValue } from "./modes/mask.js";
import { replaceValue } from "./modes/replace.js";
import type { BuiltInPatternName } from "./patterns/index.js";
import { scanRoot, scheduleScan } from "./scanner.js";

export interface RedactAutoProps {
	children: React.ReactNode;
	patterns?: BuiltInPatternName[];
	customPatterns?: RegExp[];
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
		if (!root || !ctx?.enabled) return;

		const options = { patternNames, customPatterns };
		scanRoot(root, options, createSpan);

		const observer = new MutationObserver(() => {
			scheduleScan(root, options, createSpan);
		});
		observer.observe(root, { childList: true, subtree: true, characterData: true });

		return () => observer.disconnect();
	}, [ctx?.enabled, patternNames, customPatterns, createSpan]);

	return <div ref={rootRef}>{children}</div>;
}

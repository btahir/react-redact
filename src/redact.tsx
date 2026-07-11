"use client";

import { type ReactElement, useContext, useRef } from "react";
import type { CustomRedactRender, RedactMode } from "./context.js";
import { RedactContext } from "./context.js";
import { getBlurProps } from "./modes/blur.js";
import { getMaskStyle, maskValue } from "./modes/mask.js";
import { fakeFor } from "./utils/fake-data.js";

export interface RedactProps {
	children: React.ReactNode;
	mode?: RedactMode;
	replacement?: string;
	/** When mode="custom", this render function is used. Overrides provider customRender. */
	renderRedacted?: CustomRedactRender;
	/** Overrides the provider's default blur radius (px) for this instance. */
	blurRadius?: number;
	/** Overrides the provider's default mask character for this instance. */
	maskChar?: string;
}

interface TextResult {
	text: string;
	/** True when a React element (or other non-text node) was encountered — text extraction is lossy. */
	hasElementChild: boolean;
}

function textContent(node: React.ReactNode): TextResult {
	if (typeof node === "string" || typeof node === "number") {
		return { text: String(node), hasElementChild: false };
	}
	if (Array.isArray(node)) {
		let text = "";
		let hasElementChild = false;
		for (const child of node) {
			const result = textContent(child);
			text += result.text;
			hasElementChild = hasElementChild || result.hasElementChild;
		}
		return { text, hasElementChild };
	}
	if (node === null || node === undefined || typeof node === "boolean") {
		return { text: "", hasElementChild: false };
	}
	// React element (or other non-primitive): we can't get text without rendering it.
	return { text: "", hasElementChild: true };
}

// Ambient, module-scoped fallback for environments without @types/node — avoids forcing
// consumers (or this package) to depend on Node types just to gate a dev-only warning.
declare const process: { env?: { NODE_ENV?: string } } | undefined;

// Checked at call time (not cached at module load) so bundlers that string-replace
// process.env.NODE_ENV per-occurrence can dead-code-eliminate this branch, and so it
// reflects the environment at the time <Redact> actually renders.
function isDev(): boolean {
	return typeof process !== "undefined" && process?.env?.NODE_ENV !== "production";
}

/**
 * Wraps content to be visually redacted when redact mode is enabled.
 */
export function Redact({
	children,
	mode: propMode,
	replacement,
	renderRedacted,
	blurRadius: propBlurRadius,
	maskChar: propMaskChar,
}: RedactProps): ReactElement {
	const ctx = useContext(RedactContext);
	const enabled = ctx?.enabled ?? false;
	const effectiveMode = propMode ?? ctx?.mode ?? "blur";
	const blurRadius = propBlurRadius ?? ctx?.blurRadius;
	const maskChar = propMaskChar ?? ctx?.maskChar;
	const warnedRef = useRef(false);

	if (!enabled) {
		return <>{children}</>;
	}

	const { text, hasElementChild } = textContent(children);

	if (
		isDev() &&
		hasElementChild &&
		(effectiveMode === "mask" || effectiveMode === "replace") &&
		!warnedRef.current
	) {
		warnedRef.current = true;
		console.warn(
			`[react-redact] <Redact mode="${effectiveMode}"> received non-text children (e.g. a React element). ` +
				"Mask/replace can only read plain text, so the fallback placeholder is shown instead of a real " +
				'length/value match. Pass a plain string, or use mode="blur" / mode="custom" for element children.',
		);
	}

	if (effectiveMode === "blur") {
		const props = getBlurProps(blurRadius);
		return (
			<span data-redact aria-hidden className={props.className} style={props.style}>
				{children}
			</span>
		);
	}

	if (effectiveMode === "mask") {
		const display = text ? maskValue(text, maskChar) : (maskChar ?? "•").repeat(3);
		const style = text ? getMaskStyle(text) : {};
		return (
			<span data-redact aria-hidden style={{ ...style, userSelect: "none" }}>
				{display}
			</span>
		);
	}

	if (effectiveMode === "replace") {
		const display = replacement ?? (text ? fakeFor(text) : "•••");
		return (
			<span data-redact aria-hidden>
				{display}
			</span>
		);
	}

	// custom: use renderRedacted, then provider customRender, then blur
	const customRenderer = renderRedacted ?? ctx?.customRender;
	if (customRenderer) {
		return <>{customRenderer({ children, text })}</>;
	}
	const props = getBlurProps(blurRadius);
	return (
		<span data-redact aria-hidden className={props.className} style={props.style}>
			{children}
		</span>
	);
}

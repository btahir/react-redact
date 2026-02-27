import { useContext } from "react";
import type { RedactMode } from "./context.js";
import { RedactContext } from "./context.js";
import { getBlurProps } from "./modes/blur.js";
import { getMaskStyle, maskValue } from "./modes/mask.js";
import { fakeFor } from "./utils/fake-data.js";

export interface RedactProps {
	children: React.ReactNode;
	mode?: RedactMode;
	replacement?: string;
}

function textContent(node: React.ReactNode): string {
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(textContent).join("");
	// React element: we can't get text without rendering; use replacement or default
	return "";
}

/**
 * Wraps content to be visually redacted when redact mode is enabled.
 */
export function Redact({ children, mode: propMode, replacement }: RedactProps) {
	const ctx = useContext(RedactContext);
	const enabled = ctx?.enabled ?? false;
	const effectiveMode = propMode ?? ctx?.mode ?? "blur";

	if (!enabled) {
		return <>{children}</>;
	}

	const text = textContent(children);

	if (effectiveMode === "blur") {
		const props = getBlurProps();
		return (
			<span data-redact aria-hidden className={props.className}>
				{children}
			</span>
		);
	}

	if (effectiveMode === "mask") {
		const display = text ? maskValue(text) : "•••";
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

	// custom or fallback: blur
	const props = getBlurProps();
	return (
		<span data-redact aria-hidden className={props.className}>
			{children}
		</span>
	);
}

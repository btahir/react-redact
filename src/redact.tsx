import { useContext } from "react";
import type { RedactMode } from "./context.js";
import { RedactContext } from "./context.js";

export interface RedactProps {
	children: React.ReactNode;
	mode?: RedactMode;
	replacement?: string;
}

/**
 * Wraps content to be visually redacted when redact mode is enabled.
 * Phase 1: blur mode only; mode/replacement respected in Phase 2.
 */
export function Redact({ children, mode: _mode }: RedactProps) {
	const ctx = useContext(RedactContext);
	const enabled = ctx?.enabled ?? false;
	const effectiveMode = ctx?.mode ?? "blur";

	if (!enabled) {
		return <>{children}</>;
	}

	// Phase 1: blur only
	if (effectiveMode === "blur") {
		return (
			<span
				className="react-redact-blur"
				data-redact
				aria-hidden="true"
				style={{ display: "inline" }}
			>
				{children}
			</span>
		);
	}

	// Placeholder for Phase 2 mask/replace (render as blur for now)
	return (
		<span
			className="react-redact-blur"
			data-redact
			aria-hidden="true"
			style={{ display: "inline" }}
		>
			{children}
		</span>
	);
}

import { useCallback, useContext } from "react";
import type { RedactMode } from "./context.js";
import { RedactContext } from "./context.js";

export function useRedactMode(): {
	isRedacted: boolean;
	mode: RedactMode;
	enable: () => void;
	disable: () => void;
	toggle: () => void;
	/** Whether a same-tab getDisplayMedia() capture is active (see RedactProvider's autoRedactOnScreenShare). */
	isScreenSharing: boolean;
} {
	const ctx = useContext(RedactContext);
	const enabled = ctx?.enabled ?? false;
	const mode = ctx?.mode ?? "blur";
	const setEnabled = ctx?.setEnabled;
	const isScreenSharing = ctx?.isScreenSharing ?? false;

	const enable = useCallback(() => setEnabled?.(true), [setEnabled]);
	const disable = useCallback(() => setEnabled?.(false), [setEnabled]);
	const toggle = useCallback(() => setEnabled?.((prev) => !prev), [setEnabled]);

	return {
		isRedacted: enabled,
		mode,
		enable,
		disable,
		toggle,
		isScreenSharing,
	};
}

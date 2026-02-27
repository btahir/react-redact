import { useCallback, useContext } from "react";
import { RedactContext } from "./context.js";

export function useRedactMode(): {
	isRedacted: boolean;
	enable: () => void;
	disable: () => void;
	toggle: () => void;
} {
	const ctx = useContext(RedactContext);
	const enabled = ctx?.enabled ?? false;
	const setEnabled = ctx?.setEnabled;

	const enable = useCallback(() => setEnabled?.(true), [setEnabled]);
	const disable = useCallback(() => setEnabled?.(false), [setEnabled]);
	const toggle = useCallback(() => setEnabled?.(!enabled), [setEnabled, enabled]);

	return {
		isRedacted: enabled,
		enable,
		disable,
		toggle,
	};
}

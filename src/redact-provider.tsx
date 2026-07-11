"use client";

import { type ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import type { CustomRedactRender, RedactMode } from "./context.js";
import { RedactContext } from "./context.js";
import { DEFAULT_BLUR_RADIUS } from "./modes/blur.js";
import { DEFAULT_MASK_CHAR } from "./modes/mask.js";
import type { BuiltInPatternName } from "./patterns/index.js";
import { addShortcutListener } from "./utils/keyboard.js";

export interface RedactProviderProps {
	children: React.ReactNode;
	mode?: RedactMode;
	shortcut?: string;
	/**
	 * Whether redaction is enabled.
	 *
	 * - **Uncontrolled (default):** omit this prop. The provider owns the state and
	 *   flips it via the keyboard shortcut, `useRedactMode()`, or a `?redact=true` URL param
	 *   you pass in yourself.
	 * - **Controlled:** pass `enabled` from your own state, mirroring a controlled `<input>`.
	 *   The provider still reacts to internal triggers (shortcut, `useRedactMode()`), but since
	 *   you own the value, feed those requests back via `onEnabledChange` to keep your state in sync.
	 */
	enabled?: boolean;
	/**
	 * Called whenever redaction is toggled by an internal trigger — the keyboard shortcut or
	 * `useRedactMode().enable/disable/toggle`. Not called when `enabled` changes purely because
	 * the parent updated the prop. Required for controlled usage; optional otherwise.
	 */
	onEnabledChange?: (enabled: boolean) => void;
	autoDetect?: false | BuiltInPatternName[];
	customPatterns?: RegExp[];
	/** Default custom renderer for <Redact mode="custom"> when renderRedacted is not set. */
	customRender?: CustomRedactRender;
	/** Default blur radius (px) for mode="blur". Overridable per <Redact>/<RedactAuto>. Default 6. */
	blurRadius?: number;
	/** Default mask character for mode="mask". Overridable per <Redact>/<RedactAuto>. Default "•". */
	maskChar?: string;
}

export function RedactProvider({
	children,
	mode = "blur",
	shortcut = "mod+shift+x",
	enabled: initialEnabled = false,
	onEnabledChange,
	autoDetect = false,
	customPatterns,
	customRender,
	blurRadius = DEFAULT_BLUR_RADIUS,
	maskChar = DEFAULT_MASK_CHAR,
}: RedactProviderProps): ReactElement {
	const [enabled, setEnabledState] = useState(initialEnabled);

	// Sync when parent controls enabled via prop (controlled mode). This does not
	// invoke onEnabledChange — that callback is reserved for internally-driven changes.
	useEffect(() => {
		setEnabledState(initialEnabled);
	}, [initialEnabled]);

	// Wrapped setter shared by the keyboard shortcut and useRedactMode(); notifies
	// onEnabledChange for every internally-driven change (not the prop-sync above).
	const setEnabled = useCallback(
		(value: boolean | ((prev: boolean) => boolean)) => {
			setEnabledState((prev) => {
				const next = typeof value === "function" ? (value as (p: boolean) => boolean)(prev) : value;
				if (next !== prev) onEnabledChange?.(next);
				return next;
			});
		},
		[onEnabledChange],
	);

	useEffect(() => {
		if (!shortcut) return;
		const remove = addShortcutListener(shortcut, () => setEnabled((e) => !e));
		return remove;
	}, [shortcut, setEnabled]);

	const value = useMemo<NonNullable<React.ContextType<typeof RedactContext>>>(
		() => ({
			enabled,
			mode,
			setEnabled,
			autoDetect: autoDetect || undefined,
			customPatterns,
			customRender,
			blurRadius,
			maskChar,
		}),
		[enabled, mode, setEnabled, autoDetect, customPatterns, customRender, blurRadius, maskChar],
	);

	return <RedactContext.Provider value={value}>{children}</RedactContext.Provider>;
}

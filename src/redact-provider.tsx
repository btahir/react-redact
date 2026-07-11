"use client";

import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CustomRedactRender, RedactMode } from "./context.js";
import { RedactContext } from "./context.js";
import { DEFAULT_BLUR_RADIUS } from "./modes/blur.js";
import { DEFAULT_MASK_CHAR } from "./modes/mask.js";
import type { BuiltInPatternName } from "./patterns/index.js";
import { addShortcutListener } from "./utils/keyboard.js";
import { watchScreenShare } from "./utils/screen-share.js";

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
	/**
	 * When true, wraps `navigator.mediaDevices.getDisplayMedia` at mount: starting a screen/window/
	 * tab capture through it automatically enables redaction, and ending the last active capture
	 * restores whatever `enabled` state was in effect right before it started (so if you'd already
	 * turned redaction on manually, it stays on after the share ends). Restored on unmount. Fires
	 * `onEnabledChange` the same as any other internally-driven toggle.
	 *
	 * **Limitation — read before relying on this:** this can only see captures *this page*
	 * initiates via `getDisplayMedia` (an in-app demo recorder, an embedded recording SDK like
	 * Loom's, a "record this page" button). It has no visibility into OS-level or other-app
	 * screen shares — e.g. picking your app's window/tab from Zoom's, Meet's, or the OS's own
	 * screen-share picker. Keep the keyboard shortcut (or a manual toggle) as your primary safety
	 * net for those; treat this as a bonus that catches the in-app-recorder case automatically.
	 *
	 * Default `false`.
	 */
	autoRedactOnScreenShare?: boolean;
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
	autoRedactOnScreenShare = false,
}: RedactProviderProps): ReactElement {
	const [enabled, setEnabledState] = useState(initialEnabled);
	const [isScreenSharing, setIsScreenSharing] = useState(false);

	// Sync when parent controls enabled via prop (controlled mode). This does not
	// invoke onEnabledChange — that callback is reserved for internally-driven changes.
	useEffect(() => {
		setEnabledState(initialEnabled);
	}, [initialEnabled]);

	// Wrapped setter shared by the keyboard shortcut, useRedactMode(), and the screen-share
	// watcher; notifies onEnabledChange for every internally-driven change (not the prop-sync above).
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

	// Mirrors `enabled` synchronously so the screen-share watcher's onStart callback (below) can
	// read "the state right before this share began" without depending on `enabled` in a way that
	// would tear down and re-patch getDisplayMedia every time redaction is toggled.
	const enabledRef = useRef(enabled);
	useEffect(() => {
		enabledRef.current = enabled;
	}, [enabled]);

	// Captured once per (idle -> sharing) transition; restored on the matching (sharing -> idle)
	// transition so a manual enable before sharing "wins" and stays on after the share ends.
	const preShareEnabledRef = useRef(false);

	// Mirrors `setEnabled` the same way `enabledRef` mirrors `enabled` above, so the watcher
	// effect below never needs `setEnabled` in its dependency array. `setEnabled`'s identity
	// changes whenever `onEnabledChange` does (it's a `useCallback` dep) — a bare inline arrow
	// function is a common, easy-to-write `onEnabledChange` (e.g. `onEnabledChange={(v) =>
	// setEnabled(v)}` instead of passing a bare, stable state setter). If `setEnabled` were a
	// dependency, every such re-render would tear down and re-`watchScreenShare()`, resetting its
	// internal `activeStreams` counter to 0 and orphaning any capture that was already in progress
	// (its "ended"/"inactive" listeners stay bound to the *old*, torn-down watcher instance) — the
	// new watcher would then treat the next `getDisplayMedia()` call as the first of a fresh count,
	// letting `onEnd` fire (restoring pre-share state) while the original capture is still active.
	const setEnabledRef = useRef(setEnabled);
	useEffect(() => {
		setEnabledRef.current = setEnabled;
	}, [setEnabled]);

	useEffect(() => {
		if (!autoRedactOnScreenShare) return;

		const watcher = watchScreenShare({
			onStart: () => {
				preShareEnabledRef.current = enabledRef.current;
				setIsScreenSharing(true);
				setEnabledRef.current(true);
			},
			onEnd: () => {
				setIsScreenSharing(false);
				setEnabledRef.current(preShareEnabledRef.current);
			},
		});

		return () => {
			watcher.stop();
			setIsScreenSharing(false);
		};
	}, [autoRedactOnScreenShare]);

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
			isScreenSharing,
		}),
		[
			enabled,
			mode,
			setEnabled,
			autoDetect,
			customPatterns,
			customRender,
			blurRadius,
			maskChar,
			isScreenSharing,
		],
	);

	return <RedactContext.Provider value={value}>{children}</RedactContext.Provider>;
}

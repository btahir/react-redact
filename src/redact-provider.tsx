"use client";

import { type ReactElement, useEffect, useMemo, useState } from "react";
import type { CustomRedactRender, RedactMode } from "./context.js";
import { RedactContext } from "./context.js";
import type { BuiltInPatternName } from "./patterns/index.js";
import { addShortcutListener } from "./utils/keyboard.js";

export interface RedactProviderProps {
	children: React.ReactNode;
	mode?: RedactMode;
	shortcut?: string;
	enabled?: boolean;
	autoDetect?: false | BuiltInPatternName[];
	customPatterns?: RegExp[];
	/** Default custom renderer for <Redact mode="custom"> when renderRedacted is not set. */
	customRender?: CustomRedactRender;
}

export function RedactProvider({
	children,
	mode = "blur",
	shortcut = "mod+shift+x",
	enabled: initialEnabled = false,
	autoDetect = false,
	customPatterns,
	customRender,
}: RedactProviderProps): ReactElement {
	const [enabled, setEnabled] = useState(initialEnabled);

	// Sync when parent controls enabled via prop (controlled mode)
	useEffect(() => {
		setEnabled(initialEnabled);
	}, [initialEnabled]);

	useEffect(() => {
		if (!shortcut) return;
		const remove = addShortcutListener(shortcut, () => setEnabled((e) => !e));
		return remove;
	}, [shortcut]);

	// Toggle blur class on all [data-redact] when enabled changes (affects auto-injected spans).
	// Intended for a single provider per app; multiple providers will all toggle the same document spans.
	useEffect(() => {
		document.querySelectorAll("[data-redact]").forEach((el) => {
			el.classList.toggle("react-redact-blur", enabled);
		});
	}, [enabled]);

	const value = useMemo<NonNullable<React.ContextType<typeof RedactContext>>>(
		() => ({
			enabled,
			mode,
			setEnabled,
			autoDetect: autoDetect || undefined,
			customPatterns,
			customRender,
		}),
		[enabled, mode, autoDetect, customPatterns, customRender],
	);

	return <RedactContext.Provider value={value}>{children}</RedactContext.Provider>;
}

import { useEffect, useMemo, useState } from "react";
import type { RedactMode } from "./context.js";
import { RedactContext } from "./context.js";
import { addShortcutListener } from "./utils/keyboard.js";

export interface RedactProviderProps {
	children: React.ReactNode;
	mode?: RedactMode;
	shortcut?: string;
	enabled?: boolean;
	autoDetect?: false | ("email" | "phone" | "ssn" | "credit-card" | "ip")[];
	customPatterns?: RegExp[];
}

export function RedactProvider({
	children,
	mode = "blur",
	shortcut = "mod+shift+x",
	enabled: initialEnabled = false,
}: RedactProviderProps) {
	const [enabled, setEnabled] = useState(initialEnabled);

	useEffect(() => {
		if (!shortcut) return;
		const remove = addShortcutListener(shortcut, () => setEnabled((e) => !e));
		return remove;
	}, [shortcut]);

	const value = useMemo<NonNullable<React.ContextType<typeof RedactContext>>>(
		() => ({
			enabled,
			mode,
			setEnabled,
		}),
		[enabled, mode],
	);

	return <RedactContext.Provider value={value}>{children}</RedactContext.Provider>;
}

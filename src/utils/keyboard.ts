/**
 * Parse shortcut string like "mod+shift+x" into key and modifiers.
 * "mod" = Meta on Mac, Ctrl elsewhere.
 */
export function parseShortcut(shortcut: string): {
	key: string;
	ctrl: boolean;
	meta: boolean;
	shift: boolean;
	alt: boolean;
} {
	const parts = shortcut.toLowerCase().trim().split("+");
	let key = "";
	let ctrl = false;
	let meta = false;
	let shift = false;
	let alt = false;
	for (const p of parts) {
		const s = p.trim();
		if (s === "mod") {
			// mod = meta on Mac, ctrl on Windows/Linux. Prefer userAgentData (modern), fallback to platform/userAgent.
			if (typeof navigator === "undefined") {
				ctrl = true;
			} else {
				const nav = navigator as Navigator & { userAgentData?: { platform: string } };
				const isMac =
					nav.userAgentData?.platform === "macOS" ||
					/Mac|iPod|iPhone|iPad/.test(nav.platform ?? "") ||
					/Mac|iPod|iPhone|iPad/.test(nav.userAgent ?? "");
				if (isMac) meta = true;
				else ctrl = true;
			}
		} else if (s === "ctrl") ctrl = true;
		else if (s === "meta" || s === "cmd") meta = true;
		else if (s === "shift") shift = true;
		else if (s === "alt") alt = true;
		else key = s;
	}
	return { key, ctrl, meta, shift, alt };
}

/**
 * Check if a keyboard event matches the given parsed shortcut.
 */
export function eventMatchesShortcut(
	event: KeyboardEvent,
	parsed: ReturnType<typeof parseShortcut>,
): boolean {
	const keyMatch = parsed.key === "" || event.key.toLowerCase() === parsed.key;
	return (
		keyMatch &&
		event.ctrlKey === parsed.ctrl &&
		event.metaKey === parsed.meta &&
		event.shiftKey === parsed.shift &&
		event.altKey === parsed.alt
	);
}

/**
 * Add a global keydown listener that invokes callback when shortcut matches.
 * Returns remove function.
 */
export function addShortcutListener(shortcut: string, callback: () => void): () => void {
	const parsed = parseShortcut(shortcut);
	const handler = (event: KeyboardEvent) => {
		if (eventMatchesShortcut(event, parsed)) {
			event.preventDefault();
			callback();
		}
	};
	window.addEventListener("keydown", handler);
	return () => window.removeEventListener("keydown", handler);
}

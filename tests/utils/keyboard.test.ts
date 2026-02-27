import { describe, expect, it } from "vitest";
import {
	addShortcutListener,
	eventMatchesShortcut,
	parseShortcut,
} from "../../src/utils/keyboard.js";

describe("parseShortcut", () => {
	it("parses mod+shift+x", () => {
		const parsed = parseShortcut("mod+shift+x");
		expect(parsed.key).toBe("x");
		expect(parsed.shift).toBe(true);
		// mod expands to meta or ctrl depending on platform
		expect(parsed.meta || parsed.ctrl).toBe(true);
	});

	it("parses ctrl+shift+k", () => {
		const parsed = parseShortcut("ctrl+shift+k");
		expect(parsed.key).toBe("k");
		expect(parsed.ctrl).toBe(true);
		expect(parsed.shift).toBe(true);
		expect(parsed.meta).toBe(false);
	});

	it("normalizes to lowercase", () => {
		const parsed = parseShortcut("Shift+X");
		expect(parsed.key).toBe("x");
		expect(parsed.shift).toBe(true);
	});
});

describe("eventMatchesShortcut", () => {
	it("matches ctrl+shift+x", () => {
		const parsed = parseShortcut("ctrl+shift+x");
		expect(
			eventMatchesShortcut(
				{ key: "x", ctrlKey: true, shiftKey: true, metaKey: false, altKey: false } as KeyboardEvent,
				parsed,
			),
		).toBe(true);
	});

	it("rejects wrong key", () => {
		const parsed = parseShortcut("ctrl+shift+x");
		expect(
			eventMatchesShortcut(
				{ key: "y", ctrlKey: true, shiftKey: true, metaKey: false, altKey: false } as KeyboardEvent,
				parsed,
			),
		).toBe(false);
	});

	it("rejects missing modifier", () => {
		const parsed = parseShortcut("ctrl+shift+x");
		expect(
			eventMatchesShortcut(
				{
					key: "x",
					ctrlKey: false,
					shiftKey: true,
					metaKey: false,
					altKey: false,
				} as KeyboardEvent,
				parsed,
			),
		).toBe(false);
	});
});

describe("addShortcutListener", () => {
	it("returns a remove function", () => {
		const remove = addShortcutListener("ctrl+x", () => {});
		expect(typeof remove).toBe("function");
		remove();
	});
});

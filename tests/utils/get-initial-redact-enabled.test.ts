import { afterEach, describe, expect, it } from "vitest";
import { getInitialRedactEnabled } from "../../src/utils/get-initial-redact-enabled.js";

describe("getInitialRedactEnabled", () => {
	const originalLocation = window.location;

	function setSearch(search: string) {
		Object.defineProperty(window, "location", {
			value: { ...originalLocation, search },
			writable: true,
		});
	}

	afterEach(() => {
		Object.defineProperty(window, "location", {
			value: originalLocation,
			writable: true,
		});
	});

	it("returns false with no query params", () => {
		setSearch("");
		expect(getInitialRedactEnabled()).toBe(false);
	});

	it("returns true when redact=true", () => {
		setSearch("?redact=true");
		expect(getInitialRedactEnabled()).toBe(true);
	});

	it("returns true when redact=1", () => {
		setSearch("?redact=1");
		expect(getInitialRedactEnabled()).toBe(true);
	});

	it("returns false when redact=false", () => {
		setSearch("?redact=false");
		expect(getInitialRedactEnabled()).toBe(false);
	});

	it("returns false when redact param is absent", () => {
		setSearch("?other=true");
		expect(getInitialRedactEnabled()).toBe(false);
	});

	it("handles multiple params correctly", () => {
		setSearch("?foo=bar&redact=true&baz=1");
		expect(getInitialRedactEnabled()).toBe(true);
	});

	it("returns false for redact=yes (only true/1 accepted)", () => {
		setSearch("?redact=yes");
		expect(getInitialRedactEnabled()).toBe(false);
	});
});

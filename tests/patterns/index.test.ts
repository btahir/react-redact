import { describe, expect, it } from "vitest";
import { createPattern } from "../../src/patterns/index.js";

describe("createPattern", () => {
	it("preserves existing regex flags and ensures global matching", () => {
		const pattern = createPattern(/abc\d+/i, "token");
		expect(pattern.regex.flags).toContain("i");
		expect(pattern.regex.flags).toContain("g");
		expect("ABC123".match(pattern.regex)?.[0]).toBe("ABC123");
	});
});

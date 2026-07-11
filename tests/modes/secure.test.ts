import { describe, expect, it } from "vitest";
import { secureValue } from "../../src/modes/secure.js";
import { fakeFor } from "../../src/utils/fake-data.js";

describe("secure mode", () => {
	it("returns deterministic fake data when a pattern hint is provided", () => {
		expect(secureValue("user@company.com", "email")).toBe(fakeFor("user@company.com", "email"));
	});

	it("is deterministic for the same input and hint", () => {
		expect(secureValue("555-123-4567", "phone")).toBe(secureValue("555-123-4567", "phone"));
	});

	it("falls back to the mask character (sized to the real text) when there is no hint", () => {
		expect(secureValue("ORDER-123456")).toBe("••••••••••••");
	});

	it("uses a custom mask character when there is no hint", () => {
		expect(secureValue("ORDER-123456", undefined, "*")).toBe("************");
	});

	it("never returns the original value verbatim", () => {
		expect(secureValue("user@company.com", "email")).not.toBe("user@company.com");
		expect(secureValue("ORDER-123456")).not.toBe("ORDER-123456");
	});
});

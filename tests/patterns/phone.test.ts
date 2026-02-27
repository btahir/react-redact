import { describe, expect, it } from "vitest";
import { phoneRegex } from "../../src/patterns/phone.js";

describe("phone pattern", () => {
	it("matches US formats", () => {
		expect("(555) 555-0123".match(phoneRegex)?.[0]).toBe("(555) 555-0123");
		expect("555-555-0123".match(phoneRegex)?.[0]).toBe("555-555-0123");
		expect("5555550123".match(phoneRegex)?.[0]).toBe("5555550123");
	});

	it("matches with country code", () => {
		const m = "+1-555-555-0123".match(phoneRegex);
		expect(m?.[0]).toBe("+1-555-555-0123");
	});
});

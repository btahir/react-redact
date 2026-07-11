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

	it("does not match a 10-digit substring embedded in a longer digit run", () => {
		// e.g. an order/tracking number — should not be misdetected as a phone number.
		expect("ORDER-1234567890123".match(phoneRegex)).toBeNull();
		expect("12345678901234".match(phoneRegex)).toBeNull();
	});

	it("still matches a bare 10-digit phone number surrounded by non-digit text", () => {
		const m = "Contact: 5555550123 today".match(phoneRegex);
		expect(m?.[0]).toBe("5555550123");
	});
});

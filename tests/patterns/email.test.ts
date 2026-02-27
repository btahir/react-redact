import { describe, expect, it } from "vitest";
import { emailRegex } from "../../src/patterns/email.js";

describe("email pattern", () => {
	it("matches standard emails", () => {
		expect("user@company.com".match(emailRegex)?.[0]).toBe("user@company.com");
		expect("jane.doe+tag@example.co.uk".match(emailRegex)?.[0]).toBe("jane.doe+tag@example.co.uk");
	});

	it("does not match invalid emails", () => {
		expect("notanemail".match(emailRegex)).toBeNull();
		expect("missing@".match(emailRegex)).toBeNull();
	});
});

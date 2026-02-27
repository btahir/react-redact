import { describe, expect, it } from "vitest";
import { ssnRegex } from "../../src/patterns/ssn.js";

describe("ssn pattern", () => {
	it("matches XXX-XX-XXXX", () => {
		expect("123-45-6789".match(ssnRegex)?.[0]).toBe("123-45-6789");
	});

	it("does not match 4-digit groups", () => {
		expect("1234-56-789".match(ssnRegex)).toBeNull();
	});
});

import { describe, expect, it } from "vitest";
import { isLuhnValid, matchCreditCard } from "../../src/patterns/index.js";

describe("credit-card Luhn", () => {
	it("accepts valid Luhn numbers", () => {
		expect(isLuhnValid("4111111111111111")).toBe(true);
		expect(isLuhnValid("5500000000000004")).toBe(true);
	});

	it("rejects invalid Luhn", () => {
		expect(isLuhnValid("4111111111111112")).toBe(false);
	});
});

describe("matchCreditCard", () => {
	it("returns Luhn-valid matches only", () => {
		const out = matchCreditCard("Card: 4111 1111 1111 1111 end");
		expect(out).toHaveLength(1);
		expect(out[0].match.replace(/\D/g, "")).toBe("4111111111111111");
	});

	it("rejects invalid check digit", () => {
		const out = matchCreditCard("4111 1111 1111 1112");
		expect(out).toHaveLength(0);
	});
});

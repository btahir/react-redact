import { describe, expect, it } from "vitest";
import { creditCardRegex } from "../../src/patterns/credit-card.js";
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

describe("creditCardRegex ReDoS guard", () => {
	it("matches long runs of digits/separators without catastrophic backtracking", () => {
		// A long non-16-boundary-aligned run of digits/spaces/dashes is the classic trigger for
		// catastrophic backtracking on a `(?:\d[\d\s-]*){13,19}` style pattern. The bounded
		// `\b\d(?:[ -]?\d){12,18}\b` replacement is linear, so this should resolve almost instantly.
		const longRun = "1".repeat(50_000);
		const text = `prefix ${longRun} suffix`;

		const start = Date.now();
		const matches = matchCreditCard(text);
		const elapsed = Date.now() - start;

		expect(Array.isArray(matches)).toBe(true);
		expect(elapsed).toBeLessThan(1000);
	}, 5000);

	it("does not hang on long mixed digit/separator runs with a trailing non-matching tail", () => {
		const longRun = "1-".repeat(50_000);
		const text = `${longRun}x`;

		const start = Date.now();
		const r = new RegExp(creditCardRegex.source, "g");
		let count = 0;
		let m = r.exec(text);
		while (m !== null) {
			count++;
			m = r.exec(text);
		}
		const elapsed = Date.now() - start;

		expect(count).toBeGreaterThanOrEqual(0);
		expect(elapsed).toBeLessThan(1000);
	}, 5000);
});

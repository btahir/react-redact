import { describe, expect, it } from "vitest";
import { fakeEmail, fakeFor, fakePhone, fakeSsn } from "../../src/utils/fake-data.js";

describe("fake-data", () => {
	it("fakeEmail is deterministic", () => {
		const a = fakeEmail("alice@real.com");
		const b = fakeEmail("alice@real.com");
		expect(a).toBe(b);
		expect(a).toContain("@");
	});

	it("fakePhone is deterministic", () => {
		const a = fakePhone("555-123-4567");
		const b = fakePhone("555-123-4567");
		expect(a).toBe(b);
		expect(a).toMatch(/\(\d{3}\) \d{3}-\d{4}/);
	});

	it("fakeSsn is deterministic", () => {
		const a = fakeSsn("123-45-6789");
		const b = fakeSsn("123-45-6789");
		expect(a).toBe(b);
		expect(a).toMatch(/\d{3}-\d{2}-\d{4}/);
	});

	it("fakeFor picks by hint", () => {
		expect(fakeFor("x@y.com", "email")).toContain("@");
		expect(fakeFor("192.168.1.1", "ip")).toMatch(/\d+\.\d+\.\d+\.\d+/);
	});
});

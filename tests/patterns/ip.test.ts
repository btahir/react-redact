import { describe, expect, it } from "vitest";
import { ipRegex } from "../../src/patterns/ip.js";

describe("ip pattern", () => {
	it("matches IPv4", () => {
		expect("192.168.1.1".match(ipRegex)?.[0]).toBe("192.168.1.1");
		expect("10.0.0.1".match(ipRegex)?.[0]).toBe("10.0.0.1");
	});

	it("matches IPv6", () => {
		const m = "2001:0db8:85a3:0000:0000:8a2e:0370:7334".match(ipRegex);
		expect(m?.[0]).toBe("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
	});
});

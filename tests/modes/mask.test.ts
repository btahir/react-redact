import { describe, expect, it } from "vitest";
import { getMaskStyle, maskValue } from "../../src/modes/mask.js";

describe("mask mode", () => {
	it("maskValue returns bullets of same length", () => {
		expect(maskValue("hello")).toBe("•••••");
		expect(maskValue("123-45-6789")).toBe("•••••••••••");
	});

	it("getMaskStyle returns width in ch", () => {
		const style = getMaskStyle("hello");
		expect(style.width).toBe("5ch");
	});
});

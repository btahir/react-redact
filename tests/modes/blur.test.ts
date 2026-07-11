import { describe, expect, it } from "vitest";
import { applyBlurStyle, DEFAULT_BLUR_RADIUS, getBlurProps } from "../../src/modes/blur.js";

describe("getBlurProps", () => {
	it("returns inline styles so blur works without importing styles.css", () => {
		const props = getBlurProps();
		expect(props.style.filter).toBe(`blur(${DEFAULT_BLUR_RADIUS}px)`);
		expect(props.style.userSelect).toBe("none");
		expect(props.className).toBe("react-redact-blur");
	});

	it("honors a custom radius", () => {
		const props = getBlurProps(12);
		expect(props.style.filter).toBe("blur(12px)");
	});
});

describe("applyBlurStyle", () => {
	it("sets filter/user-select/class directly on a DOM element", () => {
		const el = document.createElement("span");
		applyBlurStyle(el);
		expect(el.style.filter).toBe(`blur(${DEFAULT_BLUR_RADIUS}px)`);
		expect(el.style.userSelect).toBe("none");
		expect(el.classList.contains("react-redact-blur")).toBe(true);
	});

	it("honors a custom radius", () => {
		const el = document.createElement("span");
		applyBlurStyle(el, 20);
		expect(el.style.filter).toBe("blur(20px)");
	});
});

import { describe, expect, it } from "vitest";
import { scanRoot } from "../src/scanner.js";

describe("scanner", () => {
	it("wraps email in data-redact span", () => {
		const root = document.createElement("div");
		root.appendChild(document.createTextNode("Contact: user@company.com"));
		scanRoot(root, { patternNames: ["email"], customPatterns: [] }, (text) => {
			const span = document.createElement("span");
			span.setAttribute("data-redact", "");
			span.textContent = text;
			return span;
		});
		const redact = root.querySelector("[data-redact]");
		expect(redact).toBeTruthy();
		expect(redact?.textContent).toBe("user@company.com");
	});

	it("does not wrap when no pattern matches", () => {
		const root = document.createElement("div");
		root.appendChild(document.createTextNode("No PII here"));
		scanRoot(root, { patternNames: ["email"], customPatterns: [] }, (text) => {
			const span = document.createElement("span");
			span.setAttribute("data-redact", "");
			span.textContent = text;
			return span;
		});
		expect(root.querySelector("[data-redact]")).toBeNull();
	});
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { cancelScheduledScan, scanRoot, scheduleScan } from "../src/scanner.js";

afterEach(() => {
	vi.useRealTimers();
});

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

	it("respects case-insensitive custom pattern flags", () => {
		const root = document.createElement("div");
		root.appendChild(document.createTextNode("Token: ABC123"));
		scanRoot(root, { patternNames: [], customPatterns: [/abc\d+/gi] }, (text) => {
			const span = document.createElement("span");
			span.setAttribute("data-redact", "");
			span.textContent = text;
			return span;
		});
		const redact = root.querySelector("[data-redact]");
		expect(redact).toBeTruthy();
		expect(redact?.textContent).toBe("ABC123");
	});

	it("debounces scheduled scans per root", () => {
		vi.useFakeTimers();
		const root = document.createElement("div");
		root.appendChild(document.createTextNode("Contact: user@company.com"));
		const createSpan = vi.fn((text: string) => {
			const span = document.createElement("span");
			span.setAttribute("data-redact", "");
			span.textContent = text;
			return span;
		});

		scheduleScan(root, { patternNames: ["email"], customPatterns: [] }, createSpan);
		scheduleScan(root, { patternNames: ["email"], customPatterns: [] }, createSpan);

		expect(createSpan).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(createSpan).toHaveBeenCalledTimes(1);
	});

	it("can cancel a scheduled scan", () => {
		vi.useFakeTimers();
		const root = document.createElement("div");
		root.appendChild(document.createTextNode("Contact: user@company.com"));
		const createSpan = vi.fn((text: string) => {
			const span = document.createElement("span");
			span.setAttribute("data-redact", "");
			span.textContent = text;
			return span;
		});

		scheduleScan(root, { patternNames: ["email"], customPatterns: [] }, createSpan);
		cancelScheduledScan(root);
		vi.advanceTimersByTime(100);
		expect(createSpan).not.toHaveBeenCalled();
	});

	it("cancelScheduledScan is safe when nothing is queued", () => {
		const root = document.createElement("div");
		expect(() => cancelScheduledScan(root)).not.toThrow();
	});
});

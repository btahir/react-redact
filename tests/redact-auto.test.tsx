import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RedactAuto } from "../src/redact-auto.jsx";
import { RedactProvider } from "../src/redact-provider.js";

afterEach(() => {
	vi.useRealTimers();
});

describe("RedactAuto", () => {
	it("wraps PII in data-redact when enabled", () => {
		const { container } = render(
			<RedactProvider enabled>
				<RedactAuto patterns={["email"]}>
					<span>Contact: user@company.com</span>
				</RedactAuto>
			</RedactProvider>,
		);
		const redact = container.querySelector("[data-redact]");
		expect(redact).toBeTruthy();
		expect(redact?.textContent).toBe("user@company.com");
	});

	it("does not wrap when disabled", () => {
		const { container } = render(
			<RedactProvider enabled={false}>
				<RedactAuto patterns={["email"]}>
					<span>Contact: user@company.com</span>
				</RedactAuto>
			</RedactProvider>,
		);
		expect(container.querySelector("[data-redact]")).toBeNull();
	});

	it("restores original text when disabled after replace mode redaction", () => {
		const ui = (enabled: boolean) => (
			<RedactProvider enabled={enabled} mode="replace">
				<RedactAuto patterns={["email"]}>
					<span>Contact: user@company.com</span>
				</RedactAuto>
			</RedactProvider>
		);

		const { container, rerender } = render(ui(true));
		expect(container.querySelector("[data-redact]")).toBeTruthy();
		expect(container.textContent).not.toContain("user@company.com");

		rerender(ui(false));
		expect(container.querySelector("[data-redact]")).toBeNull();
		expect(container.textContent).toContain("user@company.com");
	});

	it("re-applies auto redaction when mode changes", () => {
		const ui = (mode: "blur" | "replace") => (
			<RedactProvider enabled mode={mode}>
				<RedactAuto patterns={["email"]}>
					<span>Contact: user@company.com</span>
				</RedactAuto>
			</RedactProvider>
		);

		const { container, rerender } = render(ui("blur"));
		const blur = container.querySelector("[data-redact]");
		expect(blur).toHaveClass("react-redact-blur");
		expect(blur?.textContent).toBe("user@company.com");

		rerender(ui("replace"));
		const replaced = container.querySelector("[data-redact]");
		expect(replaced).toBeTruthy();
		expect(replaced).not.toHaveClass("react-redact-blur");
		expect(replaced?.textContent).not.toBe("user@company.com");
	});

	it("supports mask mode for auto spans", () => {
		const { container } = render(
			<RedactProvider enabled mode="mask">
				<RedactAuto patterns={["email"]}>
					<span>Contact: user@company.com</span>
				</RedactAuto>
			</RedactProvider>,
		);
		const redact = container.querySelector("[data-redact]") as HTMLElement;
		expect(redact.textContent).toBe("••••••••••••••••");
		expect(redact.style.userSelect).toBe("none");
		expect(redact.style.width).toBe("16ch");
	});

	it("falls back to blur for auto spans in custom mode", () => {
		const { container } = render(
			<RedactProvider enabled mode="custom">
				<RedactAuto patterns={["email"]}>
					<span>Contact: user@company.com</span>
				</RedactAuto>
			</RedactProvider>,
		);
		const redact = container.querySelector("[data-redact]");
		expect(redact).toHaveClass("react-redact-blur");
		expect(redact?.textContent).toBe("user@company.com");
	});

	it("re-scans mutated content via MutationObserver", async () => {
		vi.useFakeTimers();
		const ui = (value: string) => (
			<RedactProvider enabled>
				<RedactAuto patterns={["email"]}>
					<span>{value}</span>
				</RedactAuto>
			</RedactProvider>
		);

		const { container, rerender } = render(ui("Contact: user@company.com"));
		expect(container.querySelector("[data-redact]")?.textContent).toBe("user@company.com");

		rerender(ui("Contact: next@company.com"));
		// MutationObserver callbacks fire as a microtask; flush it before advancing the debounce timer.
		await act(async () => {
			await Promise.resolve();
		});
		await act(async () => {
			vi.advanceTimersByTime(120);
		});

		expect(container.querySelector("[data-redact]")?.textContent).toBe("next@company.com");
		vi.useRealTimers();
	});

	it("does not tear down and rescan when the parent re-renders with equivalent inline pattern arrays", () => {
		// patterns/customPatterns are passed as fresh array literals on every call to ui(), as a
		// consumer would typically write it inline in JSX. The effect should key off stable,
		// serialized values instead of array identity, so re-rendering with equivalent content
		// must not tear down and recreate the existing redact span.
		const ui = () => (
			<RedactProvider enabled>
				<RedactAuto patterns={["email"]} customPatterns={[]}>
					<span>Contact: user@company.com</span>
				</RedactAuto>
			</RedactProvider>
		);

		const { container, rerender } = render(ui());
		const before = container.querySelector("[data-redact]");
		expect(before).toBeTruthy();

		rerender(ui());
		const after = container.querySelector("[data-redact]");

		// Same DOM node instance => the scan effect did not tear down and re-wrap.
		expect(after).toBe(before);
	});

	it("still reacts to a genuine pattern list change", () => {
		const ui = (patterns: ("email" | "phone")[]) => (
			<RedactProvider enabled>
				<RedactAuto patterns={patterns}>
					<span>Contact: user@company.com or (555) 555-0123</span>
				</RedactAuto>
			</RedactProvider>
		);

		const { container, rerender } = render(ui(["email"]));
		expect(container.querySelectorAll("[data-redact]")).toHaveLength(1);

		rerender(ui(["email", "phone"]));
		expect(container.querySelectorAll("[data-redact]")).toHaveLength(2);
	});
});

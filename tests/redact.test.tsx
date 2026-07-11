import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Redact } from "../src/redact.jsx";
import { RedactProvider } from "../src/redact-provider.js";

function renderWithProvider(ui: React.ReactElement, enabled = false) {
	return render(<RedactProvider enabled={enabled}>{ui}</RedactProvider>);
}

describe("Redact", () => {
	it("renders children when redact is disabled", () => {
		renderWithProvider(<Redact>secret@email.com</Redact>, false);
		expect(screen.getByText("secret@email.com")).toBeInTheDocument();
		expect(document.querySelector("[data-redact]")).toBeNull();
	});

	it("wraps in data-redact span when redact is enabled", () => {
		renderWithProvider(<Redact>secret@email.com</Redact>, true);
		const span = document.querySelector("[data-redact]");
		expect(span).toBeInTheDocument();
		expect(span).toHaveAttribute("aria-hidden", "true");
		expect(span).toHaveClass("react-redact-blur");
		expect(span?.textContent).toBe("secret@email.com");
	});

	it("uses renderRedacted when mode is custom", () => {
		const renderRedacted = ({ text }: { children: React.ReactNode; text: string }) => (
			<span data-redact aria-hidden data-testid="custom-redact">
				[{text}]
			</span>
		);
		renderWithProvider(
			<Redact mode="custom" renderRedacted={renderRedacted}>
				hidden
			</Redact>,
			true,
		);
		const el = document.querySelector("[data-testid=custom-redact]");
		expect(el).toBeInTheDocument();
		expect(el?.textContent).toBe("[hidden]");
	});

	it("uses provider customRender when mode is custom and no renderRedacted", () => {
		const customRender = ({ text }: { children: React.ReactNode; text: string }) => (
			<span data-redact aria-hidden data-testid="provider-custom">
				{text.toUpperCase()}
			</span>
		);
		render(
			<RedactProvider enabled={true} customRender={customRender}>
				<Redact mode="custom">secret</Redact>
			</RedactProvider>,
		);
		const el = document.querySelector("[data-testid=provider-custom]");
		expect(el).toBeInTheDocument();
		expect(el?.textContent).toBe("SECRET");
	});

	it("supports mask mode", () => {
		renderWithProvider(<Redact mode="mask">123-45-6789</Redact>, true);
		const span = document.querySelector("[data-redact]");
		expect(span?.textContent).toBe("•••••••••••");
		expect((span as HTMLElement).style.width).toBe("11ch");
	});

	it("supports replace mode and replacement prop", () => {
		renderWithProvider(
			<Redact mode="replace" replacement="REDACTED">
				123-45-6789
			</Redact>,
			true,
		);
		const span = document.querySelector("[data-redact]");
		expect(span?.textContent).toBe("REDACTED");
	});

	it("falls back to blur styling for custom mode when no renderer is provided", () => {
		renderWithProvider(<Redact mode="custom">secret</Redact>, true);
		const span = document.querySelector("[data-redact]");
		expect(span).toHaveClass("react-redact-blur");
		expect(span?.textContent).toBe("secret");
	});

	it("applies blur as an inline style so it works with zero CSS imported", () => {
		renderWithProvider(<Redact>secret@email.com</Redact>, true);
		const span = document.querySelector("[data-redact]") as HTMLElement;
		// Inline style must carry the real filter — the className alone is not enough if
		// consumers never import styles.css.
		expect(span.style.filter).toBe("blur(6px)");
		expect(span.style.userSelect).toBe("none");
		expect(span).toHaveClass("react-redact-blur");
	});

	it("supports a custom blurRadius prop", () => {
		renderWithProvider(<Redact blurRadius={20}>secret@email.com</Redact>, true);
		const span = document.querySelector("[data-redact]") as HTMLElement;
		expect(span.style.filter).toBe("blur(20px)");
	});

	it("supports a custom maskChar prop", () => {
		renderWithProvider(
			<Redact mode="mask" maskChar="*">
				hello
			</Redact>,
			true,
		);
		const span = document.querySelector("[data-redact]");
		expect(span?.textContent).toBe("*****");
	});

	describe("dev warning for non-text children", () => {
		const originalEnv = process.env.NODE_ENV;

		afterEach(() => {
			process.env.NODE_ENV = originalEnv;
			vi.restoreAllMocks();
		});

		it("warns in mask mode when children include a React element", () => {
			process.env.NODE_ENV = "development";
			const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
			renderWithProvider(
				<Redact mode="mask">
					<b>secret</b>
				</Redact>,
				true,
			);
			expect(warn).toHaveBeenCalledTimes(1);
			expect(warn.mock.calls[0][0]).toContain("non-text children");
		});

		it("warns in replace mode when children include a React element", () => {
			process.env.NODE_ENV = "development";
			const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
			renderWithProvider(
				<Redact mode="replace">
					<b>secret</b>
				</Redact>,
				true,
			);
			expect(warn).toHaveBeenCalledTimes(1);
		});

		it("does not warn in production", () => {
			process.env.NODE_ENV = "production";
			const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
			renderWithProvider(
				<Redact mode="mask">
					<b>secret</b>
				</Redact>,
				true,
			);
			expect(warn).not.toHaveBeenCalled();
		});

		it("does not warn for plain string children", () => {
			process.env.NODE_ENV = "development";
			const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
			renderWithProvider(<Redact mode="mask">plain text</Redact>, true);
			expect(warn).not.toHaveBeenCalled();
		});

		it("does not warn in blur mode even with element children", () => {
			process.env.NODE_ENV = "development";
			const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
			renderWithProvider(
				<Redact mode="blur">
					<b>secret</b>
				</Redact>,
				true,
			);
			expect(warn).not.toHaveBeenCalled();
		});
	});
});

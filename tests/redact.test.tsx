import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});

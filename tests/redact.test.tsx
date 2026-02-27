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
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Redact } from "../src/redact.jsx";
import { RedactProvider } from "../src/redact-provider.js";
import { useRedactMode } from "../src/use-redact-mode.js";

function ToggleButton() {
	const { isRedacted, toggle } = useRedactMode();
	return (
		<button type="button" onClick={toggle}>
			{isRedacted ? "Locked" : "Unlocked"}
		</button>
	);
}

describe("RedactProvider", () => {
	it("renders children and provides context", () => {
		render(
			<RedactProvider>
				<ToggleButton />
				<Redact>sensitive</Redact>
			</RedactProvider>,
		);
		expect(screen.getByRole("button", { name: "Unlocked" })).toBeInTheDocument();
		expect(screen.getByText("sensitive")).toBeInTheDocument();
	});

	it("toggle button flips redact state", () => {
		render(
			<RedactProvider>
				<ToggleButton />
				<Redact>sensitive</Redact>
			</RedactProvider>,
		);
		expect(document.querySelector("[data-redact]")).toBeNull();
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByRole("button")).toHaveTextContent("Locked");
		expect(document.querySelector("[data-redact]")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByRole("button")).toHaveTextContent("Unlocked");
		expect(document.querySelector("[data-redact]")).toBeNull();
	});

	it("respects initial enabled prop", () => {
		render(
			<RedactProvider enabled>
				<Redact>sensitive</Redact>
			</RedactProvider>,
		);
		expect(document.querySelector("[data-redact]")).toBeInTheDocument();
	});
});

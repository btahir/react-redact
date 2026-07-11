import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

	it("does not force a blur class onto unrelated [data-redact] elements or non-blur spans on enable", () => {
		function ManualMarker() {
			// Simulates a consumer's own markup that happens to carry data-redact,
			// unrelated to <Redact>/<RedactAuto>. The provider must not reach into the
			// document and toggle classes on arbitrary [data-redact] elements.
			return (
				<div data-redact data-testid="manual">
					custom
				</div>
			);
		}

		const { rerender } = render(
			<RedactProvider enabled={false} mode="mask">
				<ManualMarker />
				<Redact mode="mask">123-45-6789</Redact>
			</RedactProvider>,
		);

		rerender(
			<RedactProvider enabled mode="mask">
				<ManualMarker />
				<Redact mode="mask">123-45-6789</Redact>
			</RedactProvider>,
		);

		const manual = screen.getByTestId("manual");
		expect(manual).not.toHaveClass("react-redact-blur");

		const maskSpan = document.querySelector('[data-redact]:not([data-testid="manual"])');
		expect(maskSpan).not.toBeNull();
		expect(maskSpan).not.toHaveClass("react-redact-blur");
	});

	describe("onEnabledChange", () => {
		it("is called when useRedactMode().toggle() flips state", () => {
			const onEnabledChange = vi.fn();
			function ToggleButton() {
				const { isRedacted, toggle } = useRedactMode();
				return (
					<button type="button" onClick={toggle}>
						{isRedacted ? "Locked" : "Unlocked"}
					</button>
				);
			}
			render(
				<RedactProvider onEnabledChange={onEnabledChange}>
					<ToggleButton />
				</RedactProvider>,
			);
			fireEvent.click(screen.getByRole("button"));
			expect(onEnabledChange).toHaveBeenCalledTimes(1);
			expect(onEnabledChange).toHaveBeenCalledWith(true);

			fireEvent.click(screen.getByRole("button"));
			expect(onEnabledChange).toHaveBeenCalledTimes(2);
			expect(onEnabledChange).toHaveBeenLastCalledWith(false);
		});

		it("is called when the keyboard shortcut toggles state", () => {
			const onEnabledChange = vi.fn();
			render(
				<RedactProvider shortcut="ctrl+shift+x" onEnabledChange={onEnabledChange}>
					<Redact>sensitive</Redact>
				</RedactProvider>,
			);
			fireEvent.keyDown(window, { key: "x", ctrlKey: true, shiftKey: true });
			expect(onEnabledChange).toHaveBeenCalledTimes(1);
			expect(onEnabledChange).toHaveBeenCalledWith(true);
		});

		it("is not called when the parent merely updates the controlled enabled prop", () => {
			const onEnabledChange = vi.fn();
			const { rerender } = render(
				<RedactProvider enabled={false} onEnabledChange={onEnabledChange}>
					<Redact>sensitive</Redact>
				</RedactProvider>,
			);
			rerender(
				<RedactProvider enabled={true} onEnabledChange={onEnabledChange}>
					<Redact>sensitive</Redact>
				</RedactProvider>,
			);
			expect(onEnabledChange).not.toHaveBeenCalled();
		});
	});
});

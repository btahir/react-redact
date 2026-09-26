import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode, useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { RedactAuto } from "../src/redact-auto";
import { RedactProvider } from "../src/redact-provider";
import { useRedactMode } from "../src/use-redact-mode";
import { useRedactPatterns } from "../src/use-redact-patterns";

function Toggle() {
	const { toggle } = useRedactMode();
	return (
		<button type="button" onClick={toggle}>
			Toggle visual mode
		</button>
	);
}
function Register() {
	const { addPattern } = useRedactPatterns();
	useEffect(() => {
		addPattern(/ORDER-\d+/g, "order");
	}, [addPattern]);
	return null;
}
describe("runtime regressions", () => {
	it.each([
		"blur",
		"mask",
		"replace",
		"secure",
	] as const)("never serializes restoration values in %s mode", (mode) => {
		const { container } = render(
			<RedactProvider enabled mode={mode}>
				<RedactAuto>private@example.org</RedactAuto>
			</RedactProvider>,
		);
		expect(container.querySelector("[data-redact-original]")).toBeNull();
		expect(container.querySelector("[data-redact-auto]")).toHaveAttribute(
			"aria-label",
			"Hidden demo field",
		);
	});
	it("inherits provider patterns and provider-local registered patterns", async () => {
		render(
			<RedactProvider enabled mode="mask" autoDetect={["email"]}>
				<Register />
				<RedactAuto>person@example.org ORDER-123</RedactAuto>
			</RedactProvider>,
		);
		await waitFor(() => expect(document.querySelectorAll("[data-redact-auto]")).toHaveLength(2));
		expect(document.body.textContent).not.toContain("ORDER-123");
	});
	it("leaves controlled state unchanged if its parent declines the request", () => {
		const onChange = vi.fn();
		render(
			<RedactProvider enabled onEnabledChange={onChange} mode="mask">
				<Toggle />
				<RedactAuto>person@example.org</RedactAuto>
			</RedactProvider>,
		);
		fireEvent.click(screen.getByText("Toggle visual mode"));
		expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
		expect(document.querySelector("[data-redact-auto]")).not.toHaveTextContent(
			"person@example.org",
		);
	});
	it("restores original text across repeated StrictMode enable/disable cycles", () => {
		const { container } = render(
			<StrictMode>
				<RedactProvider defaultEnabled mode="mask">
					<Toggle />
					<RedactAuto>One: person@example.org.</RedactAuto>
				</RedactProvider>
			</StrictMode>,
		);
		for (let index = 0; index < 3; index++) {
			fireEvent.click(screen.getByText("Toggle visual mode"));
			expect(container).toHaveTextContent("One: person@example.org.");
			fireEvent.click(screen.getByText("Toggle visual mode"));
			expect(container.querySelectorAll("[data-redact-auto]")).toHaveLength(1);
		}
	});
	it("rescans async React text updates and keeps its honest post-render boundary", async () => {
		const view = (text: string) => (
			<RedactProvider enabled mode="secure">
				<RedactAuto>
					<p>{text}</p>
				</RedactAuto>
			</RedactProvider>
		);
		const { container, rerender, unmount } = render(view("First: one@example.org"));
		rerender(view("Next: two@example.org"));
		// Updates may contain raw text until the observer scan completes.
		await waitFor(() => expect(container.textContent).not.toContain("two@example.org"));
		expect(container.querySelectorAll("[data-redact-auto]")).toHaveLength(1);
		unmount();
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 120));
		});
		expect(container).toBeEmptyDOMElement();
	});
	it("does not scan custom empty Unicode matches forever", () => {
		render(
			<RedactProvider enabled>
				<RedactAuto customPatterns={[/(?:)/gu]} patterns={[]}>
					😀 untouched
				</RedactAuto>
			</RedactProvider>,
		);
		expect(screen.getByText("😀 untouched")).toBeVisible();
	});
});

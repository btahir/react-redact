import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

	describe("autoRedactOnScreenShare", () => {
		function createFakeTrack() {
			const target = new EventTarget();
			return {
				addEventListener: target.addEventListener.bind(target),
				end() {
					target.dispatchEvent(new Event("ended"));
				},
			};
		}

		function createFakeStream(tracks: ReturnType<typeof createFakeTrack>[]) {
			return { getVideoTracks: () => tracks };
		}

		function installMediaDevices(getDisplayMedia: (...args: unknown[]) => Promise<unknown>) {
			Object.defineProperty(navigator, "mediaDevices", {
				value: { getDisplayMedia },
				configurable: true,
				writable: true,
			});
		}

		afterEach(() => {
			Object.defineProperty(navigator, "mediaDevices", {
				value: undefined,
				configurable: true,
				writable: true,
			});
		});

		function StatusDisplay() {
			const { isRedacted, isScreenSharing, enable } = useRedactMode();
			return (
				<div>
					<span data-testid="status">{isRedacted ? "redacted" : "visible"}</span>
					<span data-testid="sharing">{isScreenSharing ? "sharing" : "idle"}</span>
					<button type="button" onClick={enable}>
						manual-enable
					</button>
				</div>
			);
		}

		it("enables redaction when a capture starts and restores prior state when it ends", async () => {
			const track = createFakeTrack();
			installMediaDevices(async () => createFakeStream([track]));

			render(
				<RedactProvider autoRedactOnScreenShare>
					<StatusDisplay />
				</RedactProvider>,
			);
			expect(screen.getByTestId("status")).toHaveTextContent("visible");
			expect(screen.getByTestId("sharing")).toHaveTextContent("idle");

			await act(async () => {
				await navigator.mediaDevices.getDisplayMedia();
			});
			expect(screen.getByTestId("status")).toHaveTextContent("redacted");
			expect(screen.getByTestId("sharing")).toHaveTextContent("sharing");

			act(() => {
				track.end();
			});
			expect(screen.getByTestId("status")).toHaveTextContent("visible");
			expect(screen.getByTestId("sharing")).toHaveTextContent("idle");
		});

		it("keeps redaction on after the share ends if it was manually enabled beforehand", async () => {
			const track = createFakeTrack();
			installMediaDevices(async () => createFakeStream([track]));

			render(
				<RedactProvider autoRedactOnScreenShare>
					<StatusDisplay />
				</RedactProvider>,
			);
			fireEvent.click(screen.getByRole("button", { name: "manual-enable" }));
			expect(screen.getByTestId("status")).toHaveTextContent("redacted");

			await act(async () => {
				await navigator.mediaDevices.getDisplayMedia();
			});
			expect(screen.getByTestId("status")).toHaveTextContent("redacted");

			act(() => {
				track.end();
			});
			// Was manually on before the share started — stays on after it ends.
			expect(screen.getByTestId("status")).toHaveTextContent("redacted");
		});

		it("does not toggle when the user cancels the share picker", async () => {
			installMediaDevices(async () => {
				throw new DOMException("cancel", "NotAllowedError");
			});

			render(
				<RedactProvider autoRedactOnScreenShare>
					<StatusDisplay />
				</RedactProvider>,
			);

			await act(async () => {
				await expect(navigator.mediaDevices.getDisplayMedia()).rejects.toThrow();
			});
			expect(screen.getByTestId("status")).toHaveTextContent("visible");
			expect(screen.getByTestId("sharing")).toHaveTextContent("idle");
		});

		it("only restores once all concurrent streams end", async () => {
			const trackA = createFakeTrack();
			const trackB = createFakeTrack();
			let call = 0;
			const streams = [createFakeStream([trackA]), createFakeStream([trackB])];
			installMediaDevices(async () => streams[call++]);

			render(
				<RedactProvider autoRedactOnScreenShare>
					<StatusDisplay />
				</RedactProvider>,
			);

			await act(async () => {
				await navigator.mediaDevices.getDisplayMedia();
			});
			await act(async () => {
				await navigator.mediaDevices.getDisplayMedia();
			});
			expect(screen.getByTestId("status")).toHaveTextContent("redacted");

			act(() => {
				trackA.end();
			});
			expect(screen.getByTestId("status")).toHaveTextContent("redacted");

			act(() => {
				trackB.end();
			});
			expect(screen.getByTestId("status")).toHaveTextContent("visible");
		});

		it("fires onEnabledChange the same as any other internally-driven toggle", async () => {
			const onEnabledChange = vi.fn();
			const track = createFakeTrack();
			installMediaDevices(async () => createFakeStream([track]));

			render(
				<RedactProvider autoRedactOnScreenShare onEnabledChange={onEnabledChange}>
					<StatusDisplay />
				</RedactProvider>,
			);

			await act(async () => {
				await navigator.mediaDevices.getDisplayMedia();
			});
			expect(onEnabledChange).toHaveBeenCalledWith(true);

			act(() => {
				track.end();
			});
			expect(onEnabledChange).toHaveBeenLastCalledWith(false);
		});

		it("restores the original getDisplayMedia on unmount", () => {
			const original = async () => createFakeStream([createFakeTrack()]);
			installMediaDevices(original);

			const { unmount } = render(
				<RedactProvider autoRedactOnScreenShare>
					<StatusDisplay />
				</RedactProvider>,
			);
			expect(navigator.mediaDevices.getDisplayMedia).not.toBe(original);

			unmount();
			expect(navigator.mediaDevices.getDisplayMedia).toBe(original);
		});

		it("does not patch getDisplayMedia when the prop is false (default)", () => {
			const original = async () => createFakeStream([createFakeTrack()]);
			installMediaDevices(original);

			render(
				<RedactProvider>
					<StatusDisplay />
				</RedactProvider>,
			);
			expect(navigator.mediaDevices.getDisplayMedia).toBe(original);
		});

		it("does not lose track of an in-progress capture when the consumer passes a fresh onEnabledChange identity every render", async () => {
			// Regression test: a controlled consumer whose `onEnabledChange` is a plain inline arrow
			// function (instead of a bare, stable state setter) gets a new `onEnabledChange` — and
			// therefore a new `setEnabled` — on every re-render. Firing `onEnabledChange` (from
			// onStart below) triggers exactly that: a parent re-render with a fresh callback. Before
			// the fix, that re-render tore down and re-created the screen-share watcher mid-capture,
			// resetting its internal stream count and falsely reporting "idle" while still sharing.
			const trackA = createFakeTrack();
			const trackB = createFakeTrack();
			let call = 0;
			const streams = [createFakeStream([trackA]), createFakeStream([trackB])];
			installMediaDevices(async () => streams[call++]);

			function App() {
				const [enabled, setEnabled] = useState(false);
				return (
					<RedactProvider
						autoRedactOnScreenShare
						enabled={enabled}
						onEnabledChange={(v: boolean) => setEnabled(v)}
					>
						<StatusDisplay />
					</RedactProvider>
				);
			}

			render(<App />);

			await act(async () => {
				await navigator.mediaDevices.getDisplayMedia();
			});
			// Must still report "sharing" immediately after the capture starts, even though the
			// onStart -> onEnabledChange -> setState round trip just forced a parent re-render.
			expect(screen.getByTestId("sharing")).toHaveTextContent("sharing");
			expect(screen.getByTestId("status")).toHaveTextContent("redacted");

			// A second concurrent capture starts. If the watcher had been silently re-patched above,
			// this would look like the *first* concurrent stream to the new instance.
			await act(async () => {
				await navigator.mediaDevices.getDisplayMedia();
			});
			expect(screen.getByTestId("sharing")).toHaveTextContent("sharing");

			// Ending the second stream must NOT restore/idle while the first is still active.
			act(() => {
				trackB.end();
			});
			expect(screen.getByTestId("sharing")).toHaveTextContent("sharing");
			expect(screen.getByTestId("status")).toHaveTextContent("redacted");

			// Only once the first (real, original) stream also ends does it fully idle out.
			act(() => {
				trackA.end();
			});
			expect(screen.getByTestId("sharing")).toHaveTextContent("idle");
			expect(screen.getByTestId("status")).toHaveTextContent("visible");
		});
	});
});

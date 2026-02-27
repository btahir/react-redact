import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RedactProvider } from "../src/redact-provider.js";
import { useRedactMode } from "../src/use-redact-mode.js";

function wrapper({ children }: { children: React.ReactNode }) {
	return <RedactProvider>{children}</RedactProvider>;
}

describe("useRedactMode", () => {
	it("returns isRedacted false initially", () => {
		const { result } = renderHook(() => useRedactMode(), { wrapper });
		expect(result.current.isRedacted).toBe(false);
	});

	it("returns isRedacted true when initial enabled", () => {
		const { result } = renderHook(() => useRedactMode(), {
			wrapper: ({ children }) => <RedactProvider enabled>{children}</RedactProvider>,
		});
		expect(result.current.isRedacted).toBe(true);
	});

	it("enable() sets redacted to true", () => {
		const { result } = renderHook(() => useRedactMode(), { wrapper });
		act(() => result.current.enable());
		expect(result.current.isRedacted).toBe(true);
	});

	it("disable() sets redacted to false", () => {
		const { result } = renderHook(() => useRedactMode(), {
			wrapper: ({ children }) => <RedactProvider enabled>{children}</RedactProvider>,
		});
		act(() => result.current.disable());
		expect(result.current.isRedacted).toBe(false);
	});

	it("toggle() flips state", () => {
		const { result } = renderHook(() => useRedactMode(), { wrapper });
		expect(result.current.isRedacted).toBe(false);
		act(() => result.current.toggle());
		expect(result.current.isRedacted).toBe(true);
		act(() => result.current.toggle());
		expect(result.current.isRedacted).toBe(false);
	});
});

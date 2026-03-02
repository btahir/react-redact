import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RedactProvider } from "../src/redact-provider.js";
import { useRedactPatterns } from "../src/use-redact-patterns.js";

describe("useRedactPatterns", () => {
	it("returns empty values outside provider", () => {
		const { result } = renderHook(() => useRedactPatterns());
		expect(result.current.patternNames).toEqual([]);
		expect(result.current.patterns).toEqual([]);
	});

	it("reads provider autoDetect pattern names", () => {
		const { result } = renderHook(() => useRedactPatterns(), {
			wrapper: ({ children }) => (
				<RedactProvider autoDetect={["email", "phone"]}>{children}</RedactProvider>
			),
		});
		expect(result.current.patternNames).toEqual(["email", "phone"]);
		expect(result.current.patterns.map((p) => p.name)).toEqual(["email", "phone"]);
	});

	it("returns empty arrays when provider autoDetect is false", () => {
		const { result } = renderHook(() => useRedactPatterns(), {
			wrapper: ({ children }) => <RedactProvider autoDetect={false}>{children}</RedactProvider>,
		});
		expect(result.current.patternNames).toEqual([]);
		expect(result.current.patterns).toEqual([]);
	});

	it("addPattern preserves source flags and enforces global matching", () => {
		const { result } = renderHook(() => useRedactPatterns());
		const pattern = result.current.addPattern(/abc\d+/i, "token");
		expect(pattern.regex.flags).toContain("i");
		expect(pattern.regex.flags).toContain("g");
		expect("ABC123".match(pattern.regex)?.[0]).toBe("ABC123");
	});
});

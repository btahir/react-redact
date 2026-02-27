import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RedactAuto } from "../src/redact-auto.jsx";
import { RedactProvider } from "../src/redact-provider.js";

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
});

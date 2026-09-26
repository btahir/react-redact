import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createDemoDocument } from "../src/data";
import { DemoField, DemoProvider } from "../src/fields";
import { RedactAuto } from "../src/redact-auto";
import { RedactProvider } from "../src/redact-provider";

describe("render-time fields and bounded automatic scanning", () => {
	it("never renders a source child in enabled demo SSR output", () => {
		const html = renderToString(
			<DemoProvider document={createDemoDocument()}>
				<DemoField id="customer.email">private-sentinel@example.org</DemoField>
			</DemoProvider>,
		);
		expect(html).not.toContain("private-sentinel");
		expect(html).toContain("example.com");
	});
	it("fails closed for missing policies instead of exposing a supplied original", () => {
		const html = renderToString(
			<DemoProvider document={createDemoDocument()}>
				<DemoField id="not.registered">private-sentinel</DemoField>
			</DemoProvider>,
		);
		expect(html).not.toContain("private-sentinel");
		expect(html).toContain("Unconfigured demo field");
		expect(html).toContain('data-redact-status="missing"');
	});
	it("shows children outside the explicit demo boundary", () => {
		render(<DemoField id="customer.email">Outside demo</DemoField>);
		expect(screen.getByText("Outside demo")).toBeVisible();
	});
	it("updates policies and gives masked fields a useful accessible label", () => {
		const doc = createDemoDocument();
		const { rerender } = render(
			<DemoProvider document={doc}>
				<DemoField id="customer.name" />
			</DemoProvider>,
		);
		const next = {
			...doc,
			fields: doc.fields.map((field) => ({ ...field, behavior: "mask" as const })),
		};
		rerender(
			<DemoProvider document={next}>
				<DemoField id="customer.name" />
			</DemoProvider>,
		);
		expect(screen.getByLabelText("Customer name: hidden for this demo")).toHaveTextContent(
			"••••••",
		);
	});
	it("documents the automatic SSR boundary as a regression contract, not a safety claim", () => {
		const html = renderToString(
			<RedactProvider enabled mode="secure">
				<RedactAuto>raw-sentinel@example.org</RedactAuto>
			</RedactProvider>,
		);
		expect(html).toContain("raw-sentinel@example.org");
	});
});

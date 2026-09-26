import { describe, expect, it } from "vitest";
import { createDemoDocument } from "../src/data";
import { checkSentinels, inspectDemo } from "../src/diagnostics";

describe("bounded preflight", () => {
	it("includes a registered root element and checks its preparation status", () => {
		const doc = createDemoDocument();
		doc.fields = [doc.fields[0]];
		const root = document.createElement("span");
		root.dataset.redactField = "customer.name";
		expect(inspectDemo(root, doc).ready).toBe(false);
		root.dataset.redactStatus = "covered";
		expect(inspectDemo(root, doc).ready).toBe(true);
	});
	it("reports candidates and unsupported media without disclosing page text", () => {
		const root = document.createElement("div");
		root.innerHTML = '<span>secret@example.org</span><iframe></iframe><input value="hidden-token">';
		const result = inspectDemo(root, createDemoDocument());
		expect(result.candidateCount).toBe(1);
		expect(result.unsupported).toContainEqual({ surface: "iframe", count: 1 });
		expect(JSON.stringify(result)).not.toContain("secret@example.org");
		expect(result.ready).toBe(false);
	});
	it("ignores declared generated emails and editor chrome in heuristic scanning", () => {
		const root = document.createElement("div");
		root.innerHTML =
			'<span data-redact-field="customer.email" data-redact-status="covered">sample@example.com</span><aside data-redact-studio>draft@example.com</aside>';
		expect(inspectDemo(root, createDemoDocument()).candidateCount).toBe(0);
	});
	it("checks root attributes and form values and never echoes sentinels", () => {
		const root = document.createElement("input");
		root.setAttribute("aria-label", "private-sentinel");
		root.value = "private-sentinel";
		const result = checkSentinels(root, ["private-sentinel"]);
		expect(result.passed).toBe(false);
		expect(result.matches).toContainEqual({ index: 0, surface: "attribute" });
		expect(result.matches).toContainEqual({ index: 0, surface: "value" });
		expect(JSON.stringify(result)).not.toContain("private-sentinel");
	});
	it("works with a different document and optional absent fields", () => {
		const other = document.implementation.createHTMLDocument();
		const doc = createDemoDocument();
		doc.fields = doc.fields.map((field) => ({ ...field, required: false }));
		expect(inspectDemo(other, doc).ready).toBe(true);
	});
});

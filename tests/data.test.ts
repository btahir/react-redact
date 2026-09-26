import { describe, expect, it } from "vitest";
import {
	createDemoDocument,
	createDemoRecord,
	createIdentity,
	parseDocument,
	sampleField,
	serializeDocument,
	validateDocument,
} from "../src/data";

describe("portable synthetic scenarios", () => {
	it("round trips an independent validated document", () => {
		const document = createDemoDocument();
		const parsed = parseDocument(serializeDocument(document));
		expect(parsed).toEqual(document);
		parsed.fields[0].label = "changed";
		expect(document.fields[0].label).not.toBe("changed");
	});
	it("rejects raw source properties rather than exporting them silently", () => {
		const document = { ...createDemoDocument(), original: "private@example.org" };
		expect(validateDocument(document).valid).toBe(false);
		expect(() => serializeDocument(document)).toThrow("Unknown property");
	});
	it.each([
		"2026-02-30",
		"yesterday",
		"",
		"2026-13-01",
	])("rejects invalid reference date %s", (referenceDate) =>
		expect(validateDocument({ ...createDemoDocument(), referenceDate }).valid).toBe(false));
	it("rejects duplicate and dangerous IDs, unknown field properties and unsupported versions", () => {
		const doc = createDemoDocument();
		expect(validateDocument({ ...doc, fields: [doc.fields[0], doc.fields[0]] }).valid).toBe(false);
		expect(
			validateDocument({ ...doc, fields: [{ ...doc.fields[0], id: "constructor" }] }).valid,
		).toBe(false);
		expect(
			validateDocument({ ...doc, fields: [{ ...doc.fields[0], original: "private" }] }).valid,
		).toBe(false);
		expect(validateDocument({ ...doc, version: 2 }).valid).toBe(false);
	});
	it("rejects unbounded or malformed imports", () => {
		expect(() => parseDocument("x".repeat(256001))).toThrow("256 KB");
		expect(() => parseDocument("{")).toThrow("Invalid JSON");
	});
	it("keeps name/email identity coherent and stable across unrelated field additions", () => {
		const doc = createDemoDocument();
		const before = createDemoRecord(doc, "demo-42");
		doc.fields.unshift({
			id: "extra",
			label: "Extra",
			kind: "text",
			behavior: "sample",
			required: false,
		});
		const after = createDemoRecord(doc, "demo-42");
		expect(after["customer.name"]).toBe(before["customer.name"]);
		const identity = createIdentity(doc.seed, "demo-42");
		expect(after["customer.email"]).toBe(identity.email);
		expect(identity.email.startsWith(identity.name.toLowerCase().replace(" ", "."))).toBe(true);
		expect(after["customer.email"]).toMatch(/@example\.com$/);
		expect(identity.phone).toMatch(/^\+1 202-555-01\d{2}$/);
		expect(createDemoRecord(doc, "demo-43")).not.toEqual(after);
	});
	it("pins version-one default identity and fixture output", () => {
		expect(createIdentity("juniper-2026", "demo-1")).toEqual({
			name: "Jamie Patel",
			email: "jamie.patel.170@example.com",
			company: "Juniper Studio",
			phone: "+1 202-555-0170",
			id: "DEMO-5SCH3U",
		});
		expect(createDemoRecord(createDemoDocument(), "demo-1")).toEqual({
			"customer.name": "Jamie Patel",
			"customer.email": "jamie.patel.170@example.com",
			"customer.company": "Juniper Studio",
			"invoice.total": "$6,849.00",
		});
	});
	it("generates only declared fields, without requiring source data", () => {
		const doc = createDemoDocument();
		expect(Object.keys(createDemoRecord(doc))).toEqual(doc.fields.map((field) => field.id));
	});
	it("uses a fixed six-character mask, regardless of any underlying identity", () => {
		const doc = createDemoDocument();
		const rule = { ...doc.fields[0], behavior: "mask" as const };
		expect(sampleField(doc, rule, "1")).toBe("••••••");
		expect(sampleField(doc, rule, "long-identity")).toBe("••••••");
	});
	it("uses deterministic dates and reserved IPs", () => {
		const doc = createDemoDocument();
		const rule = { ...doc.fields[0], kind: "date" as const };
		expect(sampleField(doc, rule)).toBe(sampleField(doc, rule));
		expect(sampleField(doc, { ...rule, kind: "ip" })).toMatch(/^192\.0\.2\.\d+$/);
	});
	it("keeps generated dates inside the schema's four-digit year range", () => {
		const doc = { ...createDemoDocument(), referenceDate: "9999-12-31" };
		expect(sampleField(doc, { ...doc.fields[0], kind: "date" })).toBe("9999-12-31");
	});
	it("supports explicitly authored samples and hidden labels", () => {
		const doc = createDemoDocument();
		expect(sampleField(doc, { ...doc.fields[0], replacement: "Example person" })).toBe(
			"Example person",
		);
		expect(
			sampleField(doc, { ...doc.fields[0], behavior: "hide", replacement: "Do not show" }),
		).toBe("Hidden");
	});
});

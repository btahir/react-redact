/** Pure, deterministic demo data. No DOM, React, network, or source-value mapping. */
export const DOCUMENT_VERSION = 1 as const;
export const FIELD_KINDS = [
	"name",
	"email",
	"company",
	"phone",
	"amount",
	"date",
	"id",
	"ip",
	"text",
] as const;
export type FieldKind = (typeof FIELD_KINDS)[number];
export type FieldBehavior = "sample" | "mask" | "hide";
export interface FieldRule {
	id: string;
	label: string;
	kind: FieldKind;
	behavior: FieldBehavior;
	required: boolean;
	/** An explicitly authored synthetic value, never an automatically captured original. */
	replacement?: string;
}
export interface DemoDocument {
	version: 1;
	name: string;
	seed: string;
	referenceDate: string;
	fields: FieldRule[];
}
export interface ValidationIssue {
	path: string;
	message: string;
}
export type ValidationResult =
	| { valid: true; document: DemoDocument; issues: [] }
	| { valid: false; issues: ValidationIssue[] };
const ID = /^[a-z][a-z0-9_.-]{0,79}$/;
const FORBIDDEN = new Set(["__proto__", "constructor", "prototype"]);
const object = (value: unknown): value is Record<string, unknown> =>
	value !== null && typeof value === "object" && !Array.isArray(value);

/** Strict allowlist validation prevents silently exporting unknown source-data fields. */
export function validateDocument(input: unknown): ValidationResult {
	const issues: ValidationIssue[] = [];
	const add = (path: string, message: string) => issues.push({ path, message });
	if (!object(input))
		return { valid: false, issues: [{ path: "$", message: "Expected a document object" }] };
	for (const key of Object.keys(input))
		if (!["version", "name", "seed", "referenceDate", "fields"].includes(key))
			add(key, "Unknown property; original data must not be included");
	if (input.version !== 1) add("version", "Expected document version 1");
	for (const key of ["name", "seed"] as const)
		if (typeof input[key] !== "string" || !input[key].trim() || input[key].length > 120)
			add(key, "Use 1–120 characters");
	if (
		typeof input.referenceDate !== "string" ||
		!/^\d{4}-\d{2}-\d{2}$/.test(input.referenceDate) ||
		Number.isNaN(Date.parse(input.referenceDate)) ||
		new Date(input.referenceDate).toISOString().slice(0, 10) !== input.referenceDate
	)
		add("referenceDate", "Use a valid YYYY-MM-DD date");
	if (!Array.isArray(input.fields) || input.fields.length > 200)
		add("fields", "Expected up to 200 field rules");
	else {
		const ids = new Set<string>();
		input.fields.forEach((field: unknown, index: number) => {
			const path = `fields[${index}]`;
			if (!object(field)) {
				add(path, "Expected a field object");
				return;
			}
			for (const key of Object.keys(field))
				if (!["id", "label", "kind", "behavior", "required", "replacement"].includes(key))
					add(`${path}.${key}`, "Unknown property");
			if (
				typeof field.id !== "string" ||
				!ID.test(field.id) ||
				FORBIDDEN.has(field.id) ||
				ids.has(field.id)
			)
				add(`${path}.id`, "Use a unique lowercase semantic ID");
			else ids.add(field.id);
			if (typeof field.label !== "string" || !field.label.trim() || field.label.length > 120)
				add(`${path}.label`, "Use a label of 1–120 characters");
			if (!FIELD_KINDS.includes(field.kind as FieldKind)) add(`${path}.kind`, "Unknown field kind");
			if (!["sample", "mask", "hide"].includes(field.behavior as string))
				add(`${path}.behavior`, "Unknown behavior");
			if (typeof field.required !== "boolean") add(`${path}.required`, "Expected true or false");
			if (
				field.replacement !== undefined &&
				(typeof field.replacement !== "string" || field.replacement.length > 500)
			)
				add(`${path}.replacement`, "Use at most 500 characters of synthetic text");
		});
	}
	if (issues.length) return { valid: false, issues };
	// Return an independent allowlisted value, never the caller's mutable object.
	return { valid: true, document: JSON.parse(JSON.stringify(input)) as DemoDocument, issues: [] };
}
export function parseDocument(json: string): DemoDocument {
	if (json.length > 256_000) throw new Error("Document exceeds 256 KB");
	let value: unknown;
	try {
		value = JSON.parse(json);
	} catch {
		throw new Error("Invalid JSON document");
	}
	const result = validateDocument(value);
	if (!result.valid)
		throw new Error(result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "));
	return result.document;
}
export function serializeDocument(document: DemoDocument): string {
	const result = validateDocument(document);
	if (!result.valid)
		throw new Error(result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "));
	return `${JSON.stringify(result.document, null, 2)}\n`;
}
function hash(value: string): number {
	let result = 2166136261;
	for (let i = 0; i < value.length; i++) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
	return result >>> 0;
}
const FIRST = ["Alex", "Morgan", "Jamie", "Jordan", "Taylor", "Casey", "Robin", "Sam"];
const LAST = ["Reed", "Park", "Rivera", "Chen", "Brooks", "Lane", "Ellis", "Patel"];
const COMPANIES = [
	"Juniper Studio",
	"Northstar Works",
	"Cedar Collective",
	"Orbit Workshop",
	"Morrow Labs",
	"Sunday Supply",
];
export interface DemoIdentity {
	name: string;
	email: string;
	company: string;
	phone: string;
	id: string;
}
/** entityId should be an opaque demo-only key, not a real person's email or identifier. */
export function createIdentity(seed: string, entityId: string): DemoIdentity {
	const key = hash(`${seed}\u0000${entityId}`);
	const first = FIRST[key % FIRST.length];
	const last = LAST[(hash(`${key}:last`) >>> 16) % LAST.length];
	return {
		name: `${first} ${last}`,
		email: `${first.toLowerCase()}.${last.toLowerCase()}.${key % 1000}@example.com`,
		company: COMPANIES[key % COMPANIES.length],
		phone: `+1 202-555-${String(100 + (key % 100)).padStart(4, "0")}`,
		id: `DEMO-${key.toString(36).toUpperCase()}`,
	};
}
export function sampleField(document: DemoDocument, rule: FieldRule, entityId = "demo-1"): string {
	if (rule.behavior === "hide") return "Hidden";
	if (rule.behavior === "mask") return "••••••";
	if (rule.replacement !== undefined) return rule.replacement;
	const identity = createIdentity(document.seed, entityId);
	if (rule.kind in identity) return identity[rule.kind as keyof DemoIdentity];
	const number = hash(`${document.seed}:${entityId}:${rule.id}`);
	switch (rule.kind) {
		case "amount":
			return `$${(100 + (number % 9900)).toLocaleString("en-US")}.00`;
		case "date":
			return new Date(
				Math.min(
					Date.parse("9999-12-31"),
					Date.parse(document.referenceDate) + (number % 30) * 86400000,
				),
			)
				.toISOString()
				.slice(0, 10);
		case "ip":
			return `192.0.2.${1 + (number % 254)}`;
		default:
			return `Sample ${rule.label.toLowerCase()}`;
	}
}
/** Generates ONLY explicitly declared fields. It never accepts or copies a source record. */
export function createDemoRecord(
	document: DemoDocument,
	entityId = "demo-1",
): Record<string, string> {
	const valid = validateDocument(document);
	if (!valid.valid) throw new Error("Invalid demo document");
	return Object.fromEntries(
		valid.document.fields.map((rule) => [rule.id, sampleField(valid.document, rule, entityId)]),
	);
}
export function createDemoDocument(): DemoDocument {
	return {
		version: 1,
		name: "The friendly customer demo",
		seed: "juniper-2026",
		referenceDate: "2026-01-15",
		fields: [
			{
				id: "customer.name",
				label: "Customer name",
				kind: "name",
				behavior: "sample",
				required: true,
			},
			{
				id: "customer.email",
				label: "Email address",
				kind: "email",
				behavior: "sample",
				required: true,
			},
			{
				id: "customer.company",
				label: "Company",
				kind: "company",
				behavior: "sample",
				required: true,
			},
			{
				id: "invoice.total",
				label: "Invoice total",
				kind: "amount",
				behavior: "sample",
				required: false,
			},
		],
	};
}

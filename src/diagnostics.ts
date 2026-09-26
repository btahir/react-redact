import { type DemoDocument, validateDocument } from "./data.js";
export interface FieldCoverage {
	id: string;
	label: string;
	count: number;
	status: "covered" | "missing" | "optional" | "unprepared";
}
export interface PreflightReport {
	version: 1;
	scope: "current-root";
	ready: boolean;
	fields: FieldCoverage[];
	unknownFields: string[];
	unsupported: { surface: string; count: number }[];
	candidateCount: number;
	limitations: string[];
}
export const PREFLIGHT_LIMITATIONS: string[] = [
	"Only the supplied root and current UI state were inspected.",
	"Heuristic candidates can include synthetic values and miss real private data.",
	"Network, application memory, browser chrome, unvisited routes, and pixels inside media are not checked.",
	"Readiness means declared targets are covered, not a privacy or security certification.",
];
function elements(root: ParentNode, selector = "*"): Element[] {
	const own =
		(root as Node).nodeType === 1 && (root as Element).matches(selector) ? [root as Element] : [];
	return [...own, ...root.querySelectorAll(selector)];
}
/** Metadata only. Does not return DOM text or original values in reports. */
export function inspectDemo(root: ParentNode, document: DemoDocument): PreflightReport {
	if (!validateDocument(document).valid) throw new Error("Invalid demo document");
	const counts = new Map<string, number>();
	const unprepared = new Set<string>();
	for (const el of elements(root, "[data-redact-field]")) {
		const id = el.getAttribute("data-redact-field") ?? "";
		counts.set(id, (counts.get(id) ?? 0) + 1);
		if (el.getAttribute("data-redact-status") !== "covered") unprepared.add(id);
	}
	const ids = new Set(document.fields.map((field) => field.id));
	const fields: FieldCoverage[] = document.fields.map((rule) => ({
		id: rule.id,
		label: rule.label,
		count: counts.get(rule.id) ?? 0,
		status: unprepared.has(rule.id)
			? "unprepared"
			: counts.has(rule.id)
				? "covered"
				: rule.required
					? "missing"
					: "optional",
	}));
	const unsupported = ["iframe", "canvas", "video", "img", "input", "textarea"]
		.map((surface) => ({ surface, count: elements(root, surface).length }))
		.filter((item) => item.count > 0);
	let candidateCount = 0;
	// Inspect text without retaining it. Explicit fields and editor chrome are excluded.
	const owner = (root as Node).nodeType === 9 ? (root as Document) : root.ownerDocument;
	if (owner) {
		const walker = owner.createTreeWalker(root as Node, 4);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			if (node.parentElement?.closest("[data-redact-field], [data-redact-studio], script, style"))
				continue;
			candidateCount +=
				node.textContent?.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\d{3}-\d{2}-\d{4}\b/gi)?.length ?? 0;
		}
	}
	const unknownFields = [...counts.keys()].filter((id) => !ids.has(id));
	return {
		version: 1,
		scope: "current-root",
		ready:
			fields.every((field) => field.status !== "missing" && field.status !== "unprepared") &&
			unknownFields.length === 0,
		fields,
		unknownFields,
		unsupported,
		candidateCount,
		limitations: [...PREFLIGHT_LIMITATIONS],
	};
}
export interface SentinelResult {
	passed: boolean;
	matches: { index: number; surface: "text" | "attribute" | "value" }[];
}
/** For synthetic fixture sentinels only. Reports indices, never the sentinel or page content. */
export function checkSentinels(root: ParentNode, sentinels: string[]): SentinelResult {
	const matches: SentinelResult["matches"] = [];
	sentinels.forEach((sentinel, index) => {
		if (!sentinel) return;
		if (root.textContent?.includes(sentinel)) matches.push({ index, surface: "text" });
		for (const el of elements(root)) {
			if ([...el.attributes].some((attr) => attr.value.includes(sentinel)))
				matches.push({ index, surface: "attribute" });
			if ("value" in el && typeof el.value === "string" && el.value.includes(sentinel))
				matches.push({ index, surface: "value" });
		}
	});
	return { passed: matches.length === 0, matches };
}

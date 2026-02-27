import type { BuiltInPatternName } from "./patterns/index.js";
import { getPatterns, matchCreditCard } from "./patterns/index.js";
import { getTextNodes } from "./utils/dom-walker.js";

const DEBOUNCE_MS = 100;

export interface ScanOptions {
	patternNames: BuiltInPatternName[];
	customPatterns?: RegExp[];
}

export interface Match {
	index: number;
	length: number;
	text: string;
	hint?: string;
}

function findMatches(
	text: string,
	patternNames: BuiltInPatternName[],
	customPatterns: RegExp[],
): Match[] {
	const matches: Match[] = [];
	const seen = new Set<string>();

	function add(start: number, len: number, hint?: string) {
		const key = `${start}-${len}`;
		if (seen.has(key)) return;
		seen.add(key);
		matches.push({
			index: start,
			length: len,
			text: text.slice(start, start + len),
			hint,
		});
	}

	for (const name of patternNames) {
		if (name === "credit-card") {
			for (const { match, index } of matchCreditCard(text)) {
				add(index, match.length, "credit-card");
			}
			continue;
		}
		const config = getPatterns([name])[0];
		const r = new RegExp(config.regex.source, "g");
		let m = r.exec(text);
		while (m !== null) {
			add(m.index, m[0].length, config.name as string);
			m = r.exec(text);
		}
	}
	for (const re of customPatterns) {
		const r = new RegExp(re.source, "g");
		let m = r.exec(text);
		while (m !== null) {
			add(m.index, m[0].length);
			m = r.exec(text);
		}
	}

	// Sort by index so we can merge overlapping and apply in reverse order
	matches.sort((a, b) => a.index - b.index);
	return matches;
}

/**
 * Wrap matching ranges in a text node with <span data-redact data-redact-hint="...">.
 * Splits the text node into (before, span, after) and repeats for each match.
 */
function wrapMatchesInTextNode(
	node: Text,
	matches: Match[],
	createSpan: (text: string, hint?: string) => HTMLSpanElement,
): void {
	if (matches.length === 0) return;
	const text = node.textContent ?? "";
	const parent = node.parentNode;
	if (!parent) return;

	const sorted = [...matches].sort((a, b) => a.index - b.index);
	const frag = document.createDocumentFragment();
	let last = 0;
	for (const m of sorted) {
		if (m.index > last) {
			frag.appendChild(document.createTextNode(text.slice(last, m.index)));
		}
		const span = createSpan(m.text, m.hint);
		frag.appendChild(span);
		last = m.index + m.length;
	}
	if (last < text.length) {
		frag.appendChild(document.createTextNode(text.slice(last)));
	}
	parent.replaceChild(frag, node);
}

// Merge overlapping matches: keep non-overlapping set by start index, drop if overlap
function mergeMatches(matches: Match[]): Match[] {
	if (matches.length <= 1) return matches;
	const out: Match[] = [];
	let lastEnd = -1;
	for (const m of matches) {
		if (m.index >= lastEnd) {
			out.push(m);
			lastEnd = m.index + m.length;
		}
	}
	return out;
}

export function scanRoot(
	root: HTMLElement,
	options: ScanOptions,
	createSpan: (text: string, hint?: string) => HTMLSpanElement,
): void {
	const { patternNames, customPatterns = [] } = options;
	const pairs = getTextNodes(root);
	for (const { node, text } of pairs) {
		// Skip if already inside a redact span
		let el: Node | null = node.parentElement;
		while (el && el !== root) {
			if (el.hasAttribute?.("data-redact")) break;
			el = el.parentElement;
		}
		if (el?.hasAttribute?.("data-redact")) continue;

		const matches = findMatches(text, patternNames, customPatterns);
		const merged = mergeMatches(matches);
		if (merged.length > 0) {
			wrapMatchesInTextNode(node, merged, createSpan);
		}
	}
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleScan(
	root: HTMLElement,
	options: ScanOptions,
	createSpan: (text: string, hint?: string) => HTMLSpanElement,
): void {
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		debounceTimer = null;
		scanRoot(root, options, createSpan);
	}, DEBOUNCE_MS);
}
